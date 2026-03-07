# Module: Stores

## Purpose
- Client-side state management using Zustand

## Responsibilities
- Store authenticated user, JWT token, and auth status
- Persist auth state to localStorage across page refreshes
- Provide login/logout actions

## Folder Structure
```
stores/
└── authStore.ts — Zustand auth store with persistence
```

## Key Components
- **useAuthStore** — Zustand store with `persist` middleware
  - State: `user: User | null`, `token: string | null`, `isAuthenticated: boolean`
  - Actions: `login(response: AuthResponse)`, `logout()`
  - Storage key: `collabhub-auth`

## Data Flow
- Login success → `login({access_token, user})` → sets token + user + isAuthenticated
- Logout → `logout()` → clears all state
- Page refresh → rehydrated from localStorage

## Dependencies
- Internal: `types/index` (User, AuthResponse)
- External: `zustand`, `zustand/middleware`

## Integration
- Read by `api/axios.ts` interceptor (token attachment, auto-logout)
- Consumed via `hooks/useAuth` in components
- Accessed directly (non-React) in Axios interceptor via `useAuthStore.getState()`

## Conventions
- Access in React components via `useAuth()` hook, not store directly
- Access outside React (interceptors) via `useAuthStore.getState()`
- Add new global state as separate Zustand stores, not in authStore
