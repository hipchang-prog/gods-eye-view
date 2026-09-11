# syntax=docker/dockerfile:1.7

FROM node:24.14.0-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# These two values are intentionally public browser credentials. Restrict them
# by hostname/provider policy; never pass server-side secrets as build args.
ARG GOOGLE_MAPS_API_KEY=""
ARG CESIUM_ION_TOKEN=""
ENV GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY} \
    CESIUM_ION_TOKEN=${CESIUM_ION_TOKEN}
RUN npm run build

FROM node:24.14.0-bookworm-slim AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/server ./server
COPY --from=build --chown=node:node /app/vite.config.js ./vite.config.js
COPY --from=build --chown=node:node /app/src ./src
COPY --from=build --chown=node:node /app/scripts ./scripts
RUN mkdir -p .gev-cache .gev-logs && chown node:node .gev-cache .gev-logs

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
CMD ["npm", "start"]
