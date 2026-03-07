# Module: Config

## Purpose
- Centralized, typed application configuration loaded from environment variables

## Responsibilities
- Load and validate environment variables
- Provide typed config access via NestJS `ConfigService`

## Architecture
- Uses NestJS `ConfigModule.forRoot()` with a factory function
- Loaded globally in `AppModule`

## Folder Structure
```
config/
└── configuration.ts — Config factory function
```

## Key Components
- **configuration()** — factory returning typed config object:
  - `port` — from `PORT` (default: `3000`)
  - `database.url` — from `DATABASE_URL`
  - `jwt.secret` — from `JWT_SECRET` (default: `'change-me-in-production'`)
  - `jwt.accessTokenExpiresIn` — from `JWT_ACCESS_EXPIRY` (default: `'15m'`)
  - `jwt.refreshTokenExpiresIn` — from `JWT_REFRESH_EXPIRY` (default: `'7d'`)

## Dependencies
- Internal: none
- External: `@nestjs/config`

## Integration
- Consumed via `ConfigService.get('jwt.secret')` pattern in any injectable
- Used by AuthModule (JWT config), main.ts (port)

## Conventions
- Access config only through `ConfigService`, never read `process.env` directly
- Add new env vars here with sensible defaults
- Document new vars in root `CLAUDE.md` and `backend/.env.example`

## Developer Notes
- Environment variables: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`
