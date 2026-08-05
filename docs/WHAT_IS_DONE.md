# What’s done

Status of the Rush Culture / white-label youth clothing e-commerce monorepo (as of 2026-08-05).

## Monorepo

| Path | Role | Port |
|---|---|---|
| `apps/api` | NestJS + Prisma API | `4000` |
| `apps/storefront` | Next.js storefront | `4001` |
| `apps/admin` | Next.js admin CMS | `4002` |
| `packages/site-config` | Brand, policies, seed catalog, `formatInr` | — |
| `packages/secure-api` | Shared HTTP client (cookies / credentials) | — |

Workspaces: npm (`apps/*`, `packages/*`).

---

## White-label / DRY

- Brand name, cart storage key, order prefix, admin auth cookie → `@linq/site-config` (`brand`)
- SKU helpers → `sku` / `withBrandName` from site-config (no hardcoded prefixes)
- Money → `formatInr` from site-config
- Policies (shipping / returns / size guide topics) → `packages/site-config/src/policies.ts`
- Seed catalog is bootstrap-only; live catalog is Postgres via API
- After site-config edits: `npm run build:site-config`

---

## Database (Postgres multi-schema)

| Schema | Owns |
|---|---|
| `master` | Category, Product, ProductVariant, ProductImage |
| `core` | Role, Permission, RolePermission, UserType, User (staff), AppConfig, Discount |
| `security` | Account, Session, VerificationToken, ClientDevice |
| `meta` | Customer, Address, Cart, CartItem, Order, OrderItem, Review, CustomerQuery |

- Soft delete via `isDeleted`
- Staff `User` (core) vs shopper `Customer` (meta)
- Checkout find-or-creates Customer by email and sets `order.customerId`
- Variant replace frees unique `sku` and `(productId, size, color)` when retiring rows
- Apply schema: `npx prisma db push` from `apps/api` (use `--accept-data-loss` only when intentional)

---

## API architecture

```
Controller → executeMethod → Service → Repo (Prisma) → Postgres
                ↓
         ResponseBuilder (200 / 401 / 403 / 1000)
```

- Modules under `apps/api/src/module/{master|core|meta|security}/`
- Module config: each domain has `config/module.yml`
- No comments in application TS/TSX/JS
- Optional request encryption (`ENABLE_ENCRYPTION`) via crypto middleware/interceptor

### Modules & prefixes

| Area | Prefix | Notes |
|---|---|---|
| Auth | `/api/auth` | login / logout / me (`permissions[]`) |
| Access / RBAC | `/api/access/*` | Super Admin: matrix, catalog, role maps |
| Users / Roles / UserTypes | `/api/users`, `/api/roles`, `/api/user-types` | permission-gated |
| Categories | `/api/categories` | public reads |
| Products | `/api/products` | stock-check, variants/images patch |
| Customers / Addresses | `/api/customers`, `/api/addresses` | meta |
| Carts / Orders / Reviews | `/api/carts` etc. | meta; reviews: guest POST (email), approved GET, staff approve |
| Customer queries | `/api/customer-queries` | public POST; staff list/update |
| App configs / Discounts | `/api/app-configs` etc. | core |
| Client devices | `/api/client-devices` | `devices.read` (Super Admin by default) |
| Health | `/api/health` | connectivity |
| Cache admin | `/api/cache` | staff flush |

### Reviews (meta)

- Guest submit: `POST /api/reviews` with `productId`, `name`, `email`, `rating` (1–5), optional `title`/`body`
- Find-or-create `Customer` by email; `displayName` stored on review; starts `isApproved: false`
- Public list/summary: approved only (`GET /api/reviews`, `GET /api/reviews/summary?productId=`)
- Staff: `GET /api/reviews/admin`, `PATCH /:id/approve`, update, soft-delete

### Rate limiting

- Global `RateLimitGuard` reads `security.rate_limit` from each module’s `module.yml` (`window_ms`, `max`)
- Default: 180 req / 60s per module fingerprint; Redis store with memory fallback
- On block: HTTP 429 + increment `ClientDevice.blockedCount`
- Health / crypto public-key excluded

### Device tracking (security)

- `ClientDevice`: fingerprint (IP+UA hash), IP, userAgent, deviceType, OS, browser, last path/method, hit/blocked counts
- Middleware on all routes; DB upsert **debounced** (5 minutes) unless rate-limited (immediate)
- Staff list: `GET /api/client-devices?page=&limit=&q=&deviceType=` requires `devices.read`

### Pagination & search

