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
COPY apps/workers/package.json ./apps/workers/package.json
COPY packages/core/*/package.json ./packages/core/
COPY plugins/*/package.json ./plugins/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# ==================== BUILDER ====================
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/workers/node_modules ./apps/workers/node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/plugins ./plugins

# Copy source code
COPY turbo.json ./
COPY apps/workers ./apps/workers
COPY packages/core ./packages/core
COPY plugins ./plugins
COPY scripts ./scripts

# Build environment
ENV NODE_ENV=production

# Generate Prisma Client
RUN cd packages/core && pnpm prisma generate || true

# Build workers
RUN pnpm --filter workers build

# ==================== RUNNER ====================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nexusos

# Copy built application
COPY --from=builder /app/apps/workers/dist ./apps/workers/dist
COPY --from=builder /app/apps/workers/node_modules ./apps/workers/node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/plugins ./plugins
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema and generate client
COPY --from=builder /app/packages/core/prisma ./packages/core/prisma
RUN cd packages/core && npx prisma generate

# Set ownership
RUN chown -R nexusos:nodejs /app

USER nexusos

# Health check (workers don't have HTTP, so we check process)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD pgrep -f "node.*workers" || exit 1

# Start workers
CMD ["node", "apps/workers/dist/main.js"]
