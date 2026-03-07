# Module: Components

## Purpose

- Shared layout and route guard components

## Responsibilities

- Provide consistent page layout (Navbar + content + Footer)
- Protect routes based on authentication status
- Protect routes based on user role

## Folder Structure

```
components/
├── layout/
│   ├── PageLayout.tsx    — Navbar + Outlet + Footer wrapper
│   ├── Navbar.tsx        — Top navigation, auth-aware links
│   └── Footer.tsx        — Copyright footer
├── common/
│   ├── ProtectedRoute.tsx — Redirects unauthenticated to /login
│   └── RoleRoute.tsx      — Redirects wrong role to /
└── ui/
    └── .gitkeep           — Reserved for reusable UI primitives
```

## Key Components

- **PageLayout** — wraps all routes via React Router `<Outlet />`
- **Navbar** — shows login/signup for guests, dashboard/logout for authenticated users
- **ProtectedRoute** — checks `isAuthenticated`, redirects to `/login`
- **RoleRoute** — checks `user.role` matches required role prop

## Dependencies

- Internal: `hooks/useAuth`
- External: `react-router-dom`

## Integration

- `PageLayout` is the root route element in `App.tsx`
- `ProtectedRoute` and `RoleRoute` used as nested route wrappers in `App.tsx`

## Conventions

- Layout components go in `layout/`
- Route guards go in `common/`
- Reusable UI primitives (buttons, inputs, modals) go in `ui/`
- Use `cn()` from `lib/utils` for conditional Tailwind classes
