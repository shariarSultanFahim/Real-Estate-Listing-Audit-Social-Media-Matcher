# Real Estate Listing Audit & Social Media Matcher — FRONTEND BUILD SPEC (Phase 1)

> This document is the complete build spec for an AI coding agent. Build ONLY what's described here. This is **Phase 1 (Frontend)** — no real backend, no real APIs, no real scraping. Everything must run against static/mock data so it can be demoed to the client for sign-off before Phase 2 (backend) begins.
>
> A companion file, `02-backend-integration-spec.md`, describes Phase 2 (Express backend + wiring the frontend to it). Do not build Phase 2 items now — but structure the code so Phase 2 is a drop-in swap (see Section 8).

---

## 1. Project Context (why this app exists)

Client is a real estate brokerage (offices in Louisiana, Mississippi, Alabama; ~150 agents; ~700 active listings). Two recurring manual problems are being replaced with software:

### Problem A — Listing Data Audit
- The brokerage's internal system, **Brokerage Engine**, is the source of truth for every listing (price, address, photos, map coordinates, legal/marketing description, features, etc.).
- Brokerage Engine feeds the MLS, which in turn syndicates listings out to public sites: **Realtor.com, Zillow, Homes.com, Sotheby'sRealty.com, Crescent Sotheby's International Realty site, Mansions Global, Google**.
- Syndication frequently breaks: wrong/old photos, wrong photo order, stale price after a price change, wrong address, wrong map pin, wrong description.
- Today, a staff member manually checks all ~700 listings, one by one, every day.
- **Goal:** an audit dashboard that automatically flags only the listings with mismatches, telling the employee exactly which field is wrong on which site, so they only have to review (e.g.) 27 problem listings instead of 700 clean ones.
- This tool is **read-only / detection only** — it must never write data back to any site.

### Problem B — Social Media Cross-Posting Matcher
- When an agent's listing goes live, the marketing team decides which *other* agents (out of ~150) want that listing reposted to their own personal/professional Facebook & Instagram pages.
- Each agent has a standing preference, e.g.: "duplicate everything," "only by special request," "never," or "only listings in my service area within a price range."
- Today this is looked up by hand in a spreadsheet of ~150 rows.
- **Goal:** staff types in a city/area + price → app instantly returns the list of agents (and their pages) who want that listing posted, based on their saved preference + service area + price range.

Both tools live inside one **internal admin dashboard**.

---

## 2. Tech Stack (mandatory)

- **Monorepo:** Turborepo
- **Framework:** Next.js (App Router), TypeScript (strict mode)
- **Styling/UI:** Tailwind CSS + shadcn/ui for all components (no other component libraries)
- **Data fetching/caching:** Axios client + TanStack Query (React Query) for all reads/writes — even against mock data (see Section 8, this matters)
- **Forms/validation:** React Hook Form + Zod (via `@hookform/resolvers/zod`)
- **Shared types & validation:** live in shared packages, imported by both the web app now and the API app later
- **Package manager:** pnpm (workspaces)
- **Linting/formatting:** ESLint + Prettier, shared config package

---

## 3. Monorepo Structure

