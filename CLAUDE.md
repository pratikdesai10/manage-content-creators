# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CollabHub** — A platform connecting content creators with agencies/brands for collaborations. Monorepo with three sub-projects sharing a common data model.

## Tech Stack

| Layer    | Stack                                                                                    |
| -------- | ---------------------------------------------------------------------------------------- |
| Backend  | NestJS, TypeScript, Prisma, PostgreSQL, Passport JWT, Swagger                            |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Query, react-hook-form + Zod |
| Mobile   | Flutter 3.16+, Dart, Riverpod, GoRouter, Dio, flutter_secure_storage                     |

## High-Level Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │     │    Mobile    │     │   Backend    │
│  React/Vite  │────▶│   Flutter    │────▶│   NestJS     │
│  Port 5173   │     │  iOS/Android │     │  Port 3000   │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                                          ┌──────▼───────┐
                                          │  PostgreSQL   │
                                          │   (Prisma)    │
                                          └──────────────┘
```

- **Backend** — REST API with JWT auth, role-based access (Creator/Agency)
- **Frontend** — SPA with multi-step signup, dashboards, Zustand auth state
- **Mobile** — Flutter app mirroring frontend features, Riverpod state management

## Folder Structure

```
manage-content-creators/
├── CLAUDE.md              ← You are here (navigation + rules)
├── backend/               ← NestJS REST API
│   ├── prisma/            ← Schema + migrations
│   └── src/
│       ├── auth/          ← Auth, JWT, guards, registration
│       ├── creator/       ← Creator profile CRUD
│       ├── agency/        ← Agency profile CRUD
│       ├── prisma/        ← Database service (global)
│       ├── common/        ← Filters, interceptors, HTTP client
│       └── config/        ← Environment config
├── frontend/              ← React/Vite SPA
│   └── src/
│       ├── api/           ← Axios client + endpoints
│       ├── components/    ← Layout + route guards
│       ├── pages/         ← Route pages + signup flows
│       ├── stores/        ← Zustand auth store
│       ├── hooks/         ← Custom React hooks
│       ├── types/         ← TypeScript types + constants
│       ├── schemas/       ← Zod validation schemas
│       └── lib/           ← Utilities (cn)
└── mobile/                ← Flutter app
    └── lib/
        ├── config/        ← Router, theme, env config
        ├── models/        ← Data models (json_serializable)
        ├── providers/     ← Riverpod auth + DI providers
        ├── screens/       ← Page widgets + signup flows
        ├── services/      ← API client, auth, storage
        ├── widgets/       ← Reusable UI components
        └── utils/         ← Enums, validators
```

## Commands

### Backend

```bash
cd backend
npm run start:dev        # Dev server (port 3000)
npm run build            # Compile TypeScript
npm run lint             # ESLint
npm run test             # Jest unit tests
npm run db:migrate       # Prisma migrate dev
npm run db:generate      # Regenerate Prisma client
npm run db:studio        # Prisma Studio GUI
npm run db:seed          # Seed database
```

### Frontend

```bash
cd frontend
npm run dev              # Vite dev server (port 5173)
npm run build            # Production bundle
npm run preview          # Preview build
npm run lint             # ESLint
```

### Mobile

```bash
cd mobile
flutter pub get
flutter run
flutter run -d ios / -d android
dart run build_runner build --delete-conflicting-outputs  # Code generation
flutter analyze
```

## Environment Variables

### backend/.env

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT signing secret
- `JWT_ACCESS_EXPIRY` — Access token lifetime (default: `15m`)
- `JWT_REFRESH_EXPIRY` — Refresh token lifetime (default: `7d`)
- `PORT` — Server port (default: `3000`)

### frontend/.env

- `VITE_API_URL` — Backend base URL (default: `http://localhost:3000`)

### mobile/.env

- `COLLABHUB_API_URL` — Backend base URL (default: `http://localhost:3000`)

---

## Module Documentation

### Backend

- [backend/src/auth/claude.md](backend/src/auth/claude.md) — Auth, JWT, guards, registration
- [backend/src/creator/claude.md](backend/src/creator/claude.md) — Creator profile CRUD
- [backend/src/agency/claude.md](backend/src/agency/claude.md) — Agency profile CRUD
- [backend/src/prisma/claude.md](backend/src/prisma/claude.md) — Database service
- [backend/src/common/claude.md](backend/src/common/claude.md) — Filters, interceptors, HTTP client
- [backend/src/config/claude.md](backend/src/config/claude.md) — Environment config

### Frontend

- [frontend/src/api/claude.md](frontend/src/api/claude.md) — Axios client + endpoints
- [frontend/src/components/claude.md](frontend/src/components/claude.md) — Layout + route guards
- [frontend/src/pages/claude.md](frontend/src/pages/claude.md) — Route pages + signup flows
- [frontend/src/stores/claude.md](frontend/src/stores/claude.md) — Zustand auth store
- [frontend/src/hooks/claude.md](frontend/src/hooks/claude.md) — Custom hooks
- [frontend/src/types/claude.md](frontend/src/types/claude.md) — TypeScript types + constants
- [frontend/src/schemas/claude.md](frontend/src/schemas/claude.md) — Zod validation schemas
- [frontend/src/lib/claude.md](frontend/src/lib/claude.md) — Utilities

### Mobile

- [mobile/lib/config/claude.md](mobile/lib/config/claude.md) — Router, theme, env config
- [mobile/lib/models/claude.md](mobile/lib/models/claude.md) — Data models
- [mobile/lib/providers/claude.md](mobile/lib/providers/claude.md) — Riverpod providers
- [mobile/lib/screens/claude.md](mobile/lib/screens/claude.md) — Screen widgets
- [mobile/lib/services/claude.md](mobile/lib/services/claude.md) — API + storage services
- [mobile/lib/widgets/claude.md](mobile/lib/widgets/claude.md) — Reusable widgets
- [mobile/lib/utils/claude.md](mobile/lib/utils/claude.md) — Enums + validators

---

## AI Development Rules

- **Read first**: When working on any module, ALWAYS read that module's `claude.md` before making changes.
- **Follow conventions**: Adhere to the architecture and conventions defined in each module's documentation.
- **Understand before modifying**: Do not modify modules without understanding their documentation and data flow.
- **Update docs**: When adding new functionality to a module, update that module's `claude.md`.
- **Cross-layer sync**: When modifying types/enums, check and update across all three layers (backend Prisma schema, frontend types, mobile enums/models).
- **New modules**: When creating a new module, create a `claude.md` using the template at `docs/claude-module-template.md`.
- **Post-development doc review**: After completing any development work, review all affected `claude.md` files across the project and update them to reflect new APIs, components, data flows, types, or behavioral changes. Check backend, frontend, and mobile modules that were touched or impacted.

## Cross-Cutting Concerns

- **Auth flow**: Backend issues JWT (15m) + refresh token (7d). Frontend stores in Zustand/localStorage. Mobile stores in flutter_secure_storage. All clients auto-logout on 401.
- **API response format**: All backend responses wrapped in `{success, data, timestamp, traceId}`. Errors: `{statusCode, timestamp, path, message, traceId}`.
- **Validation**: Backend uses class-validator DTOs. Frontend uses Zod schemas. Mobile uses custom Validators class. Keep rules in sync.
- **Enums**: Source of truth is `backend/prisma/schema.prisma`. Mirrored in `frontend/src/types/*.types.ts` and `mobile/lib/utils/enums.dart`.
