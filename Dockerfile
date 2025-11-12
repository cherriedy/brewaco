# Stage 1: Build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm ci

COPY src ./src
COPY locales ./locales
RUN npm run build

# Stage 2: Production with Nginx
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Install Nginx
RUN apk add --no-cache nginx

# Install Node.js dependencies
COPY package*.json ./
RUN npm pkg delete scripts.prepare && npm ci --omit=dev

# Copy build output and locales
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/locales ./locales

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod 644 /etc/nginx/conf.d/default.conf && chown root:root /etc/nginx/conf.d/default.conf

# Create directories for Nginx
RUN mkdir -p /run/nginx

EXPOSE 80

# Start both Node.js apps and Nginx
CMD ["sh", "-c", "node dist/apps/public/app.public.js & node dist/apps/protected/app.protected.js & nginx -g 'daemon off;'"]
