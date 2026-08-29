FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace configurations
COPY package.json package-lock.json turbo.json* ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install dependencies for compilation
RUN npm ci

# Copy API source and TypeScript configs
COPY tsconfig.json* ./
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/nest-cli.json ./apps/api/
COPY apps/api/src ./apps/api/src

# Compile NestJS API only
RUN npm run build --workspace=api

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled build output from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Ensure apps/api directory exists for store fallback files
RUN mkdir -p ./apps/api

# Railway injects PORT dynamically; default to 4001
ENV PORT=4001
EXPOSE 4001

CMD ["node", "apps/api/dist/main.js"]
