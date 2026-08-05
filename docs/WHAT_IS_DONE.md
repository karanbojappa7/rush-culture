# What’s done

Status of the Rush Culture / white-label youth clothing e-commerce monorepo as of the current codebase.

## Monorepo

| Path | Role |
|---|---|
| `apps/api` | NestJS + Prisma API |
| `apps/storefront` | Next.js storefront |
| `apps/admin` | Next.js admin CMS |
| `packages/site-config` | White-label brand + seed catalog + `formatInr` |
| `packages/secure-api` | Shared API client (get/post/patch/delete, cookies) |

Workspaces: npm (`apps/*`, `packages/*`).

## White-label / DRY

- Brand, cart key, order prefix, admin auth cookie: `packages/site-config/src/brand.ts`
- Money formatting: `formatInr` from `@linq/site-config` (not duplicated in apps)
- API client: `@linq/secure-api` (`resolveApiBaseUrl`, credentials/cookie forwarding)
- Seed catalog in site-config is bootstrap-only; live catalog is Prisma via API
- After brand edits for API: `npm run build:site-config`

## Pagination

- List APIs: `?page=1&limit=20` (max 100)
- Response `data`: `{ items, page, limit, total, totalPages }`
- Admin list pages + storefront shop use server/client pagination

| Schema | Contents |
|---|---|
| `master` | Category, Product, ProductVariant, ProductImage (catalog) |
| `core` | Role, UserType, User (staff), AppConfig, Discount (system) |
| `security` | Account, Session, VerificationToken (auth credentials/sessions) |
| `meta` | Customer, Address, Cart, CartItem, Order, OrderItem, Review, CustomerQuery |

- Staff `User` (core) vs shopper `Customer` (meta)
- Checkout find-or-creates `Customer` by email and sets `order.customerId`
- Nest modules live under `module/{master|core|meta|security}/`

## API architecture

```
Controller → executeMethod → Service → Repo (Prisma) → Postgres
                ↓
         ResponseBuilder (success 200 / warning 401 / authError 403 / codeError 1000)
```

- Module layout: `apps/api/src/module/{master|core|meta|security}/{domain}/`
- Soft delete via `isDeleted`
- No comments in application code
- Redis response cache (`apps/api/src/common/caching`): `cache: true|false` on `module.yml` routes; `CacheInterceptor` serves GET hits and clears the module namespace on successful writes. Toggle with `ENABLE_CACHING=true` + `CACHE_TYPE=redis`.

## Auth (admin)

- `POST /api/auth/login|logout`, `GET /api/auth/me` (`module/security/auth`)
- JWT in httpOnly cookie (`brand.adminAuthCookie`)
- `@StaffAuth()` on admin write/list routes; public product/category reads + order create
- Bootstrap admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- Admin `/login` + Next middleware

## API modules

| Module | Prefix | Schema |
|---|---|---|
| Auth | `/api/auth` | security |
| Users / Roles / UserTypes | `/api/users` etc. | core |
| Categories | `/api/categories` | master |
| Products | `/api/products` (+ variants/images patch) | master |
| Customers | `/api/customers` | meta |
| Addresses | `/api/addresses` | meta |
| Carts / Orders / Reviews | `/api/carts` etc. | meta |
| Customer queries | `/api/customer-queries` (public create; staff list/update) | meta |
| App configs / Discounts | `/api/app-configs` etc. | core |

## Storefront / admin

- Storefront: products & categories from API; localStorage cart; checkout → Customer + Order
- Help: `/shipping`, `/returns`, `/size-guide`, `/contact` (queries tracked in admin)
- Admin: login, overview (orders + open queries), orders, product CMS, categories, customers, queries
- Design: Syne + Figtree; paper/ink/volt

## Still open / next

- Storefront customer login
- Razorpay charge flow
- Media upload (URLs only today)
- Full Docker compose verification
- Apply schema with `prisma db push --accept-data-loss` on local (needs explicit consent when AI-run)

## Local commands

```bash
npm run build:site-config
npm run prisma:generate -w apps/api
npx prisma db push --accept-data-loss   # local ecommerce DB only
npm run dev:api
npm run dev:storefront
npm run dev:admin
```

API: `http://localhost:3001` · Storefront: `http://localhost:3000` · Admin: `http://localhost:3002`
