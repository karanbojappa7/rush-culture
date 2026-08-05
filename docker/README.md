# Docker

## Start

```bash
cp .env.example .env
docker compose up --build -d
```

| Service | URL |
|---|---|
| Storefront | http://localhost:3000 |
| API | http://localhost:3001 |
| Admin | http://localhost:3002 |
| Postgres | localhost:5432 |

## Commands

```bash
npm run docker:up
npm run docker:logs
npm run docker:down
```

## Notes

- Postgres init creates `master`, `core`, and `meta` schemas.
- API runs `prisma db push` on startup.
- Browser calls API via `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`).
- Server-side Next.js uses `API_INTERNAL_URL=http://api:3001`.
- Set `ENABLE_ENCRYPTION=true` and key env vars to turn on payload encryption.
