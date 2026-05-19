# ==================== BUILD ARGUMENTS ====================
ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_URL=http://localhost:3000

# ==================== BASE IMAGE ====================
FROM node:20-alpine AS base

# Install dependencies
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
COPY apps/web/package.json ./apps/web/package.json
COPY packages/core/*/package.json ./packages/core/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# ==================== BUILDER ====================
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages ./packages

# Copy source code
COPY turbo.json ./
COPY apps/web ./apps/web
COPY packages/core ./packages/core
COPY themes ./themes

# Build arguments
ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_URL
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN pnpm --filter web build

# ==================== RUNNER ====================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nexusos

# Copy built application
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Set ownership
RUN chown -R nexusos:nodejs /app

USER nexusos

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start application
CMD ["node", "server.js"]
