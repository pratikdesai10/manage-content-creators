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

- **CreatorService** — `findAll()`, `findOne(id)`, `update(id, userId, dto)`, `getDashboardStats(creatorId)`, `getRecentCollaborations(creatorId)`, `getRecentMessages(creatorId)`, `getCollaborationDetail(creatorId, collabId)`, `getMessageThread(creatorId, messageId)`, `getSocialAccountDetail(creatorId, accountId)`
- **CreatorController** — REST endpoints with role-based guards

## Data Flow

- List: GET /creators → findAll() → return profiles with socialAccounts + user
- Get: GET /creators/:id → findOne() → 404 if not found
- Update: PATCH /creators/:id → verify JWT + CREATOR role → verify ownership → update
- Stats: GET /creators/:id/stats → verify JWT + CREATOR role → verify ownership → getDashboardStats()
- Collaborations: GET /creators/:id/collaborations → verify JWT + CREATOR role → verify ownership → getRecentCollaborations()
- Messages: GET /creators/:id/messages → verify JWT + CREATOR role → verify ownership → getRecentMessages()
- Collab Detail: GET /creators/:id/collaborations/:collabId → verify JWT + CREATOR role → verify ownership → getCollaborationDetail()
- Message Thread: GET /creators/:id/messages/:messageId/thread → verify JWT + CREATOR role → verify ownership → getMessageThread()
- Social Account Detail: GET /creators/:id/social-accounts/:accountId → verify JWT + CREATOR role → verify ownership → getSocialAccountDetail()

## Dependencies

- Internal: AuthModule (guards), PrismaModule (database)
- External: `class-validator`, `@nestjs/swagger`

## APIs

| Method | Route                                      | Auth                  | Description                                                                            |
| ------ | ------------------------------------------ | --------------------- | -------------------------------------------------------------------------------------- |
| GET    | `/creators`                                | Public                | List all creators                                                                      |
| GET    | `/creators/:id`                            | Public                | Get creator by ID                                                                      |
| PATCH  | `/creators/:id`                            | JWT + Creator         | Update own profile                                                                     |
| GET    | `/creators/:id/stats`                      | JWT + Creator (owner) | Get dashboard stats (profileViews, collaborationCount, messageCount)                   |
| GET    | `/creators/:id/collaborations`             | JWT + Creator (owner) | Get 3 most recent collaborations                                                       |
| GET    | `/creators/:id/messages`                   | JWT + Creator (owner) | Get 3 most recent messages                                                             |
| GET    | `/creators/:id/collaborations/:collabId`   | JWT + Creator (owner) | Get collaboration detail (brief, deliverables, timeline, budget, contact)              |
| GET    | `/creators/:id/messages/:messageId/thread` | JWT + Creator (owner) | Get message thread with all entries (sender, text, sentAt)                             |
| GET    | `/creators/:id/social-accounts/:accountId` | JWT + Creator (owner) | Get social account analytics (engagementRate, avgLikes, growthPercent, topContentType) |

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
