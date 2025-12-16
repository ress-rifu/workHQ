# Frontend Dockerfile (Expo Web)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files (both package.json AND package-lock.json for exact versions)
COPY package.json package-lock.json ./

# Install exact dependencies from package-lock.json (npm ci ensures reproducible builds)
RUN npm ci --frozen-lockfile && npm cache clean --force

# Copy source code
COPY . .

# Expose Expo web port
EXPOSE 8081

# Set environment variables
ENV EXPO_USE_FAST_RESOLVER=1
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV EXPO_TOKEN=s6yW8CXMWWsQa4FtFBNm1KyINosiAT18U6K3JnQl
ENV EXPO_PUBLIC_SUPABASE_URL=https://rdkgfezrowfnlrbtiekn.supabase.co
ENV EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka2dmZXpyb3dmbmxyYnRpZWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTUyNzEsImV4cCI6MjA3NzQ3MTI3MX0.UV_PmsUcpsrOmM5bn4Y8xrlFJCRvHX1dJOieykXwDIs
ENV EXPO_PUBLIC_BACKEND_API_URL=https://workhq-api.vercel.app

# Start Expo
CMD ["npx", "expo", "start", "--clear"]

