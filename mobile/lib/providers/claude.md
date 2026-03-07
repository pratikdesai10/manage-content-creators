# Module: Providers

## Purpose
- Riverpod state management and dependency injection

## Responsibilities
- Manage auth state (user, login, register, logout)
- Provide service instances (StorageService, ApiClient, AuthService)
- Derive convenience providers (currentUser, isAuthenticated)

## Folder Structure
```
providers/
├── auth_provider.dart      — AuthNotifier + derived providers
└── service_providers.dart  — DI providers for services
```

## Key Components
- **AuthNotifier** (`Notifier<AsyncValue<User?>>`) — core auth state manager
  - `checkAuth()` — fetches `/auth/me`, sets user or null
  - `login(email, password)` — calls AuthService.login()
  - `registerCreator(payload)` — calls AuthService.registerCreator()
  - `registerAgency(payload)` — calls AuthService.registerAgency()
  - `logout()` — clears token and state
- **authNotifierProvider** — `NotifierProvider` for AuthNotifier
- **currentUserProvider** — derives `User?` from auth state
- **isAuthenticatedProvider** — derives `bool` from currentUser
- **storageServiceProvider** — provides StorageService
- **apiClientProvider** — provides ApiClient (depends on storage)
- **authServiceProvider** — provides AuthService (depends on apiClient + storage)

## Data Flow
- `authNotifierProvider` → reads `authServiceProvider` → calls API → updates `AsyncValue<User?>`
- `currentUserProvider` derives from `authNotifierProvider`
- `isAuthenticatedProvider` derives from `currentUserProvider`
- Router reads `isAuthenticatedProvider` for redirect guards

## Dependencies
- Internal: `services/*`, `models/user`
- External: `flutter_riverpod`

## Integration
- `authNotifierProvider` used by screens for login/register/logout
- `isAuthenticatedProvider` used by router for auth guards
- `currentUserProvider` used by dashboard screens

## Conventions
- Service DI via Riverpod providers in `service_providers.dart`
- Auth state via `AuthNotifier` — never manage auth state elsewhere
- Access providers via `ref.read()` for actions, `ref.watch()` for reactive UI
