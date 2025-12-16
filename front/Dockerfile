# Frontend Dockerfile (Expo Web)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Expose Expo web port
EXPOSE 8081

# Set environment variables for Expo
ENV EXPO_USE_FAST_RESOLVER=1

# Start Expo web server
CMD ["npx", "expo", "start", "--web", "--host", "0.0.0.0", "--port", "8081"]

