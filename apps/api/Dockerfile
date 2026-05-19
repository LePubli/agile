# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/core/package*.json ./packages/core/
COPY plugins/*/package*.json ./plugins/
RUN npm install --workspaces --include-dev

# Copy source code
COPY . .

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build API
RUN cd apps/api && npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/core/package*.json ./packages/core/
COPY plugins/*/package*.json ./plugins/
RUN npm install --workspaces --omit=dev

# Copy built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/core ./packages/core
COPY --from=builder /app/plugins ./plugins
COPY --from=builder /app/prisma ./prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]
