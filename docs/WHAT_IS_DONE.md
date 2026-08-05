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

- Brand name, cart storage key, order prefix, admin auth cookie → `@linq/site-config` (`brand`); **runtime** store identity copy/contact → AppConfig `ui.brand` (`GET/PUT /api/brand-settings`, Super Admin **Brand**, `brand.manage`)
- Theme settings (palette, **custom colors**, Google fonts, custom font size, day/night) → `packages/site-config/src/themes.ts`; API module `apps/api/src/module/core/theme` (`GET/PUT /api/theme-settings`, AppConfig `ui.theme` with `{ storefront, admin }`); Super Admin **Theming** (`theming.manage`)
- Storefront SEO → `packages/site-config/src/seo.ts`; API module `apps/api/src/module/core/seo`; Super Admin **SEO** (`seo.manage`)
- Policies (shipping / returns / size guide / contact) → `packages/site-config/src/policies.ts` defaults; runtime AppConfig `ui.policies` (`GET/PUT /api/policy-settings`, Super Admin **Policies**, `policies.manage`)
- RBAC → `apps/api/src/module/core/rbac` (`permissions.yml`, access APIs)
- Device / crypto / rate-limit → `apps/api/src/module/security/{device,crypto,rate-limit}`
- Email → `apps/api/src/module/communication/email` (public schema EmailLog)
- Platform glue (not schema-owned) → `apps/api/src/common/{base,prisma,caching,health,response,pagination,utility,config}`
- Entities mirror schemas → `apps/api/src/database/entity/{core,master,meta,security,public}`
- Admin UI groups by schema route folders → `apps/admin/src/app/(core|master|meta|security|common)` + components under same schema names; client hub → `apps/admin/src/base`
- Frontend architecture (mirrors API): `@linq/app-layer` — **sole HTTP entry** is `BaseRepo` / `CachedApi` (never raw Nest fetch). Flow: Controller → Service → Repo. **Read:** cache hit → return; miss → API → store → return. **Write:** API then auto-invalidate resource prefix `api:{resource}` (all scopes). Shared process L1 (`MemoryCacheStore`) reduces Nest load under scale. Keys: `api:{resource}:{scope?}{METHOD}:{path}`. Ephemeral paths (`/api/auth/*`, health, cache admin, stock-check) skip cache. Admin server scopes by auth cookie; browser uses `browser` / storefront `storefront`. App helpers `@/base/api` + `api-server` are thin `CachedApi` wrappers so every call site is cache-first. Domain modules under `module/{schema}/{domain}`.
- SKU helpers → `sku` / `withBrandName` from site-config (no hardcoded prefixes)
- Money → `formatInr` from site-config
- Policies (shipping / returns / size guide topics) → defaults in `packages/site-config/src/policies.ts`; live CMS via AppConfig `ui.policies`
- Seed catalog is bootstrap-only; live catalog is Postgres via API
- After site-config edits: `npm run build:site-config`

---

## Database (Postgres multi-schema)

| Schema | Owns |
|---|---|
| `public` | EmailLog (outbound mail tracking) |
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
- Optional hybrid API encryption (`ENABLE_ENCRYPTION=true`) via RSA-OAEP session key + AES-256-GCM body (public key at `GET /api/crypto/public-key`; clients use `@linq/secure-api`)
- Admin session cookie `rc_admin_token` is **sealed** (AES-GCM), not a raw JWT — DevTools no longer expose JWT claims; AuthGuard unseals then verifies JWT
- Redis cache values are **sealed at rest** (AES-GCM); keys remain namespaced `rc:…` but payloads are not plaintext JSON

### Modules & prefixes

| Area | Prefix | Notes |
|---|---|---|
| Auth | `/api/auth` | login / logout / me (`permissions[]`) |
| Access / RBAC | `/api/access/*` | Super Admin: matrix, catalog, role maps |
| Users / Roles / UserTypes | `/api/users`, `/api/roles`, `/api/user-types` | permission-gated |
| Categories | `/api/categories` | public reads |
| Products | `/api/products` | stock-check, variants/images patch |
| Customers / Addresses | `/api/customers`, `/api/addresses` | meta |
| Carts / Orders / Reviews | `/api/carts` etc. | meta; reviews: guest POST (email), approved GET, staff approve; **order create sends confirmation email** + `public.email_log` |
| Customer queries | `/api/customer-queries` | public POST; staff list/update |
| App configs / Discounts | `/api/app-configs` etc. | core |
| Client devices | `/api/client-devices` | `devices.read` (Super Admin by default) |
| Health | `/api/health` | connectivity |
| Cache admin | `/api/cache` | `cache.flush` — status + flush all/service |

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

