# ---------- Build stage ----------
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build
RUN npx tsc prisma/seed.ts --outDir dist/seed --module commonjs --target es2021 --esModuleInterop --skipLibCheck

# ---------- Production stage ----------
FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

RUN mkdir -p /app/storage

# Wait for database to be ready before starting
RUN printf '#!/bin/sh\necho "Waiting for database..."\nfor i in $(seq 1 30); do\n  if node -e "const {PrismaClient}=require(\"@prisma/client\");const p=new PrismaClient();p.\$queryRaw\`SELECT 1\`.then(()=>process.exit(0)).catch(()=>process.exit(1))" 2>/dev/null; then\n    echo "Database is ready!"\n    echo "Seeding database..."\n    node dist/seed/seed.js\n    echo "Starting application..."\n    exec node dist/src/main.js\n  fi\n  echo "Database not ready yet, waiting... ($i)"\n  sleep 2\ndone\necho "Database failed to start"\nexit 1\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 3001

CMD ["sh", "/app/entrypoint.sh"]