```
repo-root/
├── apps/
│   └── web/                       # Next.js app (this phase)
│       ├── app/
│       │   ├── (auth)/login/page.tsx
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx           # sidebar/nav shell
│       │   │   ├── page.tsx             # dashboard home / stats
│       │   │   ├── listings/
│       │   │   │   ├── components/
│       │   │   │   │   ├── ListingsTable.tsx
│       │   │   │   │   ├── DiscrepancyDetail.tsx
│       │   │   │   │   ├── FilterBar.tsx
│       │   │   │   │   └── ListingStatusBadge.tsx
│       │   │   │   ├── page.tsx         # listing audit table
│       │   │   │   └── [id]/page.tsx    # discrepancy detail view
│       │   │   ├── social-matcher/
│       │   │   │   ├── components/
│       │   │   │   │   ├── MatchAgentTable.tsx
│       │   │   │   │   ├── SocialCrossPostForm.tsx
│       │   │   │   │   ├── SocialSettingsPanel.tsx
│       │   │   │   │   └── MatchAgentItem.tsx
│       │   │   │   └── page.tsx
│       │   │   ├── agents/
│       │   │   │   ├── components/
│       │   │   │   │   ├── AgentsTable.tsx
│       │   │   │   │   ├── AgentForm.tsx
│       │   │   │   │   └── AgentDetail.tsx
│       │   │   │   ├── page.tsx
│       │   │   │   └── [id]/page.tsx
│       │   │   └── settings/page.tsx
│       │   └── api/mock/...             # Next.js route handlers serving mock JSON (see Section 8)
│       ├── components/                  # app-specific components (compose packages/ui)
│       ├── lib/
│       │   ├── api-client.ts            # axios instance
│       │   ├── query-client.ts
│       │   └── mock-data/               # seed data (listings, agents, discrepancies)
│       └── hooks/                       # TanStack Query hooks (useListings, useAgents, useMatchAgents, ...)
│
│   └── api/                             # PLACEHOLDER ONLY in this phase — do not build logic
│       ├── src/index.ts                 # minimal Express server, health check route only
│       └── package.json
│
├── packages/
│   ├── ui/                              # shared shadcn-based component wrappers
│   ├── types/                           # shared TypeScript interfaces
│   ├── validation/                      # shared Zod schemas (single source of truth)
│   ├── config/                          # shared eslint/tsconfig/tailwind config
│   └── mock-data/                       # OPTIONAL: move lib/mock-data here if you want it shared with apps/api later
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

**Important:** Create `apps/api` now as an empty Express + TypeScript skeleton with a single `/health` route. Do not implement any business logic in it. Its only purpose in Phase 1 is to make the monorepo topology (and the `packages/*` sharing) real from day one, so Phase 2 has zero structural rework.

---

## 4. Shared Data Model (`packages/types` + `packages/validation`)

Define these as Zod schemas in `packages/validation/src/*.ts`, and infer TypeScript types from them (`z.infer<typeof X>`) re-exported from `packages/types`. Both `apps/web` and (eventually) `apps/api` import from these packages — never redefine these shapes locally in the app.

### 4.1 Listing (source of truth, mirrors Brokerage Engine)
```ts
Listing {
  id: string
  mlsNumber: string
  address: { street, city, state, zip }
  price: number
  status: "active" | "pending" | "sold" | "withdrawn"
  listingAgentId: string          // -> Agent.id
  description: string
  legalDescription: string
  mapCoordinates: { lat: number, lng: number }
  photos: { url: string, order: number }[]
  features: string[]              // pool, hot tub, etc.
  lastUpdatedAt: string (ISO date)

  // Additional fields captured at creation (see "Add/Edit Listing" page, Section 5.9)
  addressLine2?: string
  subdivision?: string
  propertyType: string             // e.g. "Single Family", "Condo", "Land" — selectable list
  propertyStyle: string
  beds: number
  fullBaths: number
  halfBaths?: number
  buildingAreaSqft?: number
  lotSizeAcres?: number
  yearBuilt?: number
  parkingPlaces?: number
  newConstruction: boolean
  listingType: string               // e.g. "Residential Sales", "Residential Lease"
  listDate: string (ISO date)
  expirationDate: string (ISO date)
  anticipatedLaunchDate?: string (ISO date)
  listingOfficeId: string           // -> office/brokerage entity
}
```

### 4.2 SyndicationSite (enum)
`"realtor" | "zillow" | "homes" | "redfin" | "sothebysRealty" | "crescentSothebys" | "mansionsGlobal" | "google"`

### 4.3 SiteSnapshot (what the audit tool "sees" on an external site for a listing)
```ts
SiteSnapshot {
  id: string
  listingId: string
  site: SyndicationSite
  fetchedAt: string (ISO date)
  price: number
  address: { street, city, state, zip }
  description: string
  mapCoordinates: { lat, lng }
  photos: { url: string, order: number }[]
  sourceUrl: string
}
```

### 4.4 Discrepancy
```ts
Discrepancy {
  id: string
  listingId: string
  site: SyndicationSite
  field: "price" | "address" | "description" | "mapCoordinates" | "photos" | "legalDescription"
  sourceValue: string       // stringified value from Brokerage Engine
  siteValue: string         // stringified value found on the external site
  status: "open" | "resolved" | "ignored"
  detectedAt: string (ISO date)
  resolvedAt?: string (ISO date)
  note?: string
}
```

### 4.5 Agent
```ts
Agent {
  id: string
  name: string
  email: string
  phone?: string
  officeState: "LA" | "MS" | "AL"
  serviceAreas: string[]              // city/area names this agent covers
  facebookPageUrl?: string
  instagramPageUrl?: string
  crossPostPreference: "all" | "byRequest" | "never" | "areaAndPrice"
  priceRangeMin?: number               // only used when preference === "areaAndPrice"
  priceRangeMax?: number
}
```

### 4.6 MatchQuery / MatchResult (social matcher)
```ts
MatchQuery { city: string, state?: string, price: number }

MatchResult {
  agentId: string
  agentName: string
  facebookPageUrl?: string
  instagramPageUrl?: string
  matchReason: string   // e.g. "Duplicates all postings" / "Covers Bush, LA within $200k–$300k range"
}
```

### 4.7 User (admin/staff login — static for now)
```ts
User { id: string, name: string, email: string, role: "admin" | "staff" }
```

Zod-validate every form and every mock "API" response against these schemas so the shapes are enforced end to end even while data is fake.

---

## 5. Pages & Functionality

### 5.1 `/login`
Simple static login form (email + password) validated with RHF + Zod. On submit, set a mock session (e.g., cookie or local state) and redirect to `/`. No real auth logic — this is a placeholder screen for Phase 2 to replace.

### 5.2 `/` — Dashboard home
Stat cards (via shadcn `Card`) pulled through a TanStack Query hook against mock data:
- Total active listings
- Listings with open discrepancies (count) — this is the number that matters most to the client
- Discrepancies by type (small breakdown chart or badge list)
- Total agents enrolled in social cross-posting

### 5.3 `/listings` — Listing Audit table
- Data table (shadcn `Table` + `DataTable` pattern) of all listings.
- Default view: **only listings with open discrepancies** (this is the whole point of the tool — mirrors the client's explicit ask: "I want to only look at the properties that have errors").
- Toggle to show "All listings" vs "Only with issues."
- Columns: address, MLS #, price, agent, # open discrepancies, sites affected (badges per site), last checked.
- Filters: by site, by discrepancy field type, by agent, by status.
- Row click → `/listings/[id]`.

### 5.4 `/listings/[id]` — Discrepancy detail view
- Header: listing summary (address, price, agent, MLS #, thumbnail).
- A comparison table: rows = fields (price, address, description, map coordinates, legal description), columns = Brokerage Engine (source of truth) vs each syndication site, with mismatched cells visually flagged (e.g. red background / badge).
- Photo comparison: grid showing source photo order vs. each site's photo order/set, flagging missing/out-of-order/extra photos.
- Per-discrepancy actions: "Mark resolved," "Ignore," add a note (RHF + Zod form in a `Sheet`/`Dialog`).

### 5.5 `/social-matcher`
- A single form: City/Area (combobox, typeahead against mock agent service areas) + Price (currency input). RHF + Zod validated.
- On submit, run the mock matching logic client-side (see Section 6) and render results as a list/table: agent name, match reason, links to their Facebook/Instagram pages, with "Copy list" / "Mark as posted" actions (UI only, no real posting).
- Explicitly show *why* each agent matched (their stated preference), since the client's pain point was staff manually reasoning through this.

### 5.6 `/agents`
- Data table of all agents: name, office state, service areas, cross-post preference, price range (if applicable), social links.
- Filters: by state, by preference type, by service area.
- "Add agent" / row-level "Edit agent" open a `Sheet` with an RHF + Zod form matching the `Agent` schema.

### 5.7 `/agents/[id]`
- Agent detail/edit page, same form as above, plus a read-only list of listings that have matched to this agent historically (mock data).

### 5.8 `/settings`
- Placeholder page: list of syndication sites being monitored (static list from Section 1), with an "enabled" toggle per site (UI only, no persistence needed beyond local state).

### 5.9 `/listings/new` (and reused as edit mode at `/listings/[id]/edit`) — Add/Edit Listing
This is the entry point that populates the app's own "source of truth" mirror (relevant when Brokerage Engine has no API — see backend spec Section 4, Path B). Build it as a two-step flow matching the reference UI:

**Step 1 — Address lookup**
- A single "Enter Listing Address" input wired to the Google Places Autocomplete API, showing a live dropdown of matching addresses (street, city, state) as the user types.
- Selecting a suggestion advances to Step 2 with the address pre-filled.
- In this mock phase, stub the Places call behind the same `lib/api-client.ts` pattern (a small wrapper hook, e.g. `usePlacesAutocomplete(query)`) so swapping in a real Google Maps/Places API key later is a config change, not a rewrite. If no key is available yet, fall back to a small static list of mock address suggestions so the flow is still demoable.

**Step 2 — Listing Essentials form** (RHF + Zod, validated against the extended `Listing` schema from Section 4.1), laid out in three columns matching the reference:
- **Location:** embedded map preview centered on the selected address (marker pin), Address Line 1 (prefilled, editable), Address Line 2, Subdivision, City, State (select), Zip.
- **Property Information:** Property Type (select), Property Style (select), Beds, Full Baths, Half Baths, Building Area (sq ft), Lot Size (acres), Year Built, Parking Places, "New Construction (To Be Built)" checkbox.
- **Property Features:** a searchable/tag-style multi-select (e.g. shadcn `Command`/`Combobox` + badges) feeding `features: string[]`.
- **Listing Detail:** Listing Type (select: Residential Sales, Residential Lease, etc.), List Price (currency input), List Date, Expiration Date, Anticipated Launch Date (date pickers), Listing Office (select), Listing Agent (search/select from the `Agent` dataset).
- Show a banner note above the form (as in the reference): information is populated from public records where possible and must be verified before saving — reinforces that this is a starting point, not authoritative data.
- On submit, create (or update) the listing via the mock API layer (Section 8) and redirect to `/listings/[id]`.

---

## 6. Client-Side Matching Logic (mock, but real logic)

Even without a backend, implement the actual matching algorithm in `apps/web/lib` (e.g. `lib/match-agents.ts`) so the demo is functionally convincing, not just a static list:

```
given (city, price):
  for each agent in mockAgents:
    if preference == "all": match, reason = "Duplicates all postings"
    if preference == "byRequest": skip (needs manual approval, not shown here)
    if preference == "never": skip
    if preference == "areaAndPrice":
      if city ∈ agent.serviceAreas AND priceRangeMin <= price <= priceRangeMax:
        match, reason = "Covers {city} within ${min}–${max}"
```
This same function signature should be reusable/portable to the Express backend in Phase 2 with zero changes to its inputs/outputs (only the data source changes from mock array to DB query).

---

## 7. Mock Data Requirements

Create realistic seed data in `apps/web/lib/mock-data/`:
- **~30–40 sample listings** across the three states, with a deliberate mix: most "clean" (no discrepancies) and a subset (~10–15%) with 1–3 injected discrepancies across different field types, so the "open discrepancies" view isn't empty and isn't overwhelming.
- **Photo arrays** with at least one listing showing an out-of-order/missing-photo discrepancy.
- **~20–25 sample agents** covering all three preference types (`all`, `byRequest`, `never`, `areaAndPrice`) and overlapping/non-overlapping service areas, so the social matcher demo returns varied, non-trivial result sets for different test cities.
- Data should be internally consistent (agent IDs on listings must exist in the agents dataset, etc.) and pass the Zod schemas from Section 4.

---

## 8. Wiring Mock Data Through Real Data-Fetching Patterns (important)

Do **not** just import mock arrays directly into components. Instead:

1. Serve mock data from Next.js **route handlers** under `apps/web/app/api/mock/...` (e.g. `GET /api/mock/listings`, `GET /api/mock/agents`, `POST /api/mock/social-matcher`), returning JSON shaped exactly like the Zod schemas.
2. `lib/api-client.ts` creates an Axios instance with `baseURL` from an env var (`NEXT_PUBLIC_API_BASE_URL`), defaulting to `/api/mock` in this phase.
3. All reads/writes go through TanStack Query hooks in `hooks/` (e.g. `useListings()`, `useDiscrepancies(listingId)`, `useAgents()`, `useMatchAgents(query)`, `useUpdateDiscrepancy()`) which call the Axios client — never `fetch` mock data directly in a component.
4. Validate responses with the shared Zod schemas at the hook boundary.

This means Phase 2 becomes: stand up the real Express endpoints at the same paths/shapes, change `NEXT_PUBLIC_API_BASE_URL` to point at the Express server, and delete the `app/api/mock` folder. No component or hook code should need to change.

---

## 9. Non-Functional Requirements
- Fully responsive (this is used on desktop primarily, but shouldn't break on tablet).
- Loading states via TanStack Query (`isLoading`) using shadcn `Skeleton` components — no jarring blank screens.
- Empty states for "no discrepancies found" / "no agents matched."
- Toast notifications (shadcn `Sonner`/`Toast`) for actions like "Discrepancy resolved," "Agent saved."
- Accessible forms (labels, error messages tied to fields via RHF + Zod).

---

## 10. Definition of Done (Phase 1 / Client Demo)
- [ ] Client can log in (mock), see the dashboard stats.
- [ ] Client can view the listing audit table, filter to "only issues," open a listing, and see exactly which fields/sites are wrong.
- [ ] Client can type an address's city + price into the social matcher and get back a correct, explainable list of matching agents.
- [ ] Client can view/add/edit agents and their cross-posting preferences.
- [ ] All forms validate properly (Zod) and show sensible errors.
- [ ] All data is obviously "real-looking" (good mock data) even though nothing is live yet.
- [ ] Monorepo builds cleanly with `turbo build`; `apps/api` skeleton exists but is untouched otherwise.
