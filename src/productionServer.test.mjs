import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createProductionServer, resolveCctvMediaLimits } from '../server/production.mjs';

async function fixtureServer(options = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'gev-production-'));
  const distDir = path.join(root, 'dist');
  await mkdir(path.join(distDir, 'assets'), { recursive: true });
  await writeFile(path.join(distDir, 'index.html'), '<!doctype html><title>GEV production fixture</title>');
  await writeFile(path.join(distDir, 'assets', 'app-a1b2c3.js'), 'globalThis.GEV_FIXTURE = true;');
  await writeFile(path.join(root, 'outside-secret.txt'), 'must-not-be-served');
  const server = await createProductionServer({ distDir, ...options });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  return {
    origin: `http://127.0.0.1:${port}`,
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
      await rm(root, { recursive: true, force: true });
    },
  };
}

async function rawRequest(port, requestPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path: requestPath }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8'), headers: res.headers }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('production server exposes an uncached health endpoint', async (t) => {
  const fixture = await fixtureServer({ apiPlugins: [] });
  t.after(fixture.close);
  const response = await fetch(`${fixture.origin}/healthz`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('production server serves hashed assets with immutable caching and SPA routes without caching', async (t) => {
  const fixture = await fixtureServer({ apiPlugins: [] });
  t.after(fixture.close);
  const asset = await fetch(`${fixture.origin}/assets/app-a1b2c3.js`);
  assert.equal(asset.status, 200);
  assert.equal(asset.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  assert.match(await asset.text(), /GEV_FIXTURE/);

  const route = await fetch(`${fixture.origin}/operations/pacific`);
  assert.equal(route.status, 200);
  assert.equal(route.headers.get('cache-control'), 'no-cache');
  assert.match(await route.text(), /GEV production fixture/);
});

test('production server rejects encoded traversal instead of leaking files or falling back to the SPA', async (t) => {
  const fixture = await fixtureServer({ apiPlugins: [] });
  t.after(fixture.close);
  const port = Number(new URL(fixture.origin).port);
  const response = await rawRequest(port, '/%2e%2e/outside-secret.txt');
  assert.equal(response.status, 400);
  assert.doesNotMatch(response.body, /must-not-be-served|GEV production fixture/);
});

test('production server rejects NUL, backslash, and malformed request paths', async (t) => {
  const fixture = await fixtureServer({ apiPlugins: [] });
  t.after(fixture.close);
  const port = Number(new URL(fixture.origin).port);
  for (const unsafePath of ['/%00secret', '/assets%5csecret', '/assets\\secret', '/bad%E0%A4%A']) {
    const response = await rawRequest(port, unsafePath);
    assert.equal(response.status, 400, unsafePath);
    assert.equal(response.body, 'Bad Request', unsafePath);
  }
});

test('production adapter mounts an existing Vite API plugin without running Vite', async (t) => {
  const fixture = await fixtureServer();
  t.after(fixture.close);
  const response = await fetch(`${fixture.origin}/api/tomtom/status`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.equal(typeof body.hasKey, 'boolean');
  assert.equal(typeof body.dailyCount, 'number');
});

function clientAddressProbe() {
  return {
    name: 'forwarded-address-probe',
    configureServer(server) {
      server.middlewares.use('/api/client-address', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ address: req.gevClientAddress }));
      });
    },
  };
}

test('production server rejects spoofed proxy headers by default', async (t) => {
  const fixture = await fixtureServer({ apiPlugins: [clientAddressProbe()] });
  t.after(fixture.close);
  const response = await fetch(`${fixture.origin}/api/client-address`, {
    headers: { 'X-Forwarded-For': '203.0.113.8, 10.0.0.2' },
  });
  const body = await response.json();
  assert.notEqual(body.address, '203.0.113.8');
  assert.match(body.address, /127\.0\.0\.1$/);
});

test('production server accepts proxy headers only from an explicitly trusted CIDR', async (t) => {
  const fixture = await fixtureServer({
    apiPlugins: [clientAddressProbe()],
    trustProxyCidrs: ['127.0.0.0/8'],
  });
  t.after(fixture.close);
  const response = await fetch(`${fixture.origin}/api/client-address`, {
    headers: { Forwarded: 'for="[2001:db8::1234]:443"' },
  });
  assert.deepEqual(await response.json(), { address: '2001:db8::1234' });
});

