# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
ENV HUSKY=0
RUN npm ci

# Copy source code
COPY src ./src
COPY locales ./locales

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
ENV HUSKY=0
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY locales ./locales

# Create logs directory
RUN mkdir -p logs

# Set non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose ports
EXPOSE 9001 9002

# Default command (can be overridden in docker-compose)
CMD ["node", "dist/apps/public/app.public.js"]

