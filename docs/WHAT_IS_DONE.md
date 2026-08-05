# What’s done

Status of the LINQ / white-label youth clothing e-commerce monorepo as of the current codebase.

## Monorepo

| Path | Role |
|---|---|
| `apps/api` | NestJS + Prisma API |
| `apps/storefront` | Next.js storefront |
| `apps/admin` | Next.js admin |
| `packages/site-config` | White-label brand + shared catalog |
| `packages/secure-api` | Encrypted API client helpers |

Workspaces: npm (`apps/*`, `packages/*`).

## White-label

- Single brand config: `packages/site-config/src/brand.ts`
- Shared catalog: `packages/site-config/src/catalog.ts` (uses `brand.name` / `sku()`)
- Storefront + admin + API order prefix / cart key read from `brand`
- After brand edits for API: `npm run build:site-config`

## API architecture

```
Controller → executeMethod → Service → Repo (Prisma) → Postgres
                ↓
         ResponseBuilder (success 200 / warning 401 / authError 403 / codeError 1000)
```

- Base layers: `apps/api/src/common/base/` (`BaseController`, `BaseService`, `BaseRepo`)
- Shared entity audit fields: `apps/api/src/common/entities/base.entity.ts`
- Module layout: `apps/api/src/module/{master|core|meta}/{domain}/`
- DB entities (TS): `apps/api/src/database/entity/{master|core|meta}/`
- Prisma multi-schema: `master` / `core` / `meta` under `apps/api/prisma/schema/`
- Each Nest module has `config/module.yml`
- Domain helpers live in that module’s `utility/` folder
- Cross-cutting helpers (dates, slug): `apps/api/src/common/utility/`
- Soft delete via `isDeleted` (no hard deletes in CRUD)
- No comments in application code (project convention)

## UTC dates

- All timestamps treated as UTC
- Helpers: `apps/api/src/common/utility/date.utility.ts`
- `BaseRepo` sets `createdAt` / `updatedAt` with `utcNow()`
- Postgres pool/session timezone UTC
- Prisma `DateTime` uses `@db.Timestamptz(3)`

## API modules (CRUD)

| Module | Prefix | Notes |
|---|---|---|
| Users | `/api/users` | + roles `/api/roles`, user-types `/api/user-types` |
| Addresses | `/api/addresses` | Default-address clearing utility |
| Categories | `/api/categories` | Slug helpers |
| Products | `/api/products` | Prisma CRUD; seeds from site-config when empty |
| App configs | `/api/app-configs` | Key/value core config |
| Discounts | `/api/discounts` | UTC window validation |
| Carts | `/api/carts` | Nested item routes |
| Orders | `/api/orders` | Totals + order-number utilities; payment fields captured, Razorpay charge later |
| Reviews | `/api/reviews` | Includes approve |

Pattern per module: `dto/` · `*.controller.ts` · `*.service.ts` · `*.repo.ts` · `*.module.ts` · `utility/` · `config/module.yml`

HTTP verbs: `POST` create · `GET` list/get · `PATCH` update · `DELETE` soft-delete.

## Encryption

- Optional hybrid encryption when `ENABLE_ENCRYPTION=true`
- Public key: `/api/crypto/public-key`
- Client package: `@linq/secure-api`

## Storefront / admin

- Storefront: brand-first home, shop, PDP, cart (localStorage), checkout → API orders
- Admin: overview, orders, products, customers
- Design: Syne + Figtree; paper/ink/volt tokens (avoid generic AI purple/cream looks)

## Docker

- `docker-compose.yml`: postgres, api, storefront, admin
- API entry: wait for DB → Prisma push → start
- Not fully validated end-to-end in all environments

## Still open / next

- Auth.js on storefront; API session validation
- Razorpay charge flow (fields already on Order)
- Harden admin against live Prisma product shape vs older mock catalog UI assumptions
- Full Docker compose verification
- Replace remaining hardcoded copy if any appear outside `site-config`

## Local commands

```bash
npm run build:site-config
npm run dev:api
npm run dev:storefront
npm run dev:admin
npm run prisma:generate -w apps/api
npm run prisma:migrate -w apps/api
```

API default: `http://localhost:3001` · Storefront: `http://localhost:3000` · Admin: `http://localhost:3002`
