# Use multi-stage builds
FROM node:18 AS builder
WORKDIR /app

# Install dependencies for backend
COPY backend/package.json backend/package-lock.json ./
RUN npm install
COPY backend ./
RUN npm run build

# Install dependencies and build frontend
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm install && npm run build

# Production image
FROM node:18
WORKDIR /app
COPY --from=builder /app .
CMD ["node", "dist/main"]
EXPOSE 3000
