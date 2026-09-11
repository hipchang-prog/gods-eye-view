# Production deployment (Docker / Coolify)

This deployment runs `node server/production.mjs`. It does **not** run the Vite
dev server or `vite preview`. The Node process serves the compiled `dist/`
application, `/healthz`, and the production-safe API middleware exported by
`vite.config.js`.

## Build and run locally

Use a supported Node release (24.14.x or 26.x):

```sh
npm ci
npm test
npm run build
HOST=127.0.0.1 PORT=3000 npm start
```

Or build the production image:

```sh
docker build -t gods-eye-view \
  --build-arg GOOGLE_MAPS_API_KEY="$GOOGLE_MAPS_API_KEY" \
  --build-arg CESIUM_ION_TOKEN="$CESIUM_ION_TOKEN" .
docker run --rm --read-only --tmpfs /tmp --tmpfs /app/.gev-cache \
  --tmpfs /app/.gev-logs -e OPENAI_API_KEY -e GOOGLE_SERVER_API_KEY \
  -p 127.0.0.1:3000:3000 gods-eye-view
```

The local `docker run` mapping is only an example for loopback testing. The
Coolify compose service intentionally has **no `ports` mapping**; only the
proxy on the external `coolify` network can reach container port 3000.

## Environment separation

**Build-time, browser-visible values**

- `GOOGLE_MAPS_API_KEY`
- `CESIUM_ION_TOKEN`

Vite embeds these values into browser JavaScript. They are not secrets. Apply
provider-side HTTP referrer/hostname restrictions for
`https://godseye.778815.xyz/*`, quota limits, and the minimum required APIs.
Docker build arguments can also appear in build metadata/cache, so never use a
server credential as a build argument.

**Runtime values (secrets)**

- `GOOGLE_SERVER_API_KEY` is used only by the same-origin Google Places and
  Street View middleware. Use a separate server-restricted credential; production
  deliberately clears the middleware's legacy key slot when this variable is
  absent and never falls back to the browser-visible `GOOGLE_MAPS_API_KEY`.
- `OPENSKY_CLIENT_ID`, `OPENSKY_CLIENT_SECRET`, `OPENSKY_USERNAME`,
  `OPENSKY_PASSWORD`, `OPENSKY_AUTH_MODE`
- `OPENAI_API_KEY`, `AISSTREAM_API_KEY`, `TOMTOM_API_KEY`,
  `TOMTOM_DAILY_TILE_BUDGET`, `FIRMS_MAP_KEY`, `LL2_API_TOKEN`, `TFL_APP_KEY`
- Cost guards: `GEV_RATELIMIT_OPENAI_PER_MIN` (default `30`) and
  `GEV_RATELIMIT_GOOGLE_PER_MIN` (default `120`). Missing or invalid values use
  these bounded per-client defaults. Google Places and CCTV Street View fallback
  share the Google limiter.
- CCTV relay guards: `GEV_CCTV_MEDIA_PER_CLIENT` (default `2`, clamped `1..10`),
  `GEV_CCTV_MEDIA_GLOBAL` (default `50`, clamped `2..500`), and
  `GEV_CCTV_MEDIA_MAX_LIFETIME_MS` (default `300000`, clamped
  `1000..3600000`). Client saturation returns 429, global saturation returns
  503, and relays are terminated at the configured lifetime.
- `TRUST_PROXY_CIDRS`: comma-separated proxy network CIDRs whose forwarding
  headers may be trusted. The default is empty (trust no proxy headers).

Set these in Coolify's runtime environment/secret UI. Do not prefix secrets
with `VITE_`, do not add them as Docker build arguments, and do not commit an
`.env` file. The production server does not mount the development Provider
Settings endpoints, so it cannot write credentials or restart Vite.

## Coolify and Cloudflare

1. Create or verify the external Docker network named `coolify`.
2. Deploy this repository/compose file in Coolify. Set the two public build
   values separately from runtime secrets.
3. Point the Cloudflare DNS record `godseye.778815.xyz` at the Coolify host.
   Enable proxying after origin TLS works. Use Full (strict) TLS and let
   Coolify/Traefik or Caddy obtain and renew the origin certificate.
4. The compose labels cover Traefik and caddy-docker-proxy. Keep the label set
   for the proxy actually installed and ensure its HTTPS entrypoint/network
   names match the host. Do not publish port 3000 on the host.
5. Set `TRUST_PROXY_CIDRS` to the exact Coolify/Traefik or Caddy source network
   CIDR(s), and configure that proxy to replace rather than append untrusted
   forwarding headers. The application accepts the left-most `Forwarded` or
   `X-Forwarded-For` address only when the socket peer matches that allowlist;
   otherwise it rate-limits by the socket address.
6. Verify `https://godseye.778815.xyz/healthz`, a deep SPA route, and an API
   route such as `/api/tomtom/status` after deployment.

Connecting a Git repository does not itself authorize automatic deployments.
In Coolify, install/authorize its GitHub App (or configure a deploy webhook),
grant it access to this repository, enable automatic deployment for the target
branch, and confirm a push produces a webhook delivery and deployment. Branch
protection and GitHub organization approval can require additional approval.

## API middleware scope

The production adapter reuses the existing `configureServer` middleware for:
OpenSky, CelesTrak, TomTom, NASA FIRMS, Launch Library 2, terrain heights,
ADSBdb, Overpass/OSRM, military installations, regional brief, weather effects,
CCTV, Radio Browser, GBFS, adsb.lol, AIS live, track backfill, OpenAI realtime /
HUD summary (but not its development debug-log route), and Google Places context.

The adapter calls those hooks directly on a Connect-compatible facade; it does
not invoke Vite, transform HTML, watch files, enable HMR, or run a preview
server. The development-only `/api/setup/status` and `/api/setup/keys` routes
are intentionally excluded because they write local credentials and call
`server.restart()`.

There is no inbound Vite/HMR WebSocket route to preserve. AIS uses an outbound
`ws` client from the Node process; its existing HTTP-server close listener is
preserved for shutdown. Plugin `closeBundle` hooks are not used (that is a
Rollup lifecycle), so any future API plugin that depends only on `closeBundle`
or Vite's `server.ws` must receive an explicit production lifecycle adapter
before it can be added to the allowlist.
