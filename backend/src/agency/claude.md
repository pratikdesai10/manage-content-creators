# Module: Agency

## Purpose
- CRUD operations for agency profiles

## Responsibilities
- List all agency profiles (public)
- Get single agency profile by ID (public)
- Update agency profile (owner only, agency role)

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
- **AgencyService** — `findAll()`, `findOne(id)`, `update(id, userId, dto)`
- **AgencyController** — REST endpoints with role-based guards

## Data Flow
- List: GET /agencies → findAll() → return profiles with contact + user
- Get: GET /agencies/:id → findOne() → 404 if not found
- Update: PATCH /agencies/:id → verify JWT + AGENCY role → verify ownership → update

## Dependencies
- Internal: AuthModule (guards), PrismaModule (database)
- External: `class-validator`, `@nestjs/swagger`

## APIs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/agencies` | Public | List all agencies |
| GET | `/agencies/:id` | Public | Get agency by ID |
| PATCH | `/agencies/:id` | JWT + Agency | Update own profile |

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
