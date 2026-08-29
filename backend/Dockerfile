# Production Dockerfile for NestJS API
# Context: /backend (Railway Root Directory: /backend)
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definition
COPY package.json ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy source code and build configs
COPY tsconfig.json nest-cli.json ./
COPY src ./src
COPY migrations ./migrations

# Compile NestJS production build
RUN npm run build

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies
COPY package.json ./

RUN npm install --omit=dev && npm cache clean --force

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

# Ensure both "dist/main.js" and "backend/dist/main.js" resolve regardless of root directory
RUN mkdir -p /app/backend && ln -s /app/dist /app/backend/dist

# Railway injects PORT dynamically; default to 4001
ENV PORT=4001
EXPOSE 4001

CMD ["node", "dist/main.js"]