- Query: `?page=1&limit=20` (max 100); optional `q` text search on list endpoints
- Response `data`: `{ items, page, limit, total, totalPages }`
- Shared helpers: `parsePageQuery` / `PageResult` / `BaseRepo.findPage` / `buildContainsOr`
- Admin: shared `DebouncedSearch` + `ListToolbar` + `DataTable` + `PaginationNav` (URL `q` + `page`)

### Auth (admin) + RBAC

**Code layout:** `apps/api/src/common/rbac/`  
**Catalog (source of truth for codes):** `apps/api/src/common/rbac/permissions.yml`  
**Schema:** `core.role` (`isSystem`), `core.permission`, `core.role_permission`

| Role | Purpose | Default access |
|---|---|---|
| `SUPER_ADMIN` | Full platform + access control | All permission codes (`*`) |
| `ADMIN` | Store operations | Overview, orders/revenue, products, categories, customers, queries, reviews — not devices/access |
| `STAFF` | Day-to-day ops | Like ADMIN without reviews |
| `CUSTOMER` | Storefront (non-staff) | No admin access |

**Boot behaviour**

- Sync YAML → `core.permission` rows
- Seed system roles (`isSystem: true`)
- Seed default `role_permission` maps only when a role has **zero** mappings (does not overwrite manual matrix edits)
- Bootstrap `ADMIN_EMAIL` / `ADMIN_PASSWORD` → **SUPER_ADMIN** (upgrades that email if it already exists)

**Auth / guards**

- JWT in httpOnly cookie (`brand.adminAuthCookie`)
- `AuthGuard` loads current `roleCode` from DB (role changes do not require re-login)
- `@StaffAuth()` default: `SUPER_ADMIN` \| `ADMIN` \| `STAFF`
- `@PermissionsAuth('code')` — fine-grained; multiple codes = **any-of (OR)**
- `GET /api/auth/me` → `{ id, email, name, roleCode, permissions[] }`

**Access APIs** (`permissions.manage` / related unless noted)

| Method | Path | Permission | Purpose |
|---|---|---|---|
| `GET` | `/api/access/dashboard` | `access.dashboard` | Counts + modules |
| `GET` | `/api/access/matrix` | `permissions.manage` | Roles × permissions grants |
| `PATCH` | `/api/access/matrix` | `permissions.manage` | Bulk save grants |
| `GET` | `/api/access/permissions` | `permissions.manage` | Flat permission list |
| `GET` | `/api/access/catalog` | `permissions.manage` | YAML catalog as loaded |
| `GET` | `/api/access/roles/:id/permissions` | `permissions.manage` | One role’s map |
| `PATCH` | `/api/access/roles/:id/permissions` | `permissions.manage` | Set one role’s codes |
| `GET` | `/api/access/me/permissions` | authenticated | Current user’s codes |

**Roles / users**

| Method | Path | Permission | Notes |
|---|---|---|---|
| CRUD | `/api/roles` | `roles.manage` | List also allowed with `users.manage` |
| `DELETE` | `/api/roles/:id` | `roles.delete` | System roles blocked |
| CRUD | `/api/users` | `users.manage` | Staff create / assign role |
| `DELETE` | `/api/users/:id` | `users.delete` | Not self; not last Super Admin |

**Permission codes (catalog modules)**

| Module | Codes |
|---|---|
| overview | `overview.read` |
| orders | `orders.read` |
| products | `products.manage` |
| categories | `categories.manage` |
| customers | `customers.read` |
| queries | `queries.manage` |
| reviews | `reviews.manage` |
| devices | `devices.read` |
| access | `access.dashboard`, `roles.manage`, `roles.delete`, `permissions.manage`, `users.manage`, `users.delete` |

Add/edit codes in **YAML only**, restart API to sync. Grant via matrix for non–Super Admin roles. Super Admin always all codes (matrix column locked).

---

## Caching (Redis)

Location: `apps/api/src/common/caching`

- Backend: **Redis** (`ioredis`); memory fallback if Redis init fails
- Enable: `ENABLE_CACHING=true`, `CACHE_TYPE=redis`, `CACHE_HOST` / `CACHE_PORT` / `CACHE_TTL`
- Per-route flag in `module.yml`: `cache: true|false` (+ optional `ttl`)
- `CacheInterceptor`:
  - Cacheable GETs → Redis hit/miss
  - Successful writes (POST/PATCH/PUT/DELETE) → clear that module’s keys (`rc:{module}:*`)
- Product + category GET routes are cache-enabled in YAML

