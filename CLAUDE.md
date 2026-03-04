# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Monorepo with two sub-projects:
- `backend/` — NestJS REST API (Node 18+, npm, port 3000)
- `frontend/` — React/Vite SPA (Node 18+, npm, port 5173)

---

## backend

### Commands

```bash
cd backend

npm run start:dev        # Dev server with watch (port 3000)
npm run build            # Compile TypeScript to dist/
npm run lint             # ESLint
npm run test             # Jest unit tests

npm run db:migrate       # Prisma migrate dev
npm run db:generate      # Regenerate Prisma client
npm run db:studio        # Prisma Studio GUI
npm run db:seed          # Seed database
```

### Architecture

- **AppModule** imports `ConfigModule` (global), `PrismaModule` (global), and feature modules.
- **PrismaModule** (`src/prisma/`) — global, `PrismaService` extends `PrismaClient`, handles connect/disconnect.
- **ConfigModule** loads `src/config/configuration.ts` — typed factory for `port`, `database.url`, `jwt.secret`, `jwt.expiresIn`.
- **Global middleware** — `HttpExceptionFilter` (shapes all errors), `ResponseTransformInterceptor` (wraps responses in `{success, data, timestamp}`).
- **Feature modules** — `src/auth/`, `src/creator/`, `src/agency/` — scaffolded with TODO stubs.
- **main.ts** — helmet, compression, CORS (localhost:5173 + localhost:3000), global `ValidationPipe`, Swagger at `/api/docs`.

### Environment Variables (backend/.env)

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — signing secret
- `JWT_EXPIRY` — token lifetime (e.g. `7d`)
- `PORT` — defaults to `3000`

---

## frontend

### Commands

```bash
cd frontend

npm run dev              # Vite dev server (port 5173)
npm run build            # Production bundle to dist/
npm run preview          # Preview production build
npm run lint             # ESLint
```

### Architecture

- **Routing** — `react-router-dom` v6 nested routes in `src/App.tsx`. `PageLayout` wraps all routes (Navbar + Outlet + Footer). Protected routes use `ProtectedRoute` + `RoleRoute` guards.
- **Auth state** — Zustand store in `src/stores/authStore.ts`, persisted to localStorage under key `collabhub-auth`. Access via `useAuth()` hook.
- **API client** — Axios instance in `src/api/axios.ts`. Request interceptor attaches JWT from Zustand store. Response interceptor auto-logouts on 401. Endpoint functions go in `src/api/endpoints.ts`.
- **Server state** — TanStack Query v5 via `QueryClientProvider` in `App.tsx`.
- **Styling** — Tailwind CSS v3. Use `cn()` from `src/lib/utils.ts` for conditional classes.
- **Forms** — react-hook-form + zod resolvers (forms not yet implemented in placeholders).

### Environment Variables (frontend/.env)

- `VITE_API_URL` — Backend base URL (default: `http://localhost:3000`)
