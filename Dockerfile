# Stage 1: Build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm ci

COPY src ./src
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm pkg delete scripts.prepare && npm ci --omit=dev

# copy build output
COPY --from=builder /app/dist ./dist
#COPY .env .env

EXPOSE 9001
EXPOSE 9002

