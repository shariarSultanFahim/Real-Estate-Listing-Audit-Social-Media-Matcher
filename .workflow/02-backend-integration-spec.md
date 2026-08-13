# Real Estate Listing Audit & Social Media Matcher — BACKEND BUILD & INTEGRATION SPEC (Phase 2)

> This document is the Phase 2 build spec for an AI coding agent. It assumes `01-frontend-spec.md` has already been built and approved by the client, with the frontend running fully on mock data. This phase builds the real Express API in `apps/api`, replaces mock data with real data, and wires the frontend to it. **Do not restart or redesign the frontend** — only swap its data layer as described in Section 7 of the frontend spec.

---

## 1. Scope of This Phase

1. Real Express + TypeScript API in `apps/api`, reusing `packages/types` and `packages/validation` from the monorepo.
2. A real datastore for the app's own data (agents, discrepancies, matching rules, users) — see Section 3.
3. A "source of truth" listings dataset — imported from Brokerage Engine data (Section 4).
4. An external-data comparison engine that checks each listing against each syndication site via a third-party data/scraping API (Section 5), and writes `Discrepancy` records.
5. Real authentication (Section 6).
6. Frontend integration (Section 7).
7. Deployment (Section 8).

---

## 2. Tech Stack (mandatory)
- Express + TypeScript
- Zod for request/response validation, reusing schemas from `packages/validation`
- A relational database — **assumption, confirm with the client/dev lead before building:** PostgreSQL with Prisma ORM (swap to whatever the team standardizes on if different; the schema in Section 3 is DB-agnostic and maps cleanly to either Prisma or a query builder).
- Node cron (e.g. `node-cron`) or a hosted scheduler for the recurring comparison job.
- Auth: JWT-based sessions (or NextAuth if the team prefers session cookies shared with the Next app — decide based on hosting setup).

---

## 3. Database Schema

Mirrors the Zod schemas already defined in `packages/validation` (Section 4 of the frontend spec) — do not invent new shapes, just persist them.

Tables:
- `users` (id, name, email, password_hash, account_type enum: `superAdmin`/`employee`, created_at, last_login_at)
- `user_permissions` (user_id FK, permission enum — one row per granted permission; irrelevant/unused for `superAdmin` rows since they implicitly have everything)
- `listings` (mirrors `Listing`: mls_number, address fields, price, status, listing_agent_id FK, description, legal_description, lat, lng, features[], last_updated_at)
- `listing_photos` (listing_id FK, url, order)
- `agents` (mirrors `Agent`: name, email, phone, office_state, service_areas[], facebook_page_url, instagram_page_url, cross_post_preference, price_range_min, price_range_max)
- `site_snapshots` (listing_id FK, site enum, fetched_at, price, address fields, description, lat, lng, source_url)
- `site_snapshot_photos` (site_snapshot_id FK, url, order)
- `discrepancies` (listing_id FK, site enum, field enum, source_value, site_value, status, detected_at, resolved_at, note)

Indexes: `discrepancies.status`, `discrepancies.listing_id`, `agents.service_areas` (GIN if Postgres array), `listings.mls_number` (unique).

---

## 4. Source-of-Truth Listings Data (Brokerage Engine)

Per the client, **Brokerage Engine has no confirmed public API** — it's an internal system behind a login. Before building an automated pull, check with the client/their account director whether Brokerage Engine exposes any export or API. Build for both outcomes:

**Path A — API available:** Build a `brokerage-engine` integration module that authenticates (credentials from client, stored as secrets/env vars) and pulls listing data on a schedule, upserting into the `listings` table.

