# Agency/Brand Dashboard MVP — Design Spec

## Context

CollabHub connects content creators with agencies/brands. The creator dashboard is fully built with profile sidebar, stat cards with sparklines, social reach chart, recent collaborations, recent messages, and interactive detail panels. The agency side has registration (5-step form) and basic profile CRUD but the dashboard is a **24-line placeholder**. This spec designs the agency dashboard MVP, mirroring the creator dashboard patterns for UX consistency.

## Goal

Build a full-featured agency dashboard that gives brands an at-a-glance view of their campaigns, creator relationships, spend, and communications — using mock data (same approach as creator dashboard).

---

## Layout

Mirror the creator dashboard: **left profile sidebar (288px) + main content area + right detail panels (on click)**.

```
┌──────────────────────────────────────────────────────────────┐
│  Profile Sidebar (288px)  │  Main Content          │ Detail  │
│                           │                        │ Panel   │
│  ┌─────────────────────┐  │  [Stat1][Stat2][Stat3][Stat4]   │
│  │  Logo / Initials    │  │                                  │
│  │  Brand Name         │  │  ┌────────────────────────────┐  │
│  │  Industry Badge     │  │  │ Budget Overview (bar chart) │  │
│  │  Company Size       │  │  └────────────────────────────┘  │
│  │  Description        │  │                                  │
│  │  ──────────────     │  │  ┌────────────┐ ┌────────────┐   │
│  │  Contact Person     │  │  │ Recent     │ │ Recent     │   │
│  │  Designation        │  │  │ Campaigns  │ │ Messages   │   │
│  │  Email              │  │  └────────────┘ └────────────┘   │
│  │  ──────────────     │  │                                  │
│  │  Platforms (badges) │  │  ┌────────────────────────────┐  │
│  │  Budget Range       │  │  │ Top Creators               │  │
│  │  [Edit Profile]     │  │  └────────────────────────────┘  │
│  └─────────────────────┘  │                                  │
└──────────────────────────────────────────────────────────────┘
                            │  [Chat Panel - floating bottom-right]
```

---

## Sections

### 1. Profile Sidebar (`AgencyProfileCard`)

- **Logo** — `logoUrl` image or initials circle (first letter of brandName, colored background)
- **Brand name** (bold, large)
- **Industry badge** — purple tag using `INDUSTRY_LABELS` map
- **Company size** — gray tag using `COMPANY_SIZE_LABELS` map
- **Description** — 3-line truncated (`line-clamp-3`)
- Divider
- **Contact person** — name, designation, email (from `profile.contact`)
- Divider
- **Preferred platforms** — colored badges from `campaignPreferences.platforms` using `PLATFORM_COLORS`
- **Budget range** — labeled from `campaignPreferences.budgetRange` using `BUDGET_RANGE_LABELS`
- **"Edit Profile" button** — purple outlined, same style as creator dashboard

### 2. Stat Cards (4 cards, grid)

