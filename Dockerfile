# ── SmartCampusConnect X — Production Dockerfile ─────────────────────────────
# Multi-stage: build the Vite frontend, then run the Express server.

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source
COPY . .

# Build frontend (Vite) + bundle server (esbuild)
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Only copy what we need
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env.example ./.env.example

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts

# Create directories for runtime data
RUN mkdir -p /app/data /app/uploads && \
    chmod 755 /app/data /app/uploads

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/db.json
ENV UPLOAD_DIR=/app/uploads

# Expose port
EXPOSE 3000

# Persistent data volumes
VOLUME ["/app/data", "/app/uploads"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/super/stats || exit 1

# Start the server
CMD ["node", "dist/server.js"]
