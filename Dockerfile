# Production Dockerfile for ChaosForge
# Multi-stage lightweight Node.js container for stateful live streaming and OBS overlays

FROM node:22-alpine AS runtime

LABEL maintainer="ChaosForge Team"
LABEL description="Twitch OBS live audience modding engine"

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy package descriptors
COPY package*.json tsconfig.json ./

# Install production dependencies (includes tsx and express)
RUN npm install --omit=dev

# Copy application code and assets
COPY src/ ./src/
COPY public/ ./public/

# Expose standard application port
EXPOSE 3000

# Container healthcheck against /healthz
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:' + (process.env.PORT || 3000) + '/healthz', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1));"

# Launch server
CMD ["npm", "start"]