**Path B — No API (fallback, build this first since it's guaranteed to work):**
- CSV/Excel import: an admin-only endpoint (`POST /api/listings/import`) that accepts a spreadsheet matching the `Listing` schema and upserts rows into `listings`. Use a library like `xlsx`/`papaparse` server-side, validate every row with the shared Zod `Listing` schema, and return a per-row success/error report.
- Optionally also expose manual create/edit endpoints for individual listings so staff can keep the mirror current without a spreadsheet if preferred.

Either path, the result is the same: `listings` table in this app's own DB is the "source of truth" the comparison engine checks external sites against.

---

## 5. External Site Comparison Engine

**Confirmed stack: Playwright + Apify.** Rather than hitting each site directly with a bare HTTP scraper (which trips bot detection on Realtor.com/Zillow/etc.), use **Playwright** (headless browser automation) run as **Apify Actors**, which handle proxy rotation, retries, and anti-bot evasion at the platform level. Sites to cover: **Zillow, Realtor.com, Homes.com, Redfin, Mansions Global**, plus Sotheby's-branded sites already listed in the shared `SyndicationSite` enum (`packages/validation`) — keep that enum as the single list of sites the whole system (frontend Settings page, comparison engine, discrepancy records) agrees on, and add `"redfin"` to it if not already present.

Treat the scraping layer as swappable behind one interface, so the underlying Apify Actor(s) can be revised without touching comparison logic downstream:

```ts
interface ListingDataProvider {
  fetchListing(site: SyndicationSite, address: Address): Promise<SiteSnapshotInput>
}
```

Implementation notes:
- One Playwright-based Apify Actor per site (page structures differ enough that a single generic actor is not practical); a thin `ListingDataProvider` adapter in `apps/api` calls the right actor per site via the Apify API/SDK and normalizes the result into `SiteSnapshotInput`.
- Respect each site's `robots.txt`/terms and rate limits; this stays strictly read-only/detection-only — the engine must never write data to any external site.
- Cache/reuse Apify run results within a comparison cycle to avoid redundant runs if a listing's address is queried more than once.

**Comparison job** (scheduled, e.g. nightly or every few hours):
1. For each active listing, for each enabled `SyndicationSite` (from the Settings page in the frontend), call the provider to fetch a `SiteSnapshot`.
2. Store the snapshot in `site_snapshots`.
3. Diff snapshot fields against the corresponding `listings` row:
   - `price`: exact match required.
   - `address`: normalized string compare (strip punctuation/case).
   - `description` / `legalDescription`: fuzzy compare (e.g. Levenshtein or token-diff) — flag only if substantially different, not whitespace-level noise.
   - `mapCoordinates`: flag if delta exceeds a small tolerance (e.g. > ~0.0005°, roughly one address's worth of drift).
   - `photos`: flag if photo count differs, URLs differ, or `order` differs.
4. For each mismatched field, upsert a `Discrepancy` row (`status: "open"`) if one doesn't already exist for that listing/site/field; if a previously-open discrepancy no longer reproduces, auto-resolve it (`status: "resolved"`, `resolvedAt: now`).
5. This is strictly read/detect only — the engine must never write data to any external site.

---

## 6. Authentication
Replace the frontend's mock login with real auth. Required capabilities:
- **Secure login** — `POST /api/auth/login`, validates credentials (hashed passwords, e.g. bcrypt/argon2), returns a short-lived JWT access token (or sets an httpOnly session cookie, per hosting decision).
- **JWT authentication** — access token required on all protected routes; middleware protecting all `/api/*` routes except `/api/auth/*` and `/api/health`.
- **Refresh tokens** — `POST /api/auth/refresh`, a longer-lived, rotatable refresh token (httpOnly cookie) used to reissue access tokens without forcing re-login; invalidate/rotate on use and on logout.
- **Password reset** — `POST /api/auth/forgot-password` (emails a time-limited reset link/token) and `POST /api/auth/reset-password` (consumes the token, sets a new password).
- **Email verification** — new users receive a verification link (`POST /api/auth/verify-email`); unverified accounts can be restricted from sensitive actions until confirmed.
- **Logout** — `POST /api/auth/logout`, invalidates the refresh token.
- **Session check** — `GET /api/auth/me`.
- **Role-Based Access Control (RBAC) — actually per-user permissions.** There are no fixed roles beyond the `accountType` split. `superAdmin` implicitly passes every permission check. `employee` accounts are authorized purely by the specific `Permission` values (Section 4.7 of the frontend spec: `listings:create`, `listings:edit`, `listings:delete`, `discrepancies:resolve`, `agents:create`, `agents:edit`, `agents:delete`, `socialMatcher:use`, `users:create`, `users:edit`) attached to that user in `user_permissions`. Enforce with reusable middleware, e.g. `requirePermission("agents:create")`, applied per-route — never rely on the frontend hiding a button as the only guard. Only `superAdmin` and users with `users:create`/`users:edit` may call the employee-management endpoints in Section 7.
- Outbound email (verification, password reset) needs a transactional email provider — TBD with client/dev lead; keep the sending logic behind a small `EmailService` interface so the provider can be swapped.

---

## 7. API Endpoints (replace `apps/web/app/api/mock/*` calls with these)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/listings` | list + filter listings (query params: `hasOpenDiscrepancies`, `site`, `field`, `agentId`) |
| GET | `/api/listings/:id` | listing detail incl. its discrepancies + snapshots |
| POST | `/api/listings/import` | spreadsheet import (Section 4 fallback) |
| GET | `/api/discrepancies/:id` / PATCH | view / resolve / add note |
| GET | `/api/agents` | list + filter agents |
| POST | `/api/agents` / PATCH `/api/agents/:id` | create/edit agent |
| POST | `/api/social-matcher` | body: `{ city, state?, price }` → returns `MatchResult[]`, running the **same matching algorithm** built in the frontend spec Section 6, now against real `agents` table data |
| GET | `/api/settings/sites` / PATCH | enabled syndication sites |
| GET | `/api/dashboard/stats` | counts for the dashboard home cards |
| GET | `/api/users/me` / PATCH | current user's own profile (name, email, password) |
| GET | `/api/users` | list all users (requires `users:edit` or `superAdmin`) — includes each user's `permissions[]` for the Employees table |
| POST | `/api/users` | create employee + assign permissions (requires `users:create` or `superAdmin`) |
| GET | `/api/users/:id` / PATCH | view/edit a specific employee's info + permissions (requires `users:edit` or `superAdmin`) |
| DELETE | `/api/users/:id` | deactivate/remove an employee (requires `superAdmin`) |
| GET | `/api/health` | uptime check |

All request bodies and responses validated against the shared `packages/validation` Zod schemas — the same schemas the frontend already uses, so contracts can't silently drift.

---

## 8. Frontend Integration Steps
1. Stand up `apps/api` with the endpoints above, running locally (e.g. `:4000`).
2. In `apps/web`, set `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api`.
3. Delete `apps/web/app/api/mock/*`.
4. Since all data access already goes through the Axios client + TanStack Query hooks (frontend spec Section 8), no component code should require changes — only verify response shapes match exactly (they should, since both sides import the same Zod schemas).
5. Replace the mock login page logic with real calls to `/api/auth/*`; add route protection (redirect to `/login` if `GET /api/auth/me` fails) via Next.js middleware.
6. Regression-test every page from the frontend Definition of Done against real data.

---

## 9. Deployment
- Deployment timeline depends on the client providing domain and hosting credentials — confirm these are ready before starting this step.
- Deploy `apps/web` and `apps/api` (e.g. web app to a Next-friendly host, API + DB to a Node-friendly host with a managed Postgres instance) — exact providers TBD with client/dev lead.
- Environment variables/secrets: DB connection string, JWT secret, third-party data provider API key, Brokerage Engine credentials (if Path A in Section 4 applies).
- Set up the comparison-engine scheduler (Section 5) as a background worker or scheduled job on whichever host is chosen.

---

## 10. Definition of Done (Phase 2)
- [ ] Real listings data (imported or API-pulled) populates `/listings`, matching what's in Brokerage Engine.
- [ ] Comparison engine runs on schedule and produces accurate, low-noise discrepancies (spot-check against a handful of real listings manually).
- [ ] Social matcher returns correct results against the real agent dataset.
- [ ] Real auth in place; mock login fully removed.
- [ ] Every `Permission`-gated endpoint actually enforces it server-side (verify by calling with a token that lacks the permission and confirming a 403 — don't just trust the frontend hiding the button).
- [ ] A super admin can create an employee with a specific permission set via the real API, and that employee's frontend experience (nav, page access) matches exactly what was granted.
- [ ] Frontend fully swapped to the real API with no mock code paths remaining.
- [ ] Deployed to client's domain/hosting and verified end-to-end by the client.