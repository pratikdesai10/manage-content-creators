# Module: Creator

## Purpose
- CRUD operations for creator profiles

## Responsibilities
- List all creator profiles (public)
- Get single creator profile by ID (public)
- Update creator profile (owner only, creator role)

## Architecture
- Standard NestJS module with controller/service pattern
- Uses `USER_SAFE_SELECT` constant to exclude sensitive fields (passwordHash)
- Ownership verification on updates (creator.userId === requestingUser.id)

## Folder Structure
```
creator/
├── creator.module.ts      — Module config, imports AuthModule
├── creator.service.ts     — Business logic for CRUD
├── creator.controller.ts  — REST endpoints under /creators
└── dto/
    └── update-creator.dto.ts — UpdateCreatorDto (all fields optional)
```

## Key Components
- **CreatorService** — `findAll()`, `findOne(id)`, `update(id, userId, dto)`
- **CreatorController** — REST endpoints with role-based guards

## Data Flow
- List: GET /creators → findAll() → return profiles with socialAccounts + user
- Get: GET /creators/:id → findOne() → 404 if not found
- Update: PATCH /creators/:id → verify JWT + CREATOR role → verify ownership → update

## Dependencies
- Internal: AuthModule (guards), PrismaModule (database)
- External: `class-validator`, `@nestjs/swagger`

## APIs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/creators` | Public | List all creators |
| GET | `/creators/:id` | Public | Get creator by ID |
| PATCH | `/creators/:id` | JWT + Creator | Update own profile |

## Integration
- Imports `AuthModule` for `JwtAuthGuard` and `CreatorGuard`
- Uses `@CurrentUser()` decorator to get requesting user
- Queries include `socialAccounts` and `user` relations

## Conventions
- All update fields are optional (partial update pattern)
- Ownership check before any mutation
- Use `USER_SAFE_SELECT` when including user relation

## Testing
- Run: `npm run test` from `backend/`

## Developer Notes
- `UpdateCreatorDto` extends `PartialType` — all fields optional
- Profile includes nested `socialAccounts` in all queries
