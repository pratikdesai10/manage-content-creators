# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Monorepo with three sub-projects:

- `backend/` — NestJS REST API (Node 18+, npm, port 3000)
- `frontend/` — React/Vite SPA (Node 18+, npm, port 5173)
- `mobile/` — Flutter mobile app (Android + iOS, Flutter 3.16+)

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

---

## mobile

### Commands

```bash
cd mobile

flutter pub get                                          # Install dependencies
flutter run                                             # Run on connected device/emulator
flutter run -d ios                                      # iOS simulator
flutter run -d android                                  # Android emulator
dart run build_runner build --delete-conflicting-outputs  # Generate .g.dart files (models, env, providers)
dart run build_runner watch --delete-conflicting-outputs  # Watch mode during development
flutter analyze                                         # Dart static analysis
```

### Architecture

- **Entry point** — `lib/main.dart`: `ProviderScope` wraps `CollabHubApp` (ConsumerWidget), uses `MaterialApp.router` with GoRouter and Material 3 theme.
- **Routing** — `lib/config/router.dart`: GoRouter with `initialLocation: /splash`. Auth redirect guards all `/dashboard/*` routes — unauthenticated users redirected to `/login`.
- **Auth state** — `lib/providers/auth_provider.dart`: `AuthNotifier` (`StateNotifier<AsyncValue<User?>>`). Exposes `checkAuth`, `login`, `signupCreator`, `signupAgency`, `logout`. Companion providers: `currentUserProvider`, `isAuthenticatedProvider`.
- **API client** — `lib/services/api_client.dart`: Dio instance with JWT interceptor (reads token from `StorageService` on every request). On 401: clears token, fires `onUnauthorized` callback to reset auth state.
- **Token storage** — `lib/services/storage_service.dart`: `flutter_secure_storage` wrapper (keychain/keystore). Key: `auth_token`.
- **Models** — `lib/models/`: `User`, `AuthResponse`, `UserRole` enum, `CreatorProfile`, `AgencyProfile`, `SocialAccount`. All use `json_serializable` with generated `fromJson`/`toJson`. Mirror TypeScript interfaces in `frontend/src/types/`.
- **Theme** — `lib/config/theme.dart`: Material 3, primary seed `#6C63FF`, Inter font via `google_fonts`, light + dark via `ColorScheme.fromSeed`.
- **Env config** — `lib/config/app_config.dart`: `envied` reads `COLLABHUB_API_URL` from `mobile/.env` at build time.

### Environment Variables (mobile/.env)

- `COLLABHUB_API_URL` — Backend base URL (default: `http://localhost:3000`)
  - For Android device testing use LAN IP: `http://192.168.x.x:3000`

### Code Generation

Required after modifying models, `.env`, or providers:

```bash
dart run build_runner build --delete-conflicting-outputs
```