### Cache admin (staff auth)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/cache` | Status + services |
| `GET` | `/api/cache/services` | List flushable services |
| `POST` | `/api/cache/flush` | Flush all `rc:*` |
| `POST` | `/api/cache/flush/:service` | Flush one service (e.g. `product`) |
| `DELETE` | `/api/cache` | Same as flush all |
| `DELETE` | `/api/cache/services/:service` | Same as flush service |

---

## Health

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Full report: API, Postgres (+ schemas), Redis ping, cache round-trip, encryption config |
| `GET` | `/api/health/live` | Process liveness |

Overall `status`: `ok` | `degraded` | `error` (HTTP **503** if Postgres down).

---

## Storefront

- Catalog from API; shop filters (collection, size, color, max price)
- Max price default is **Any price** (range up to ₹20,000) so high-priced SKUs are not hidden
- PDP: gallery carousel + hover zoom, color/size stock UI, quantity stepper, add to bag / buy now
- PDP: **About this piece** description + **Ratings & reviews** (guest form; shows approved only)
- Cart: localStorage; quantity capped by `maxStock`; stock sync
- Checkout: FormData captured before async stock verify; stock-check then order create
- Help pages: `/shipping`, `/returns`, `/size-guide`, `/contact` (posts CustomerQuery)
- Design: Syne + Figtree; paper / ink / volt tokens

---

## Admin CMS

- Login (staff roles only); session from `GET /api/auth/me` includes `roleCode` + `permissions[]`
- Overview (orders, revenue charts, open query stats)
- Products: structured variants (size, color, ₹ price, Auto SKU), image URL rows, edit/create
- Categories, customers, orders, **Queries**, **Reviews** (approve/delete)
- **Devices** — IP/UA telemetry; nav + page require `devices.read` (default Super Admin only)
- **Access** (`/access`, requires access permissions):
  - Tabs: Overview · Permissions · Roles · Users
  - **Permissions** — Drupal-style matrix (roles as columns, module groups as rows); filter; save grants; Super Admin column locked
  - **Roles** — create custom roles; delete custom roles if `roles.delete`
  - **Users** — create staff, assign roles; delete if `users.delete` (not self)
- Sidebar nav filtered by permission (not hardcoded role)
- Shared components: `apps/admin/src/components/{layout,ui,access,products,categories,reviews,queries,overview}`; `session-shared.ts` (`hasPermission`); `session.ts` + `api-server` for server
- Product form mappers: `@/lib/product-form-initial`
- Client vs server API: `@/lib/api` vs `@/lib/api-server`

---

## Catalog / stock behaviour

- Grey/disabled OOS colors & sizes; “X available” / low-stock cues
- `POST /api/products/stock-check`
- Orders atomically decrement stock (`updateMany` where `stock >= qty`)
- Variant replace: retire conflicting soft-deleted SKUs/size-color before recreate

---

## Postman

- Collection: `docs/postman/RushCulture.postman_collection.json`
- Environment: `docs/postman/RushCulture.postman_environment.json`
- Generator: `docs/postman/generate-collection.mjs` (`node generate-collection.mjs`)
- Includes Common (health + cache), Core (users, roles, **access RBAC**, configs, discounts), Master, Meta (reviews admin, customer-query), Security (auth, **client-devices**, crypto)
- Vars: `url`, `id`, `slug`, `code`, `key`, `itemId`, `variantId`, `service`, `roleId`, `permissionCode`

---

## Env (API) highlights

See `apps/api/.env` / root `.env.example`:

- `DATABASE_URL`, `PORT`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`
- `ADMIN_ORIGIN`, `STOREFRONT_ORIGIN`
- `ENABLE_ENCRYPTION` + key pair (optional)
- `ENABLE_CACHING`, `CACHE_TYPE`, `CACHE_HOST`, `CACHE_PORT`, `CACHE_TTL`, `CACHE_DB`

---

## Local commands

```bash
npm run build:site-config
npm run prisma:generate -w apps/api
cd apps/api && npx prisma db push
npm run start:dev -w apps/api      # :4000
npm run dev -w apps/storefront     # :4001
npm run dev -w apps/admin          # :4002
```

Redis required only when `ENABLE_CACHING=true`.

---

## Still open / next

- Storefront customer login / accounts
- Razorpay (or other) live payment capture
- Media upload (image URLs only today)
- Full Docker Compose verification
- Optional: expand cache flags to more modules beyond product/category

---

## Related docs

- `docs/admin_auth_schema_cms.md` — schema ownership + admin auth (incl. RBAC tables)
- `docs/README.md` — docs index
- `docs/postman/` — API collection (regenerate: `node docs/postman/generate-collection.mjs`)
- `apps/api/src/common/rbac/permissions.yml` — permission catalog source of truth
