# Module: Agency

## Purpose
- CRUD operations for agency profiles
- Agency dashboard data (stats, campaigns, messages, top creators)

## Responsibilities
- List all agency profiles (public)
- Get single agency profile by ID (public)
- Update agency profile (owner only, agency role)
- Provide dashboard stats, recent campaigns, messages, and top creators (owner only)
- Provide campaign detail and message thread lookups (owner only)

## Architecture
- Standard NestJS module with controller/service pattern
- Uses `USER_SAFE_SELECT` constant to exclude sensitive fields
- Ownership verification on updates (agency.userId === requestingUser.id)

## Folder Structure
```
agency/
├── agency.module.ts      — Module config, imports AuthModule
├── agency.service.ts     — Business logic for CRUD
├── agency.controller.ts  — REST endpoints under /agencies
└── dto/
    └── update-agency.dto.ts — UpdateAgencyDto (all fields optional)
```

## Key Components
- **AgencyService** — `findAll()`, `findOne(id)`, `update(id, userId, dto)`, `getDashboardStats(agencyId)`, `getRecentCampaigns(agencyId)`, `getRecentAgencyMessages(agencyId)`, `getCampaignDetail(agencyId, campaignId)`, `getAgencyMessageThread(agencyId, messageId)`, `getTopCreators(agencyId)`
- **AgencyController** — REST endpoints with role-based guards

## Data Flow
- List: GET /agencies → findAll() → return profiles with contact + user
- Get: GET /agencies/:id → findOne() → 404 if not found
- Update: PATCH /agencies/:id → verify JWT + AGENCY role → verify ownership → update
- Stats: GET /agencies/:id/stats → verify JWT + AGENCY role → verify ownership → getDashboardStats()
- Campaigns: GET /agencies/:id/campaigns → verify JWT + AGENCY role → verify ownership → getRecentCampaigns()
- Messages: GET /agencies/:id/messages → verify JWT + AGENCY role → verify ownership → getRecentAgencyMessages()
- Campaign Detail: GET /agencies/:id/campaigns/:campaignId → verify JWT + AGENCY role → verify ownership → getCampaignDetail()
- Message Thread: GET /agencies/:id/messages/:messageId/thread → verify JWT + AGENCY role → verify ownership → getAgencyMessageThread()
- Top Creators: GET /agencies/:id/top-creators → verify JWT + AGENCY role → verify ownership → getTopCreators()

## Dependencies
- Internal: AuthModule (guards), PrismaModule (database)
- External: `class-validator`, `@nestjs/swagger`

## APIs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/agencies` | Public | List all agencies |
| GET | `/agencies/:id` | Public | Get agency by ID |
| PATCH | `/agencies/:id` | JWT + Agency | Update own profile |
| GET | `/agencies/:id/stats` | JWT + Agency (owner) | Get dashboard stats (activeCampaigns, creatorsContacted, totalSpend, messageCount, unreadMessages) |
| GET | `/agencies/:id/campaigns` | JWT + Agency (owner) | Get 3 most recent campaigns |
| GET | `/agencies/:id/messages` | JWT + Agency (owner) | Get 3 most recent messages |
| GET | `/agencies/:id/campaigns/:campaignId` | JWT + Agency (owner) | Get campaign detail (brief, deliverables, timeline, budget, contact) |
| GET | `/agencies/:id/messages/:messageId/thread` | JWT + Agency (owner) | Get message thread with all entries |
| GET | `/agencies/:id/top-creators` | JWT + Agency (owner) | Get top 3 creators with engagement metrics |

## Integration
- Imports `AuthModule` for `JwtAuthGuard` and `AgencyGuard`
- Uses `@CurrentUser()` decorator to get requesting user
- Queries include `contact` (AgencyContact) and `user` relations

## Conventions
- All update fields are optional (partial update pattern)
- Ownership check before any mutation
- Use `USER_SAFE_SELECT` when including user relation

## Testing
- Run: `npm run test` from `backend/`

## Developer Notes
- `UpdateAgencyDto` extends `PartialType` — all fields optional
- Profile includes nested `contact` in all queries
- `targetAudience` and `campaignPreferences` stored as JSON columns
- Dashboard endpoints return mock data (hardcoded in service) — campaigns, messages, and top creators are static arrays keyed by ID for detail lookups
- All dashboard endpoints call `findOne(agencyId)` first to validate agency exists before returning mock data
