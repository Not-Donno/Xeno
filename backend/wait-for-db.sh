#!/bin/sh
echo "Waiting for database..."
for i in $(seq 1 30); do
  if node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.\$queryRaw\`SELECT 1\`
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
" 2>/dev/null; then
    echo "Database is ready!"
    echo "Seeding database..."
    node dist/seed/seed.js
    echo "Starting application..."
    exec node dist/src/main.js
  fi
  echo "Database not ready yet, waiting... ($i)"
  sleep 2
done
echo "Database failed to start"
exit 1
