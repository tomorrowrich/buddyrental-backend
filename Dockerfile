FROM node:lts-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY prisma ./prisma
RUN pnpm prisma generate

COPY . .
RUN pnpm run build

FROM node:lts-alpine AS runner

ENV NODE_ENV=staging

RUN mkdir -p /app && addgroup -S nodejs && adduser -S nodeuser -G nodejs

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder --chown=nodeuser:nodejs /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder --chown=nodeuser:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules/.pnpm/ ./node_modules/.pnpm/
COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist

USER nodeuser

EXPOSE 55000

CMD ["node", "/app/dist/main.js"]
