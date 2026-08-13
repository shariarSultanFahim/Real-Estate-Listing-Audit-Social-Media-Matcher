# Crescent Sotheby's — Listing Audit & Social Media Matcher
## Comprehensive Frontend User & Architecture Documentation (v1.0.0-beta)

> **Document Purpose**: This documentation outlines the complete feature set, user workflows, component behaviors, permission models, and data flow of the deployed Next.js frontend web application (deployed on Vercel).

---

## 1. Overview & Project Status

- **Project Version**: `v1.0.0-beta` (Phase 1 Frontend Client Demo)
- **Deployment Platform**: Vercel
- **Core Technology Stack**: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS v4, shadcn/ui, TanStack Query v5, Axios, Zod.
- **Architectural Pattern**: Read-only & source-of-truth mirror model for real estate listing discrepancy auditing and agent social media cross-posting matching.

---

## 2. Global Navigation & Layout Architecture

The application uses a persistent sidebar-inset layout with dynamic breadcrumbs, quick-access header controls, and responsive collapse support.

```
+-----------------------------------------------------------------------------------+
| [Sidebar Toggle] | Crescent Sotheby's > [Dynamic Breadcrumb]      [User] [Alerts] [Theme] |
+-----------------------------------------------------------------------------------+
| SIDEBAR NAVIGATION | MAIN PAGE CONTENT AREA                                       |
| - Overview         |                                                              |
| - All Listings     |  - PageHeader (Title, Subtitle, Actions)                     |
| - Add New Listing  |  - Interactive Tables & Filters                               |
| - Social Matcher   |  - Modals & Forms                                            |
| - Agent Directory  |                                                              |
| - Employees        |                                                              |
| - My Profile       |                                                              |
| - Settings         |                                                              |
+--------------------+--------------------------------------------------------------+
```

### Key Header Controls
1. **User Menu (`UserMenu.tsx`)**:
   - Displays the logged-in user avatar, name, and account type (`SuperAdmin` vs `Employee`).
   - **Demo User Switcher**: Instant one-click switching between pre-seeded demo accounts to test permission gating without logging out.
   - Quick link to **My Profile** (`/profile`).
2. **Discrepancy Alerts Popover (`AlertsPopover.tsx`)**:
   - Shows badge count of unaddressed discrepancy alerts across all monitored listings.
   - Clicking an alert navigates directly to the flagged listing audit detail view.
3. **Animated Theme Toggler (`AnimatedThemeToggler.tsx`)**:
   - Seamlessly toggles between Dark, Light, and System color palettes.
4. **Dynamic Breadcrumbs (`DashboardBreadcrumb.tsx`)**:
   - Auto-generates clickable navigation paths based on current route hierarchy.

---

## 3. Detailed Page Workflows & Features

