# ═══════════════════════════════════════════════════════════════
# Stage 1: Build the React app
# ═══════════════════════════════════════════════════════════════
FROM node:20-alpine AS build

WORKDIR /app

# Cache node_modules
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ═══════════════════════════════════════════════════════════════
# Stage 2: Serve with Nginx
# ═══════════════════════════════════════════════════════════════
FROM nginx:alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -q --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
