# Module: Config

## Purpose
- App configuration: routing, theming, and environment variables

## Responsibilities
- Define all app routes with GoRouter
- Auth redirect guards for protected routes
- Material 3 theme (light + dark)
- Load API base URL from environment at build time

## Folder Structure
```
config/
├── router.dart       — GoRouter provider with auth redirects
├── theme.dart        — AppTheme with light/dark Material 3 themes
├── app_config.dart   — Env vars via envied + AppConfig constants
└── app_config.g.dart — Generated code for envied
```

## Key Components
- **routerProvider** — GoRouter with routes:
  - `/splash` → SplashScreen (initial)
  - `/` → HomeScreen
  - `/login` → LoginScreen
  - `/signup/creator`, `/signup/agency`, `/signup/verify-email`
  - `/dashboard/creator`, `/dashboard/agency` (auth-protected)
- **AppTheme** — `lightTheme` and `darkTheme` using `ColorScheme.fromSeed(#6C63FF)`, Inter font
- **AppConfig** — `apiBaseUrl`, `appName`, `authTokenKey`

## Dependencies
- Internal: `providers/auth_provider` (isAuthenticatedProvider for route guards), all screen files
- External: `go_router`, `flutter_riverpod`, `google_fonts`, `envied`

## Integration
- `routerProvider` used in `main.dart` via `MaterialApp.router`
- `AppTheme` used in `main.dart` for `theme` and `darkTheme`
- `AppConfig.apiBaseUrl` used by `ApiClient`

## Conventions
- Add new routes in `router.dart`
- Protected routes must have redirect guard checking `isAuthenticatedProvider`
- Run `dart run build_runner build --delete-conflicting-outputs` after changing `.env`
