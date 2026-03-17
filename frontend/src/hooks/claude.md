# Module: Hooks

## Purpose
- Custom React hooks for shared logic

## Responsibilities
- Provide convenient access to auth state and actions

## Folder Structure
```
hooks/
├── useAuth.ts          — Auth state hook
├── useCountUp.ts       — Animated counter (0→target) with IntersectionObserver trigger
└── useMouseParallax.ts — Mouse-driven 3D parallax transforms (disabled on touch devices)
```

## Key Components
- **useAuth()** — returns `{user, token, isAuthenticated, login, logout}` from Zustand store
- **useCountUp(target, duration?)** — returns `{count, ref}`. Animates from 0 to target using rAF + easeOutCubic, triggered when element enters viewport (IntersectionObserver threshold 0.3). Used by StatsBar on landing page.
- **useMouseParallax(intensity?)** — returns a container ref. Applies `perspective(1000px) rotateX/Y` transforms directly to DOM on mousemove within parent. Disabled on touch devices via `(hover: none)` media query. Used by HeroCards on landing page.

## Dependencies
- Internal: `stores/authStore`

## Integration
- `useAuth` — used by Navbar, ProtectedRoute, RoleRoute, dashboard pages
- `useCountUp` — used by landing page StatsBar
- `useMouseParallax` — used by landing page HeroCards

## Conventions
- All custom hooks go in this directory
- Hook names must start with `use`
- Hooks should be thin wrappers — business logic stays in stores or utilities
