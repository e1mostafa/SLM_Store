FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# Dependencies
FROM base AS deps
COPY package.json ./
RUN npm install --frozen-lockfile

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/prisma ./prisma
COPY --chown=expressjs:nodejs package.json ./

RUN mkdir -p logs && chown expressjs:nodejs logs

USER expressjs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "dist/index.js"]