test('production does not mount the realtime debug-log endpoint', async (t) => {
  const fixture = await fixtureServer();
  t.after(fixture.close);
  const response = await fetch(`${fixture.origin}/api/realtime/debug-log`);
  assert.equal(response.status, 404);
});

test('compose config supplies bounded paid-provider limits and explicit proxy trust', async () => {
  const compose = await readFile(new URL('../docker-compose.yml', import.meta.url), 'utf8');
  assert.match(compose, /GEV_RATELIMIT_OPENAI_PER_MIN: \$\{GEV_RATELIMIT_OPENAI_PER_MIN:-30\}/);
  assert.match(compose, /GEV_RATELIMIT_GOOGLE_PER_MIN: \$\{GEV_RATELIMIT_GOOGLE_PER_MIN:-120\}/);
  assert.match(compose, /TRUST_PROXY_CIDRS: \$\{TRUST_PROXY_CIDRS:-\}/);
  assert.match(compose, /GOOGLE_SERVER_API_KEY: \$\{GOOGLE_SERVER_API_KEY:-\}/);
  assert.equal(compose.match(/^\s+GOOGLE_MAPS_API_KEY:/gm)?.length, 1);
  assert.match(compose, /GEV_CCTV_MEDIA_PER_CLIENT: \$\{GEV_CCTV_MEDIA_PER_CLIENT:-2\}/);
  assert.match(compose, /GEV_CCTV_MEDIA_GLOBAL: \$\{GEV_CCTV_MEDIA_GLOBAL:-50\}/);
  assert.match(compose, /GEV_CCTV_MEDIA_MAX_LIFETIME_MS: \$\{GEV_CCTV_MEDIA_MAX_LIFETIME_MS:-300000\}/);
});

test('production runtime does not silently use the browser Google key', async (t) => {
  const previousBrowserKey = process.env.GOOGLE_MAPS_API_KEY;
  const previousServerKey = process.env.GOOGLE_SERVER_API_KEY;
  process.env.GOOGLE_MAPS_API_KEY = 'browser-only-key';
  delete process.env.GOOGLE_SERVER_API_KEY;
  t.after(() => {
    if (previousBrowserKey === undefined) delete process.env.GOOGLE_MAPS_API_KEY;
    else process.env.GOOGLE_MAPS_API_KEY = previousBrowserKey;
    if (previousServerKey === undefined) delete process.env.GOOGLE_SERVER_API_KEY;
    else process.env.GOOGLE_SERVER_API_KEY = previousServerKey;
  });
  const fixture = await fixtureServer();
  t.after(fixture.close);
  const response = await fetch(`${fixture.origin}/api/google/nearby-places`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { configured: false, error: null, places: [] });
});

test('CCTV media environment limits have defaults and hard lower and upper bounds', () => {
  assert.deepEqual(resolveCctvMediaLimits({
    GEV_CCTV_MEDIA_PER_CLIENT: '',
    GEV_CCTV_MEDIA_GLOBAL: 'invalid',
  }), { perClient: 2, global: 50, maxLifetimeMs: 300_000 });
  assert.deepEqual(resolveCctvMediaLimits({
    GEV_CCTV_MEDIA_PER_CLIENT: '0',
    GEV_CCTV_MEDIA_GLOBAL: '999999',
    GEV_CCTV_MEDIA_MAX_LIFETIME_MS: '-1',
  }), { perClient: 1, global: 500, maxLifetimeMs: 1_000 });
  assert.deepEqual(resolveCctvMediaLimits({
    GEV_CCTV_MEDIA_PER_CLIENT: '999',
    GEV_CCTV_MEDIA_GLOBAL: '0',
    GEV_CCTV_MEDIA_MAX_LIFETIME_MS: '999999999',
  }), { perClient: 10, global: 2, maxLifetimeMs: 3_600_000 });
});

function heldMediaPlugin() {
  return {
    name: 'held-cctv-media',
    configureServer(server) {
      server.middlewares.use('/api/cctv/media', (req, res) => {
        if (String(req.url).startsWith('/complete')) {
          res.end('ok');
          return;
        }
        req.gevCctvMediaSignal?.addEventListener('abort', () => {
          if (res.headersSent) res.destroy();
        }, { once: true });
      });
    },
  };
}

