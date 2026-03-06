# Flutter Mobile App Scaffold — Design Document

**Date:** 2026-03-05  
**Project:** CollabHub Mobile (`collabhub_mobile`)  
**Status:** Approved

---

## Overview

Add a Flutter mobile app (`mobile/`) to the existing monorepo alongside `backend/` and `frontend/`. Targets Android + iOS only. Mirrors the web frontend's architecture (layer-first structure, JWT auth, same API).

---

## Project Setup

- **Location:** `mobile/` inside monorepo root
- **Flutter:** 3.16+ / Dart 3.2+
- **Package name:** `com.collabhub.mobile`
- **Platforms:** Android + iOS (web/desktop/linux removed)

---

## Dependencies

| Package | Purpose |
|---|---|
| `dio ^5.7` | HTTP client (mirrors axios) |
| `flutter_riverpod ^2.6` + `riverpod_annotation ^2.6` | State management |
| `go_router ^14.6` | Declarative routing |
| `flutter_secure_storage ^9.2` | JWT in keychain/keystore |
| `flutter_form_builder ^9.4` + `form_builder_validators ^11.0` | Forms |
| `cached_network_image ^3.4` | Image caching |
| `flutter_svg ^2.0` | SVG support |
| `google_fonts ^6.2` | Inter font |
| `envied ^0.5` | Env variables from `.env` |
| `json_annotation ^4.9` | JSON serialization annotations |
| **dev:** `build_runner ^2.4` | Code generation |
| **dev:** `json_serializable ^6.9` | JSON codegen |
| **dev:** `envied_generator ^0.5` | Env codegen |
| **dev:** `riverpod_generator ^2.6` | Riverpod codegen |

---

## Directory Structure

```
mobile/
├── lib/
│   ├── main.dart                    # ProviderScope, MaterialApp.router, theme
│   ├── config/
│   │   ├── app_config.dart          # API base URL via envied, constants
│   │   ├── theme.dart               # Material 3, Inter font, light+dark
│   │   └── router.dart              # GoRouter, auth redirect logic
│   ├── models/
│   │   ├── user.dart
│   │   ├── creator_profile.dart
│   │   ├── agency_profile.dart
│   │   └── social_account.dart
│   ├── services/
│   │   ├── api_client.dart          # Dio + JWT interceptor + 401 handler
│   │   ├── auth_service.dart        # login, signup, logout, getMe
│   │   └── storage_service.dart     # flutter_secure_storage wrapper
│   ├── providers/
│   │   ├── auth_provider.dart       # AuthNotifier, isAuthenticated, currentUser
│   │   └── service_providers.dart   # Riverpod providers for services
│   ├── screens/
│   │   ├── splash_screen.dart       # Token check on startup
│   │   ├── home_screen.dart         # Landing: Join as Creator / Agency
│   │   ├── login_screen.dart        # Placeholder form
│   │   ├── signup/
│   │   │   ├── creator_signup_screen.dart  # Placeholder multi-step PageView
│   │   │   └── agency_signup_screen.dart   # Placeholder form
│   │   └── dashboard/
│   │       ├── creator_dashboard_screen.dart
│   │       └── agency_dashboard_screen.dart
│   ├── widgets/
│   │   ├── common/                  # Stub — shared widgets
│   │   └── forms/                   # Stub — form components
│   └── utils/
│       └── validators.dart          # email, phone, URL helpers
├── mobile/.env                      # COLLABHUB_API_URL (gitignored)
├── mobile/.env.example
└── mobile/README.md
```

---

## Auth Flow

1. App starts → `SplashScreen` (initial GoRouter route)
2. `SplashScreen` calls `authNotifier.checkAuth()` → `GET /auth/me` with stored token
3. On success: navigate to role-based dashboard (`/dashboard/creator` or `/dashboard/agency`)
4. On failure/no token: navigate to `/`
5. GoRouter `redirect`: any `/dashboard/*` route without auth → `/login`

**Token storage:** `flutter_secure_storage`, key `auth_token`.  
**Dio interceptor:** reads token from `StorageService` on every request. On 401 → clears token, notifies `AuthNotifier` to reset state.

---

## Routing

| Path | Screen | Guard |
|---|---|---|
| `/splash` | SplashScreen | — (initial) |
| `/` | HomeScreen | — |
| `/login` | LoginScreen | — |
| `/signup/creator` | CreatorSignupScreen | — |
| `/signup/agency` | AgencySignupScreen | — |
| `/dashboard/creator` | CreatorDashboardScreen | auth required |
| `/dashboard/agency` | AgencyDashboardScreen | auth required |

---

## Data Models

All models mirror the TypeScript interfaces in `frontend/src/types/index.ts` exactly.

- **UserRole** — Dart enum: `creator`, `agency` (JSON values: `"CREATOR"`, `"AGENCY"`)
- **User** — `id`, `email`, `role`, `createdAt`, `updatedAt`
- **SocialAccount** — `id`, `platform`, `handle`, `followersCount`, `creatorId`
- **CreatorProfile** — `id`, `userId`, `displayName`, `bio?`, `niche: List<String>`, `location?`, `socialAccounts`, `user`
- **AgencyProfile** — `id`, `userId`, `companyName`, `description?`, `website?`, `location?`, `user`
- **AuthResponse** — `accessToken`, `user`

All use `@JsonSerializable()` with generated `fromJson`/`toJson`.

---

## Theme

- Material 3 (`useMaterial3: true`)
- Primary seed color: `#6C63FF` (purple)
- Font: Inter via `google_fonts`
- `AppTheme.lightTheme` and `AppTheme.darkTheme` via `ColorScheme.fromSeed()`

---

## Environment Config

Single `mobile/.env` file (gitignored):
```
COLLABHUB_API_URL=http://localhost:3000
```

`envied` generates `mobile/lib/config/env.g.dart` from this. `AppConfig` reads `Env.apiBaseUrl`.

---

## Decisions

- **Layer-first structure** chosen over feature-first — matches frontend pattern, appropriate for early-stage
- **Single .env file** — mirrors backend/frontend, no per-flavor complexity yet
- **No web/desktop** — Android + iOS only per spec; reduces build surface
