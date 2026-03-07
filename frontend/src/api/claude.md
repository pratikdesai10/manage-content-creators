# Module: API

## Purpose
- HTTP client layer for communicating with the backend

## Responsibilities
- Configure Axios instance with base URL and interceptors
- Attach JWT Bearer token to all requests
- Auto-logout on 401 responses
- Provide typed endpoint functions for auth operations

## Folder Structure
```
api/
├── axios.ts      — Axios instance with interceptors
└── endpoints.ts  — API endpoint functions
```

## Key Components
- **api (axios.ts)** — Axios instance, base URL from `VITE_API_URL`
  - Request interceptor: reads token from Zustand auth store, attaches `Authorization: Bearer`
  - Response interceptor: calls `logout()` on 401
- **registerCreator(data)** — POST `/auth/register/creator`, cleans empty optional fields
- **registerAgency(data)** — POST `/auth/register/agency`, transforms form data to backend payload
- **checkUsername(username)** — GET `/auth/check-username/{username}` → `{available: boolean}`
- **checkEmail(email)** — GET `/auth/check-email/{email}` → `{available: boolean}`

## Data Flow
- Component calls endpoint fn → Axios interceptor adds token → backend API → response/error

## Dependencies
- Internal: `stores/authStore` (for token and logout)
- External: `axios`

## Integration
- Used by signup pages, PersonalInfoStep (username/email checks)
- Token sourced from Zustand store (not React context)

## Conventions
- All endpoint functions go in `endpoints.ts`
- Always use the shared `api` instance, never create new Axios instances
- Clean/transform data in endpoint functions before sending to backend
- Return `response.data.data` (unwrap backend's `ApiResponse` wrapper)
