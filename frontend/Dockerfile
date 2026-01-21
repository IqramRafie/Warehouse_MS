# Frontend Dockerfile
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Debug: Check if dist was created
RUN ls -la dist/ || echo "dist directory not found"
RUN if [ -f dist/index.html ]; then echo "index.html exists"; cat dist/index.html | head -20; else echo "index.html not found"; fi

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]