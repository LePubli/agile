# ==================== BUILD ARGUMENTS ====================
ARG NODE_ENV=production

# ==================== BASE IMAGE ====================
FROM node:20-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# ==================== DEPENDENCIES ====================
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/core/*/package.json ./packages/core/
COPY plugins/*/package.json ./plugins/

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# ==================== BUILDER ====================
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/plugins ./plugins

# Copy source code
COPY turbo.json ./
COPY apps/api ./apps/api
COPY packages/core ./packages/core
COPY plugins ./plugins
COPY scripts ./scripts

# Build environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client
RUN cd packages/core && pnpm prisma generate || true

# Build API
RUN pnpm --filter api build

# ==================== RUNNER ====================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nexusos

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/plugins ./plugins
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema and generate client in production
COPY --from=builder /app/packages/core/prisma ./packages/core/prisma
RUN cd packages/core && npx prisma generate

# Set ownership
RUN chown -R nexusos:nodejs /app

USER nexusos

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["node", "apps/api/dist/main.js"]
