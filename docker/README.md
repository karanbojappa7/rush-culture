# Docker

## Start

```bash
cp .env.example .env
docker compose up --build -d
```

| Service | URL |
|---|---|
| API | http://localhost:4000 |
| Storefront | http://localhost:4001 |
| Admin | http://localhost:4002 |
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
- Browser calls API via `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`).
- Server-side Next.js uses `API_INTERNAL_URL=http://api:4000`.
- Set `ENABLE_ENCRYPTION=true` and key env vars to turn on payload encryption.
