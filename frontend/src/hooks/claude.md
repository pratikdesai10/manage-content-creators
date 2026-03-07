# Module: Hooks

## Purpose
- Custom React hooks for shared logic

## Responsibilities
- Provide convenient access to auth state and actions

## Folder Structure
```
hooks/
└── useAuth.ts — Auth state hook
```

## Key Components
- **useAuth()** — returns `{user, token, isAuthenticated, login, logout}` from Zustand store

## Dependencies
- Internal: `stores/authStore`

## Integration
- Used by Navbar, ProtectedRoute, RoleRoute, dashboard pages

## Conventions
- All custom hooks go in this directory
- Hook names must start with `use`
- Hooks should be thin wrappers — business logic stays in stores or utilities
