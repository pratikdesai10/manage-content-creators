# Module: Services

## Purpose
- API communication and secure token storage

## Responsibilities
- HTTP client with JWT interceptor and 401 handling
- Auth API calls (login, register, getMe, checkEmail)
- Secure token storage (keychain/keystore)

## Folder Structure
```
services/
├── api_client.dart     — Dio HTTP client with JWT interceptor
├── auth_service.dart   — Auth API methods
└── storage_service.dart — flutter_secure_storage wrapper
```

## Key Components
- **ApiClient** — Dio instance with:
  - Base URL from `AppConfig.apiBaseUrl`
  - Request interceptor: reads token from StorageService, attaches `Authorization: Bearer`
  - Error interceptor: on 401 → deletes token, fires `onUnauthorized` callback
- **AuthService** — API methods:
  - `login({email, password})` → POST `/auth/login`, saves token
  - `registerCreator(payload)` → POST `/auth/register/creator`, saves token
  - `registerAgency(payload)` → POST `/auth/register/agency`, saves token
  - `getMe()` → GET `/auth/me`
  - `checkEmail(email)` → GET `/auth/check-email/{email}`
  - `logout()` → deletes stored token
- **StorageService** — `flutter_secure_storage` wrapper
  - `saveToken(token)`, `getToken()`, `deleteToken()`, `clearAll()`
  - Key: `auth_token`
  - Android: uses `encryptedSharedPreferences`

## Data Flow
- AuthService.login() → ApiClient.post() → save token to StorageService → return AuthResponse
- Subsequent requests: ApiClient interceptor reads token from StorageService → attaches header
- 401 response: interceptor clears token → fires onUnauthorized → AuthNotifier resets state

## Dependencies
- Internal: `config/app_config`, `models/user`
- External: `dio`, `flutter_secure_storage`

## Integration
- Instantiated via Riverpod providers in `providers/service_providers.dart`
- ApiClient's `onUnauthorized` callback set by `AuthNotifier.build()`

## Conventions
- All API calls go through `AuthService`, not direct `ApiClient` usage in screens
- Token is read from storage on every request (not cached in memory)
- Add new API methods to `AuthService` or create new service classes
