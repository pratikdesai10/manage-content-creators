# Module: Auth

## Purpose
- Handles user registration, login, JWT token management, and role-based access control

## Responsibilities
- Register creators and agencies with profile creation
- Login with email/password (bcrypt)
- Issue JWT access tokens (15m) and refresh tokens (7d, stored in DB)
- Token refresh and revocation (logout)
- Username and email availability checks
- Provide guards and decorators for route protection

## Architecture
- NestJS module with Passport.js JWT strategy
- Access tokens: signed JWTs with `{sub, email, role}` payload
- Refresh tokens: UUIDs stored in `RefreshToken` table
- Registration uses Prisma transactions for atomicity
- Timing-attack safe login (uses DUMMY_HASH for missing users)

## Folder Structure
```
auth/
├── auth.module.ts          — Module config, imports Passport + JWT
├── auth.service.ts         — Core auth logic (register, login, refresh, logout)
├── auth.controller.ts      — REST endpoints under /auth
├── dto/
│   ├── login.dto.ts            — LoginDto (email, password)
│   ├── register-creator.dto.ts — RegisterCreatorDto + SocialAccountDto
│   ├── register-agency.dto.ts  — RegisterAgencyDto + nested DTOs
│   └── refresh-token.dto.ts    — RefreshTokenDto
├── guards/
│   ├── jwt-auth.guard.ts   — JwtAuthGuard (respects @Public())
│   ├── creator.guard.ts    — CreatorGuard (role === CREATOR)
│   └── agency.guard.ts     — AgencyGuard (role === AGENCY)
├── strategies/
│   └── jwt.strategy.ts     — Passport JWT strategy, validates user exists
└── decorators/
    ├── public.decorator.ts      — @Public() skips JWT check
    └── current-user.decorator.ts — @CurrentUser() extracts req.user
```

## Key Components
- **AuthService** — register, login, refresh, logout, availability checks
- **JwtAuthGuard** — global guard, skips routes with `@Public()`
- **CreatorGuard / AgencyGuard** — role-based route guards
- **JwtStrategy** — validates JWT, fetches user from DB, attaches to request

## Data Flow
- Register: validate DTO → hash password → Prisma transaction (User + Profile) → generate tokens → return
- Login: find user → bcrypt compare → generate tokens → return
- Protected request: JwtAuthGuard → JwtStrategy.validate() → role guard → controller

## Dependencies
- Internal: PrismaModule, ConfigModule
- External: `@nestjs/passport`, `@nestjs/jwt`, `bcrypt`, `class-validator`

## APIs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register/creator` | Public | Creator registration |
| POST | `/auth/register/agency` | Public | Agency registration |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/refresh` | Public | Refresh tokens |
| POST | `/auth/logout` | JWT | Revoke refresh token |
| GET | `/auth/check-username/:username` | Public | Username availability |
| GET | `/auth/check-email/:email` | Public | Email availability |

## Integration
- Exports `JwtAuthGuard`, `CreatorGuard`, `AgencyGuard` for use in Creator/Agency modules
- `JwtStrategy` depends on `PrismaService` to validate users

## Conventions
- All public routes must use `@Public()` decorator
- Protected routes use `@UseGuards(JwtAuthGuard)` + role guard
- Use `@CurrentUser()` to access authenticated user in controllers
- DTOs use `class-validator` decorators for validation

## Testing
- Run: `npm run test` from `backend/`
- Guard and strategy tests use Jest mocks

## Developer Notes
- JWT secret must be set via `JWT_SECRET` env var
- `RegisterCreatorDto` requires at least 1 social account and 1-3 categories
- `RegisterAgencyDto` parses `fullName` into firstName/lastName server-side
