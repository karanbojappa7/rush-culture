#!/bin/sh
set -e

echo "Waiting for Postgres..."
i=0
until node -e "const {Pool}=require('pg'); const p=new Pool({connectionString:process.env.DATABASE_URL}); p.query('select 1').then(()=>p.end()).catch(()=>process.exit(1))"; do
  i=$((i + 1))
  if [ "$i" -gt 30 ]; then
    echo "Postgres not ready"
    exit 1
  fi
  sleep 2
done
echo "Postgres ready"

echo "Applying Prisma schema..."
cd /app/apps/api
npx prisma db push

echo "Starting API..."
exec node dist/src/main.js