test('production bounds CCTV media concurrency and releases slots on close', async (t) => {
  const fixture = await fixtureServer({
    apiPlugins: [heldMediaPlugin()],
    trustProxyCidrs: ['127.0.0.0/8'],
    cctvMediaLimits: { perClient: 1, global: 2, maxLifetimeMs: 5_000 },
  });
  t.after(fixture.close);
  const held = (pathName, address, signal) => fetch(`${fixture.origin}/api/cctv/media/${pathName}`, {
    headers: { 'X-Forwarded-For': address }, signal,
  }).catch(() => null);
  assert.equal((await held('complete-one', '203.0.113.1')).status, 200);
  assert.equal((await held('complete-two', '203.0.113.1')).status, 200);
  const firstController = new AbortController();
  const first = held('one', '203.0.113.1', firstController.signal);
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal((await held('same-client', '203.0.113.1')).status, 429);
  const secondController = new AbortController();
  const second = held('two', '203.0.113.2', secondController.signal);
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal((await held('global', '203.0.113.3')).status, 503);
  firstController.abort();
  await first;
  await new Promise((resolve) => setTimeout(resolve, 30));
  const replacementController = new AbortController();
  const replacement = held('replacement', '203.0.113.1', replacementController.signal);
  await new Promise((resolve) => setTimeout(resolve, 30));
  replacementController.abort();
  secondController.abort();
  await Promise.all([replacement, second]);
});

test('production terminates CCTV media relays at their maximum lifetime', async (t) => {
  const fixture = await fixtureServer({
    apiPlugins: [heldMediaPlugin()],
    cctvMediaLimits: { perClient: 1, global: 2, maxLifetimeMs: 40 },
  });
  t.after(fixture.close);
  const response = await fetch(`${fixture.origin}/api/cctv/media/camera`);
  assert.equal(response.status, 504);
});

test('production paid OpenAI endpoint has a mandatory default per-client limit', async (t) => {
  const previous = process.env.GEV_RATELIMIT_OPENAI_PER_MIN;
  delete process.env.GEV_RATELIMIT_OPENAI_PER_MIN;
  t.after(() => {
    if (previous === undefined) delete process.env.GEV_RATELIMIT_OPENAI_PER_MIN;
    else process.env.GEV_RATELIMIT_OPENAI_PER_MIN = previous;
  });
  const fixture = await fixtureServer();
  t.after(fixture.close);
  let response;
  for (let index = 0; index < 31; index += 1) response = await fetch(`${fixture.origin}/api/realtime/token`);
  assert.equal(response.status, 429);
});

test('production paid Google endpoint has a mandatory default per-client limit', async (t) => {
  const previousLimit = process.env.GEV_RATELIMIT_GOOGLE_PER_MIN;
  const previousKey = process.env.GOOGLE_SERVER_API_KEY;
  delete process.env.GEV_RATELIMIT_GOOGLE_PER_MIN;
  process.env.GOOGLE_SERVER_API_KEY = 'test-key';
  t.after(() => {
    if (previousLimit === undefined) delete process.env.GEV_RATELIMIT_GOOGLE_PER_MIN;
    else process.env.GEV_RATELIMIT_GOOGLE_PER_MIN = previousLimit;
    if (previousKey === undefined) delete process.env.GOOGLE_SERVER_API_KEY;
    else process.env.GOOGLE_SERVER_API_KEY = previousKey;
  });
  const fixture = await fixtureServer();
  t.after(fixture.close);
  let response;
  for (let index = 0; index < 121; index += 1) {
    response = await fetch(`${fixture.origin}/api/google/nearby-places`);
  }
  assert.equal(response.status, 429);
});

test('production CCTV Street View fallback shares the mandatory Google limit', async (t) => {
  const previousServerKey = process.env.GOOGLE_SERVER_API_KEY;
  process.env.GOOGLE_SERVER_API_KEY = 'test-key';
  t.after(() => {
    if (previousServerKey === undefined) delete process.env.GOOGLE_SERVER_API_KEY;
    else process.env.GOOGLE_SERVER_API_KEY = previousServerKey;
  });
  const fixture = await fixtureServer();
  t.after(fixture.close);
  const response = await fetch(`${fixture.origin}/api/cctv/frame/unregistered?lat=1&lon=1`);
  assert.equal(response.status, 429);
});
