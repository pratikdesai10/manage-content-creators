# Module: Prisma

## Purpose
- Global database access layer using Prisma ORM

## Responsibilities
- Provide `PrismaService` for database operations across all modules
- Handle database connection lifecycle (connect/disconnect)

## Architecture
- Global NestJS module (`@Global()`)
- `PrismaService` extends `PrismaClient` directly
- Implements `OnModuleInit` and `OnModuleDestroy` lifecycle hooks

## Folder Structure
```
prisma/
├── prisma.module.ts   — Global module, exports PrismaService
└── prisma.service.ts  — PrismaService extends PrismaClient
```

## Key Components
- **PrismaService** — injectable service providing all Prisma model access (user, creatorProfile, agencyProfile, socialAccount, agencyContact, refreshToken)

## Data Flow
- App startup → `onModuleInit()` → `$connect()`
- App shutdown → `onModuleDestroy()` → `$disconnect()`
- Any module injects `PrismaService` and uses `this.prisma.{model}.{operation}()`

## Dependencies
- External: `@prisma/client`

## Integration
- Imported once in `AppModule`, available globally
- Used by AuthService, CreatorService, AgencyService, JwtStrategy

## Conventions
- Never import PrismaModule in feature modules (it's global)
- Schema lives at `backend/prisma/schema.prisma`
- Run `npm run db:generate` after schema changes
- Run `npm run db:migrate` for migrations

## Developer Notes
- Models: User, CreatorProfile, AgencyProfile, SocialAccount, AgencyContact, RefreshToken, Collaboration, Message
- Key enums: UserRole, CreatorCategory, SocialPlatform, ContentType, CollaborationType, CollaborationStatus, Availability, TravelScope, RateRange, IndustryCategory, CompanySize, BudgetRange, PaymentType, PaymentTimeline, FollowerRange
- Known limitation: `Message.brandName` is stored as a plain String (no FK to AgencyProfile) — deliberate prototype decision, to be revisited.
