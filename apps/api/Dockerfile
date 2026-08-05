FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/storefront/package.json ./apps/storefront/
COPY apps/admin/package.json ./apps/admin/
COPY packages/secure-api/package.json ./packages/secure-api/
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY apps/api ./apps/api
COPY packages ./packages
WORKDIR /app/apps/api
RUN npx prisma generate && npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PATH="/app/node_modules/.bin:$PATH"
WORKDIR /app/apps/api

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/apps/api/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh \
  && chown -R node:node /app

USER node
EXPOSE 3001
ENTRYPOINT ["./docker-entrypoint.sh"]
