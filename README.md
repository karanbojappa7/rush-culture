# Youth clothing e-commerce

Monorepo: NestJS API + (upcoming) Next.js storefront/admin.

## Stack

| Layer | Choice |
|---|---|
| API | NestJS + TypeScript |
| ORM | Prisma |
| DB | PostgreSQL |
| Payments | Deferred (Order captures `paymentStatus` + Razorpay ids; integrate later) |
| Auth | Auth.js (storefront; API validates session) |

Storefront: `apps/storefront` (Next.js). White-label brand + shared catalog live in `packages/site-config` — edit `packages/site-config/src/brand.ts` to rename the site.

Project status and delivered scope: [`docs/WHAT_IS_DONE.md`](docs/WHAT_IS_DONE.md). Agent conventions: [`.cursor/rules/`](.cursor/rules/).

## Architecture (API)

```
Controller → executeMethod → Service → Repo (Prisma) → Postgres
                ↓
         ResponseBuilder (success / warning / auth_error / code_error)
```

## Getting started

```bash
# 1. Postgres running locally, then set DATABASE_URL in apps/api/.env

# 2. Generate client + migrate
npm run prisma:generate -w apps/api
npm run prisma:migrate -w apps/api

# 3. Run API / storefront
npm run dev:api
npm run dev:storefront
```

API: `http://localhost:4000` · Storefront: `http://localhost:4001` · Admin: `http://localhost:4002`

### Example

```bash
curl -X POST http://localhost:4000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","name":"You","phoneNumber":"+919999999999"}'
```

## Build order

1. ~~Data model + Prisma + base architecture~~ 
2. Product CRUD API (next)
3. Storefront Next.js + Auth.js
4. Cart + checkout (orders only; payment gateway later)
5. Admin dashboard
6. Razorpay integration
