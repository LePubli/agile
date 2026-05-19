# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY apps/workers/package*.json ./apps/workers/
COPY packages/core/package*.json ./packages/core/
RUN npm install --workspaces --include-dev

# Copy source code
COPY . .

# Generate Prisma client
RUN cd apps/workers && npx prisma generate

# Build Workers
RUN cd apps/workers && npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY apps/workers/package*.json ./apps/workers/
COPY packages/core/package*.json ./packages/core/
RUN npm install --workspaces --omit=dev

# Copy built files
COPY --from=builder /app/apps/workers/dist ./apps/workers/dist
COPY --from=builder /app/packages/core ./packages/core
COPY --from=builder /app/plugins ./plugins
COPY --from=builder /app/prisma ./prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S worker -u 1001

USER worker

CMD ["node", "apps/workers/dist/main.js"]
