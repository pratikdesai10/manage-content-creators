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
│   ├── PageLayout.tsx    — Navbar + DarkBackground + Outlet + Footer wrapper (dark theme)
│   ├── DarkBackground.tsx — Fixed full-screen dark bg (#050510) + ParticleCanvas + GlowOrbs (z-0, pointer-events-none)
│   ├── Navbar.tsx        — Always-dark glassmorphism nav (gradient logo, glass dropdown)
│   └── Footer.tsx        — Always-dark footer (border-white/5)
├── common/
│   ├── ProtectedRoute.tsx — Redirects unauthenticated to /login
│   └── RoleRoute.tsx      — Redirects wrong role to /
└── ui/
    └── .gitkeep           — Reserved for reusable UI primitives
```

## Key Components

- **PageLayout** — wraps all routes via React Router `<Outlet />`; renders `DarkBackground` as first child, applies `bg-[#050510] text-white` globally, main content at `relative z-10`
- **DarkBackground** — shared background layer: renders `bg-[#050510]` fixed bg, `ParticleCanvas`, and `GlowOrbs` (imported from `pages/landing/`). Present on every page.
- **Navbar** — always-dark glassmorphism: `bg-[#050510]/80 backdrop-blur-md border-b border-white/10`; gradient logo (`from-indigo-400 to-purple-400`); `text-white/70` links; gradient Sign Up button; glass dropdown (`bg-[#0a0a1a]/95 backdrop-blur-xl`); no light/dark conditional
- **Footer** — always-dark: `border-t border-white/5`, `text-gray-600`; no light/dark conditional
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
