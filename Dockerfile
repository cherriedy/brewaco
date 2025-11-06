# Stage 1: Build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app

# Copy toàn bộ file cần thiết
COPY package*.json tsconfig*.json ./
RUN npm ci

COPY src ./src
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Chỉ cài deps production 
COPY package*.json ./
# ❗ Gỡ bỏ prepare script để không gọi husky
RUN npm pkg delete scripts.prepare && npm ci --omit=dev

# copy build output
COPY --from=builder /app/dist ./dist
COPY .env.production .env.production

# Expose cả 2 cổng backend
EXPOSE 9001
EXPOSE 9002

