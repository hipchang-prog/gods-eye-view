import { access } from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import connect from 'connect';
import sirv from 'sirv';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const defaultDistDir = path.resolve(moduleDir, '..', 'dist');
const HASHED_ASSET_RE = /(?:^|\/)assets\/[^/]+-[a-z0-9_-]{6,}\.[^/]+$/i;

function normalizeIpAddress(value) {
  let address = String(value || '').trim();
  const zoneIndex = address.indexOf('%');
  if (zoneIndex !== -1) address = address.slice(0, zoneIndex);
  if (address.toLowerCase().startsWith('::ffff:') && net.isIP(address.slice(7)) === 4) return address.slice(7);
  return net.isIP(address) ? address : null;
}

function buildTrustedProxyList(cidrs) {
  const blockList = new net.BlockList();
  for (const entry of cidrs) {
    const value = String(entry || '').trim();
    if (!value) continue;
    const slash = value.lastIndexOf('/');
    const address = normalizeIpAddress(slash === -1 ? value : value.slice(0, slash));
    const family = net.isIP(address);
    const maxPrefix = family === 4 ? 32 : family === 6 ? 128 : 0;
    const prefix = slash === -1 ? maxPrefix : Number(value.slice(slash + 1));
    if (!maxPrefix || !Number.isInteger(prefix) || prefix < 0 || prefix > maxPrefix) {
      throw new Error(`Invalid TRUST_PROXY_CIDRS entry: ${value}`);
    }
    blockList.addSubnet(address, prefix, family === 4 ? 'ipv4' : 'ipv6');
  }
  return blockList;
}

function proxyCidrs(value = process.env.TRUST_PROXY_CIDRS) {
  if (Array.isArray(value)) return value;
  return String(value || '').split(',').map((entry) => entry.trim()).filter(Boolean);
}

function normalizedProxyAddress(req, trustedProxies) {
  const peer = normalizeIpAddress(req.socket?.remoteAddress) || String(req.socket?.remoteAddress || 'local');
  const peerFamily = net.isIP(peer);
  if (!peerFamily || !trustedProxies.check(peer, peerFamily === 4 ? 'ipv4' : 'ipv6')) return peer;
  const forwarded = String(req.headers.forwarded || '')
    .split(',')[0]
    .split(';')
    .map((part) => part.trim())
    .find((part) => /^for=/i.test(part));
  let candidate = forwarded?.replace(/^for=/i, '').replace(/^"|"$/g, '')
    || String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (!candidate) return peer;
  if (candidate.startsWith('[')) candidate = candidate.slice(1, candidate.indexOf(']'));
  else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(candidate)) candidate = candidate.slice(0, candidate.lastIndexOf(':'));
  return normalizeIpAddress(candidate) || peer;
}

function safeRequestPath(req, res, next) {
  const rawPath = String(req.url || '/').split('?')[0];
  let decoded;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('Bad Request');
    return;
  }
  const segments = decoded.split('/');
  if (decoded.includes('\0') || decoded.includes('\\') || segments.includes('..') || rawPath.startsWith('//')) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('Bad Request');
    return;
  }
  next();
}

function boundedInteger(value, fallback, min, max) {
  if (value === undefined || value === null || String(value).trim() === '') return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
}

export function resolveCctvMediaLimits(env = process.env) {
  return {
    perClient: boundedInteger(env.GEV_CCTV_MEDIA_PER_CLIENT, 2, 1, 10),
    global: boundedInteger(env.GEV_CCTV_MEDIA_GLOBAL, 50, 2, 500),
    maxLifetimeMs: boundedInteger(env.GEV_CCTV_MEDIA_MAX_LIFETIME_MS, 300_000, 1_000, 3_600_000),
  };
}

function cctvMediaGuard({ perClient, global, maxLifetimeMs }) {
  const clients = new Map();
  let active = 0;
  return (req, res, next) => {
    const pathname = String(req.url || '/').split('?')[0];
    if (!pathname.startsWith('/api/cctv/media/')) return next();
    const client = String(req.gevClientAddress || req.socket?.remoteAddress || 'local');
    const clientActive = clients.get(client) || 0;
    if (clientActive >= perClient) {
      res.writeHead(429, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Retry-After': '5' });
      res.end(JSON.stringify({ error: 'Too many concurrent CCTV media relays for this client' }));
      return;
    }
    if (active >= global) {
      res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Retry-After': '5' });
      res.end(JSON.stringify({ error: 'CCTV media relay capacity reached' }));
      return;
    }

    active += 1;
    clients.set(client, clientActive + 1);
    const controller = new AbortController();
    req.gevCctvMediaSignal = controller.signal;
    let released = false;
    let timer;
    const release = () => {
      if (released) return;
      released = true;
      clearTimeout(timer);
      active -= 1;
      const remaining = (clients.get(client) || 1) - 1;
      if (remaining > 0) clients.set(client, remaining);
      else clients.delete(client);
      controller.abort(new DOMException('CCTV media relay closed', 'AbortError'));
    };
    timer = setTimeout(() => {
      if (!res.headersSent) {
        res.writeHead(504, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ error: 'CCTV media relay lifetime exceeded' }));
      } else {
        res.destroy();
      }
      controller.abort(new DOMException('CCTV media relay lifetime exceeded', 'TimeoutError'));
    }, maxLifetimeMs);
    timer.unref?.();
    res.once('finish', release);
    res.once('close', release);
    next();
  };
}

