# Stage 1: Install dependecies only when needed
FROM node:18-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependecies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetry is disabled to ensure CI/CD privacy
ENV NEXT_TELEMETRY_DISABLE=1

# Run the build process
RUN npm run build

# Stage 3: Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLE=1

# Create a non-root user for security compliance (Standard in enterprise enviroments)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and standalone server from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/ .next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# Ensure the hostname is accessible outside the container
ENV HOSTNAME="0.0.0.0"

# Healthcheck to ensure Kubernetes kwons whe the pod is actually ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \ 
    CMD wget --no-verbose --tries=1 --spider http://localhost/3000/api/health || exit 1

# Start the standalone Node.js server
CMD [ "node", "server.js" ]





