# Development server with Node.js
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for runtime compatibility with compiled code)
RUN npm install --legacy-peer-deps

# Copy the compiled dist folder (build locally before running docker)
# Run: npm run build
# This copies the pre-compiled JavaScript instead of compiling in Docker
COPY dist ./dist

# Expose port
EXPOSE 3008

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3008/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the compiled JavaScript
CMD ["node", "dist/index.js"]

