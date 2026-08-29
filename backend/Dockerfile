FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace configurations
COPY package.json package-lock.json turbo.json* ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies for compilation
RUN npm ci

# Copy backend source and TypeScript configs
COPY tsconfig.json* ./
COPY backend/tsconfig.json ./backend/
COPY backend/nest-cli.json ./backend/
COPY backend/src ./backend/src

# Compile NestJS backend only
RUN npm run build --workspace=backend

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm ci --omit=dev --workspace=backend && npm cache clean --force

# Copy compiled build output from builder
COPY --from=builder /app/backend/dist ./backend/dist

# Ensure backend directory exists for store fallback files
RUN mkdir -p ./backend

# Railway injects PORT dynamically; default to 4001
ENV PORT=4001
EXPOSE 4001

CMD ["node", "backend/dist/main.js"]