| Card | Mock Value | Sparkline Color | Icon |
|------|-----------|----------------|------|
| Active Campaigns | 8 | Green (#059669) | Campaign icon |
| Creators Contacted | 42 | Purple (#7C3AED) | People icon |
| Total Spend | 12.5L | Blue (#0284C7) | Money icon |
| Messages | 15 (4 unread) | Orange (#EA580C) | Message icon |

Each card shows: icon, label, value, change %, period ("last 30 days"), animated SVG sparkline.
Total Spend formatted as INR with L/K suffixes.
Grid becomes 2-col when detail panel is open.

### 3. Budget Overview (`BudgetOverview`)

Horizontal bar chart (same style as creator's Social Reach chart):
- Bars for each CollaborationType: Paid Campaigns, Product Exchange, Affiliate, Brand Ambassador, Event Appearances, Hybrid
- Each bar shows label, colored bar proportional to max, and amount in INR
- Color-coded by type
- **Not clickable** (unlike Social Reach which opens detail panels)

### 4. Recent Campaigns (`CampaignsList`)

List of 3 most recent campaigns:
- Creator initials circle + creator name
- Collaboration type badge (e.g., "Paid Campaign")
- Status badge (green=COMPLETED, blue=ACTIVE, yellow=PENDING, red=CANCELLED)
- Date
- **Clickable** → opens Campaign Detail Panel on right

### 5. Recent Messages (`AgencyMessagesList`)

List of 3 most recent messages from creators:
- Creator initials circle + unread indicator (purple dot)
- Creator name + message preview (truncated)
- Date
- **Clickable** → opens Chat Panel (floating bottom-right)

### 6. Top Creators (`TopCreatorsList`)

List of 3 top-performing creators:
- Avatar circle with initials
- Creator name
- Platform badge (colored by platform)
- Follower count (formatted: 1.2M, 456K, etc.)
- Engagement rate (%)
- **Not clickable** in MVP

---

## Detail Panels

### Campaign Detail Panel (right side, sticky)

Opens when clicking a campaign row. Shows:
- Creator name + initials avatar
- Collaboration type label
- Status badge
- Brief (gray box, line-clamp-3)
- Deliverables list (purple bullet points)
- Timeline and Budget (2-column grid)
- Contact info (name + email)
- Close button (x)

Uses `useQuery` with `getAgencyCampaignDetail()` — lazy-loaded on demand.

### Chat Panel (floating, bottom-right)

Opens when clicking a message row. Shows:
- Fixed position bottom-right, 320x400px, z-index 50
- Creator name + avatar in header
- Message thread (auto-scroll to bottom)
- BRAND messages: right-aligned, purple background
- CREATOR messages: left-aligned, gray background
- Timestamps below messages
- Text input + "Send" button
- Close button (x)

Uses `useQuery` with `getAgencyMessageThread()` — lazy-loaded on demand.

---

## Backend API

6 new endpoints on `AgencyController`, all protected with `JwtAuthGuard + AgencyGuard` + ownership check:

| Method | Route | Response | Description |
|--------|-------|----------|-------------|
| GET | `/agencies/:id/stats` | `AgencyDashboardStats` | Stat card data |
| GET | `/agencies/:id/campaigns` | `AgencyCampaign[]` | 3 recent campaigns |
| GET | `/agencies/:id/messages` | `AgencyMessage[]` | 3 recent messages |
| GET | `/agencies/:id/campaigns/:campaignId` | `AgencyCampaign` | Campaign detail |
| GET | `/agencies/:id/messages/:messageId/thread` | `AgencyMessageWithThread` | Message thread |
| GET | `/agencies/:id/top-creators` | `TopCreator[]` | Top 3 creators |

All return **mock data** (hardcoded in service, keyed by ID for detail lookups).

### Response Types

```typescript
AgencyDashboardStats {
  activeCampaigns: number
  creatorsContacted: number
  totalSpend: number       // in INR
  messageCount: number
  unreadMessages: number
}

AgencyCampaign {
  id: string
  creatorName: string
  creatorAvatar: string | null
  type: string             // CollaborationType
  status: string           // CollaborationStatus
  brief: string | null
  deliverables: string[]
  timeline: string | null
  budget: string | null
  contactPerson: string | null
  contactEmail: string | null
  createdAt: string
}

AgencyMessage {
  id: string
  creatorName: string
  preview: string
  isRead: boolean
  createdAt: string
}

AgencyMessageWithThread extends AgencyMessage {
  threads: MessageThreadEntry[]   // reuse existing type
}

TopCreator {
  id: string
  name: string
  platform: string
  followers: number
  engagementRate: number
  avatarUrl: string | null
}
```

---

## Frontend Types

Expand `AgencyProfile` in `frontend/src/types/index.ts` to match the full Prisma model (currently only has `companyName`, `description`, `website`, `location`). The new interface includes: `brandName`, `companyLegalName`, `industry`, `companySize`, `logoUrl`, `website`, `description`, `brandSocials`, location fields, `targetAudience` (nested), `campaignPreferences` (nested), `contact` (nested), `user`.

---

## Data Flow

```
Agency user logs in → redirected to /dashboard/agency
  ↓
useAuth() gets user from Zustand
  ↓
getAgencyProfiles() fetched → find profile matching user.id → get agencyId
  ↓
4 queries in parallel:
  - getAgencyStats(agencyId)
  - getAgencyCampaigns(agencyId)
  - getAgencyMessages(agencyId)
  - getAgencyTopCreators(agencyId)
  ↓
Render sidebar + main content
  ↓
Click campaign → activePanel = { type: 'campaign', id }
  → getAgencyCampaignDetail() → Campaign Detail Panel
  ↓
Click message → activeChat = { messageId }
  → getAgencyMessageThread() → Chat Panel
```

---

## Files to Modify

| File | Change |
|------|--------|
| `backend/src/agency/agency.service.ts` | Add 6 dashboard methods with mock data |
| `backend/src/agency/agency.controller.ts` | Add 6 guarded endpoint routes |
| `frontend/src/types/index.ts` | Expand `AgencyProfile` interface |
| `frontend/src/api/endpoints.ts` | Add 7 API functions + interfaces |
| `frontend/src/pages/dashboard/AgencyDashboard.tsx` | Replace placeholder with full dashboard |

## Documentation to Update

| File | Update |
|------|--------|
| `backend/src/agency/claude.md` | Add new API routes, service methods |
| `frontend/src/pages/claude.md` | Update AgencyDashboard description |
| `frontend/src/api/claude.md` | Add new endpoint functions |
| `frontend/src/types/claude.md` | Note expanded AgencyProfile |

---

## Verification

1. `cd backend && npm run build` — TypeScript compiles
2. `cd frontend && npm run build` — TypeScript compiles
3. `cd backend && npm run start:dev` — server starts on port 3000
4. `cd frontend && npm run dev` — dev server on port 5173
5. Log in as agency user → verify dashboard renders
6. Check: profile sidebar shows brand data
7. Check: 4 stat cards with sparklines
8. Check: budget overview bar chart
9. Check: 3 recent campaigns, click one → detail panel opens
10. Check: 3 recent messages, click one → chat panel opens
11. Check: top creators section renders
