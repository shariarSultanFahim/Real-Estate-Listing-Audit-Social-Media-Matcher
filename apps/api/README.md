# Real Estate Listing Audit & Social Media Matcher

## Tech Stack
- **Frontend**: Next.js 15, React 19, TanStack Query, Zod, Tailwind CSS
- **Backend**: Express 4, Prisma 5, PostgreSQL, TypeScript
- **Monorepo**: Turborepo + pnpm workspaces

## Project Structure

```
apps/
  web/     → Next.js frontend (source of truth for data contracts)
  api/     → Express backend API (this app)
packages/
  types/       → Shared TypeScript types (inferred from Zod schemas)
  validation/  → Zod schemas (canonical data contracts)
  config/      → Shared tsconfig
  ui/          → Shared UI components
```

## Quick Start

### 1. Environment Setup

```bash
cp apps/api/.env.example apps/api/.env
# Then edit apps/api/.env and fill in DATABASE_URL
```

### 2. Database Setup

```bash
# Create your PostgreSQL database, then:
pnpm --filter api db:push     # Push schema to DB (no migration history)
pnpm --filter api db:seed     # Seed mock data
```

For production migrations:
```bash
pnpm --filter api db:migrate  # Create migration files
```

### 3. Start Development

```bash
pnpm dev          # Start both frontend + backend via Turborepo
# or individually:
pnpm --filter api dev    # API on http://localhost:4000
pnpm --filter web dev    # Frontend on http://localhost:3000
```

### 4. Point Frontend to Backend

In `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/listings` | All listings |
| GET | `/listings/:id` | Single listing |
| POST | `/listings` | Create listing |
| PATCH | `/listings/:id` | Update listing |
| GET | `/agents` | All agents |
| GET | `/agents/:id` | Single agent |
| POST | `/agents` | Create agent |
| PATCH | `/agents/:id` | Update agent |
| GET | `/discrepancies` | All discrepancies |
| GET | `/discrepancies?listingId=` | By listing |
| PATCH | `/discrepancies` | Update status/note |
| POST | `/social-matcher` | Match agents by city+price |
| GET | `/users` | All users |
| GET | `/users/:id` | Single user |
| POST | `/users` | Create employee |
| PATCH | `/users/:id` | Update employee/profile |
| GET | `/audit/runs` | Audit run history |
| POST | `/audit/run` | Trigger audit run |

## Database Schema Overview

```
ListingOffice
    └── Listing (Source of Truth — NEVER modified by scraped data)
            ├── ListingPhoto[]
            ├── SiteSnapshot[]         ← Read model per syndication site
            ├── ExternalListing[]      ← Raw Apify scrape output
            └── Discrepancy[]
                    ├── DiscrepancyNote[]
                    └── DiscrepancyHistory[]  ← Immutable audit trail
Agent
User
AuditRun
```

## Apify Integration

Add to `apps/api/.env`:
```env
APIFY_API_TOKEN=your_token_here
APIFY_ZILLOW_ACTOR_ID=your_actor_id
APIFY_REALTOR_ACTOR_ID=your_actor_id
APIFY_LACDB_ACTOR_ID=your_actor_id
```

The Apify integration gracefully no-ops if tokens are not set.
After setting tokens, use `POST /audit/run` to trigger a scrape cycle.

## Architecture Principle

> **The client's listing data is always the Source of Truth.**
> Scraped data from Zillow/Realtor/LACDB is compared against it.
> External data never overwrites the client's listings.

Pipeline:
```
Listing (SoT) → Apify Scrape → Normalize → Match → Compare → Discrepancy
```