**Code layout:** `apps/api/src/module/core/rbac/`  
**Catalog (source of truth for codes):** `apps/api/src/module/core/rbac/permissions.yml`  
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
| cache | `cache.flush` |
| theming | `theming.manage` |
| brand | `brand.manage` |
| policies | `policies.manage` |
| seo | `seo.manage` |
| access | `access.dashboard`, `roles.manage`, `roles.delete`, `permissions.manage`, `users.manage`, `users.delete` |

Add/edit codes in **YAML only**, restart API to sync. Grant via matrix for non–Super Admin roles. Super Admin always all codes (matrix column locked).

---

## Caching (Redis)

Location: `apps/api/src/common/caching`

- Backend: **Redis** (`ioredis`); memory fallback if Redis init fails
- Enable: `ENABLE_CACHING=true`, `CACHE_TYPE=redis`, `CACHE_HOST` / `CACHE_PORT` / `CACHE_TTL`
- Per-route flag in `module.yml`: `cache: true|false` (+ optional `ttl`); listed GETs without `cache` default to enabled
- `CacheInterceptor` + `EncryptInterceptor` registered in `AppModule` as `APP_INTERCEPTOR` (cache outer / encrypt inner pipe order in Nest is first-registered-first; AppModule registers encrypt then cache so **encrypt wraps hits and misses on the wire**)
- Cache stores **plain** `ResponseVm` only (never the AES transport envelope); Redis values are sealed at rest (`rc1.…` via `token-seal`)
- `CacheInterceptor` (Redis-backed — DB only on miss):
  - Cacheable GETs → Redis get; miss → handler → Redis set → response
  - If a body arrives already encrypted, decrypt with `req.encSessionKey` before store
  - Successful writes → clear module keys (`rc:{module}:*`) + linked modules (access↔role↔user, product↔category); next GET re-warms Redis
  - Skips `/api/cache/*`, `/api/health/*`; clears auth cache on login/logout
- Admin list/detail GETs cache-enabled: products, categories, orders, customers, customer-queries, reviews, users, roles, access, auth `/me`, client-devices

### Cache admin (`cache.flush`)

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

## Transactional email (SMTP)

Location: `apps/api/src/module/communication/email`

- `ENABLE_EMAIL=true` + `SMTP_HOST` (optional user/pass, port 587)
- Branded HTML layout + order confirmation template (`@linq/site-config` brand/copy/money)
- On checkout `POST /api/orders` success → customer confirmation email
- Every attempt stored in `public.email_log` (`PENDING` / `SENT` / `FAILED` / `SKIPPED`) with HTML/text, error, related order id
- Missing SMTP does **not** fail checkout; row is logged as `SKIPPED`

Env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_FROM_NAME`, `ENABLE_EMAIL`

---

## Storefront

- Catalog from API; shop filters (collection, size, color, max price)
- Max price default is **Any price** (range up to ₹20,000) so high-priced SKUs are not hidden
- PDP: gallery carousel + hover zoom, color/size stock UI, quantity stepper, add to bag / buy now
- PDP: **About this piece** description + **Ratings & reviews** (guest form; shows approved only)
- Cart: localStorage; quantity capped by `maxStock`; stock sync
- Checkout: FormData captured before async stock verify; stock-check then order create
- Help pages: `/shipping`, `/returns`, `/size-guide`, `/contact` (posts CustomerQuery) — content from `GET /api/policy-settings` (fallback package defaults)
- Brand chrome (header, hero, footer support email) from `GET /api/brand-settings`
- Design: Syne + Figtree; paper / ink / volt tokens

---

## Admin CMS

- Login (staff roles only); session from `GET /api/auth/me` includes `roleCode` + `permissions[]`
- Overview (orders, revenue charts, open query stats)
- Products: structured variants (size, color, ₹ price, Auto SKU), image URL rows, edit/create
- Categories, customers, orders, **Queries**, **Reviews** (approve/delete)
- **Devices** — IP/UA telemetry; nav + page require `devices.read` (default Super Admin only)
- **Brand** — `/brand`; storefront name, legal name, tagline, copy, support contact; `brand.manage`
- **Policies** — `/policies`; shipping / returns / size guide / contact topics; `policies.manage`
- **SEO** — `/seo`; titles, robots, OG, structured data; `seo.manage`
- **Theming** — `/theming`; storefront + admin surfaces; `theming.manage`
- **Cache** — `/cache`; status + flush all / per service; requires `cache.flush` (Super Admin by default)
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
- `apps/api/src/module/core/rbac/permissions.yml` — permission catalog source of truth
