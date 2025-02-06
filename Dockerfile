# Build stage
FROM node:lts-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install

COPY prisma ./prisma

RUN pnpm prisma generate

COPY . .

RUN pnpm run build

# Production stage
FROM node:lts-alpine

# Create app directory and non-root user
RUN mkdir -p /app && \
  addgroup -S nodejs && \
  adduser -S nodeuser -G nodejs

WORKDIR /app

# Install only necessary global packages
RUN npm install -g pnpm

# Copy only necessary files from builder
COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist
COPY --from=builder --chown=nodeuser:nodejs /app/package.json ./
COPY --from=builder --chown=nodeuser:nodejs /app/pnpm-lock.yaml ./
COPY --from=builder --chown=nodeuser:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules/ ./node_modules

# Install only production dependencies
RUN pnpm install --prod --ignore-scripts

# Use the non-root user
USER nodeuser

EXPOSE 55000

CMD ["node", "/app/dist/main.js"]