function securityHeaders(trustedProxies) {
  return (req, res, next) => {
    req.gevClientAddress = normalizedProxyAddress(req, trustedProxies);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=(self)');
    next();
  };
}

function staticCacheHeaders(res, filePath) {
  const normalized = filePath.split(path.sep).join('/');
  if (path.basename(filePath) === 'index.html') {
    res.setHeader('Cache-Control', 'no-cache');
  } else if (HASHED_ASSET_RE.test(normalized)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}

async function defaultApiPlugins() {
  // Production server middleware must never inherit the browser-visible build
  // key. Existing API plugins read this legacy process key at request time.
  process.env.GOOGLE_MAPS_API_KEY = process.env.GOOGLE_SERVER_API_KEY || '';
  const { productionApiPlugins } = await import('../vite.config.js');
  return productionApiPlugins();
}

/**
 * Build the production HTTP server without listening.
 * The injected plugin option exists for isolated tests; production uses the
 * explicitly allowlisted API plugins exported by vite.config.js.
 */
export async function createProductionServer({
  distDir = defaultDistDir,
  apiPlugins,
  trustProxyCidrs,
  cctvMediaLimits,
} = {}) {
  const absoluteDist = path.resolve(distDir);
  await access(path.join(absoluteDist, 'index.html'));
  const trustedProxies = buildTrustedProxyList(proxyCidrs(trustProxyCidrs));

  const app = connect();
  const server = http.createServer((req, res) => {
    app(req, res, (error) => {
      if (res.headersSent) {
        if (error) res.destroy(error);
        return;
      }
      if (error) {
        console.error('[production] request failed:', error?.message || error);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end('Not Found');
    });
  });

  app.use(securityHeaders(trustedProxies));
  app.use(safeRequestPath);
  app.use(cctvMediaGuard(cctvMediaLimits || resolveCctvMediaLimits()));
  app.use('/healthz', (req, res) => {
    if (req.url !== '/' || !['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end('Not Found');
      return;
    }
    const body = JSON.stringify({ status: 'ok' });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
  });

  const plugins = apiPlugins ?? await defaultApiPlugins();
  const facade = { middlewares: app, httpServer: server, config: { mode: 'production' } };
  for (const plugin of plugins) {
    if (typeof plugin?.configureServer === 'function') await plugin.configureServer(facade);
  }

  const serveStatic = sirv(absoluteDist, {
    etag: true,
    gzip: true,
    brotli: true,
    setHeaders: staticCacheHeaders,
  });
  app.use((req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method)) return next();
    return serveStatic(req, res, next);
  });
  app.use((req, res, next) => {
    const pathname = String(req.url || '/').split('?')[0];
    if (!['GET', 'HEAD'].includes(req.method) || pathname.startsWith('/api/') || path.posix.extname(pathname)) return next();
    const originalUrl = req.url;
    req.url = '/index.html';
    serveStatic(req, res, (error) => {
      req.url = originalUrl;
      next(error);
    });
  });

  server.requestTimeout = 30_000;
  server.headersTimeout = 35_000;
  server.keepAliveTimeout = 5_000;
  return server;
}

export function installGracefulShutdown(server, { timeoutMs = 10_000 } = {}) {
  let stopping = false;
  const shutdown = (signal) => {
    if (stopping) return;
    stopping = true;
    console.info(`[production] ${signal} received; draining connections`);
    server.close((error) => {
      if (error) {
        console.error('[production] shutdown failed:', error.message);
        process.exitCode = 1;
      }
    });
    server.closeIdleConnections?.();
    const timer = setTimeout(() => server.closeAllConnections?.(), timeoutMs);
    timer.unref();
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  return shutdown;
}

async function main() {
  const host = process.env.HOST || '0.0.0.0';
  const port = Number.parseInt(process.env.PORT || '3000', 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535');
  const server = await createProductionServer();
  installGracefulShutdown(server);
  server.listen(port, host, () => console.info(`[production] listening on http://${host}:${port}`));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error('[production] startup failed:', error?.message || error);
    process.exitCode = 1;
  });
}