### 3.1 Overview Control Center (`/`)
- **Metric Cards (`StatCards.tsx`)**: Real-time summary cards displaying:
  - **Total Monitored Listings**: Active listings imported into the audit pipeline.
  - **Open Discrepancies**: Flagged mismatches requiring staff attention.
  - **Monitored Agents**: Active agents enrolled in the brokerage directory.
  - **Scanned Outlets**: Total active syndication portals (Zillow, Realtor.com, Homes.com, Sotheby's International, etc.).
- **Discrepancy Breakdown (`DiscrepancyBreakdown.tsx`)**: Visual breakdown of discrepancies grouped by field type (Price, Square Feet, Bedrooms, Photos, Status).
- **Critical Action Widget**: Highlights the top properties requiring immediate audit with one-click inspection links.

### 3.2 Listing Audit Dashboard (`/listings`)
- **View Mode Toggle**:
  - **Only Issues (Default)**: Filters table to display only listings with open portal mismatches.
  - **All Listings**: Displays full brokerage inventory.
- **Search & Filters (`FilterBar.tsx`)**: Search by street address, MLS number, agent name, specific field mismatch (e.g. Price), or specific syndication site (e.g. Zillow).
- **Listing Audit Table (`ListingsTable.tsx`)**:
  - Highlights discrepancy severity badges (`Critical`, `Warning`).
  - Displays mismatched portals and assigned listing agents.

### 3.3 Flagged Listing Audit Detail (`/listings/[id]`)
- **Field Comparison Matrix (`FieldComparisonMatrix.tsx`)**: Side-by-side comparison of **Brokerage Engine (Source of Truth)** data against live data collected from external portals (Zillow, Realtor.com, Homes.com, Sotheby's).
  - Highlights exact field mismatches in red.
- **Photo Comparison Grid (`PhotoComparisonGrid.tsx`)**: Visual inspection grid detecting missing or out-of-order gallery photos across portals.
- **Discrepancy Action Modal (`DiscrepancyActionModal.tsx`)**: Allows staff to resolve or ignore discrepancies with audit notes.

### 3.4 Add & Edit Listing (`/listings/new` & `/listings/[id]/edit`)
- **Step 1: Address Autocomplete Lookup (`AddressLookupStep.tsx`)**: Simulates real-time address validation.
- **Step 2: Listing Essentials Form (`ListingEssentialsForm.tsx`)**:
  - Standardized red asterisk (`*`) for required fields (`FormLabel.tsx`).
  - Integrated shadcn Popover & Calendar date pickers (`date-picker.tsx`).
  - Strict inline Zod validation error messages and highlighted red input borders.

### 3.5 Social Cross-Posting Matcher (`/social-matcher`)
- **Query Input (`SocialCrossPostForm.tsx`)**: Staff input a target listing **City** and **Price**.
- **Automated Matching Engine (`MatchAgentTable.tsx`)**: Evaluates enrolled agents against standing preferences:
  - `Duplicates All`: Matches every listing regardless of location or price.
  - `Area & Price`: Matches only if listing city matches agent service area **and** list price falls within min/max thresholds.
  - `By Request`: Skipped for automatic pairing (requires manual confirmation).
  - `Never`: Excluded from cross-posting.
- **Result Explanation Badges**: Gives clear reasoning for why each agent was matched or excluded.

### 3.6 Brokerage Agent Directory (`/agents` & `/agents/[id]`)
- Filter agents by office location state (`LA`, `MS`, `AL`).
- Enroll new agents or edit cross-posting preferences and price thresholds via `AgentForm.tsx`.
- View assigned listing inventory per agent on the detail view (`/agents/[id]`).

---

## 4. Permission Gating & User Management System

Access is managed through fine-grained feature permissions and account types (`superAdmin` vs `employee`).

### Permission Matrix & Access Controls

| Feature / Action | Permission Key Required | Super Admin | Allowed Employee | Gated UI Component |
| :--- | :--- | :---: | :---: | :--- |
| View Dashboard & Listings | *None (Read-Only Staff)* | Yes | All Employees | Overview & All Listings |
| Add New Property Listing | `listings:create` | Yes | Custom Permitted | `+ Add Listing` Button & `/listings/new` |
| Edit Property Essentials | `listings:edit` | Yes | Custom Permitted | `Edit Essentials` Button & `/listings/[id]/edit` |
| Resolve / Ignore Discrepancy | `discrepancies:resolve` | Yes | Custom Permitted | Resolve Action Buttons |
| Enroll / Edit Agents | `agents:create`, `agents:edit` | Yes | Custom Permitted | `Enroll Agent` & Edit Buttons |
| Use Social Matcher | `socialMatcher:use` | Yes | Custom Permitted | `/social-matcher` Navigation & Route |
| Manage Employees | `users:create`, `users:edit` | Yes | Custom Permitted | `Employees & Permissions` & `/employees*` |
| Portal Settings & Controls | **Super Admin Only** | Yes | **Blocked** | `/settings` Route & Sidebar Nav |
| Edit Own Profile | *Self-Service* | Yes | All Employees | `/profile` Route |

### Pre-Seeded Demo User Accounts for Testing

Use the **User Menu** dropdown in the top right to instantly switch persona:

1. **Eleanor Vance (`admin@cresentsothebys.com`)**: **Super Admin** — Full unrestricted access across all modules, settings, and employee management.
2. **Marcus Brody (`listings@cresentsothebys.com`)**: **Listings Staff** — Has `listings:create`, `listings:edit`, `discrepancies:resolve`. Cannot access employee management or settings.
3. **Sophia Martinez (`social@cresentsothebys.com`)**: **Social Matcher Staff** — Has `socialMatcher:use` only.
4. **David Sterling (`agents@cresentsothebys.com`)**: **Agent Manager** — Has `agents:create`, `agents:edit`, `agents:delete`.
5. **Clara Oswald (`employee@cresentsothebys.com`)**: **Full Standard Employee** — Multi-permitted operational staff.
6. **Hannah Abbott (`hr@cresentsothebys.com`)**: **HR Manager** — Has `users:create`, `users:edit` to manage staff permissions.

---

## 5. Technical Architecture & Mock Data Wiring

The frontend is structured in a Turborepo monorepo to prepare for seamless Phase 2 backend integration:

```
[UI Components / Pages]
         |
         v
[TanStack Query Hooks] (useListings, useUsers, useMatchAgents)
         |
         v
[Axios Client] (lib/api-client.ts) -> baseURL: NEXT_PUBLIC_API_BASE_URL
         |
         v
[Next.js Route Handlers] (app/api/mock/*)
         |
         v
[Shared Zod Schemas] (@real-estate/validation & @real-estate/types)
```

> **Phase 2 Transition**: To connect to a live Express API server in Phase 2, update `NEXT_PUBLIC_API_BASE_URL` in `.env`. No frontend component or hook code will require changes!

---

## 6. Feedback & Iteration Guide for Clients

As this is **`v1.0.0-beta`**, client feedback is welcomed for future iterations:
- **Feature Requests & Suggestions**: Feel free to share additional portal endpoints, audit field checks, or export options.
- **Workflow Modifications**: Adjustments to required fields, form validation rules, or permission groups can be updated easily.
