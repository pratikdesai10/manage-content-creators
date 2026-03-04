# CollabHub Frontend

React/Vite/TypeScript frontend for the CollabHub platform.

## Prerequisites

- Node.js 18+
- npm

## Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if your backend runs on a different port.

3. **Start dev server**
   ```bash
   npm run dev
   ```
   App available at `http://localhost:5173`.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Compile and bundle for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Folder Structure

```
src/
├── api/          # Axios instance and API endpoint functions
├── components/
│   ├── common/   # ProtectedRoute, RoleRoute guards
│   ├── layout/   # Navbar, Footer, PageLayout
│   └── ui/       # Reusable UI components (to be added)
├── hooks/        # useAuth and other custom hooks
├── lib/          # cn() utility and other helpers
├── pages/        # Route-level page components
├── stores/       # Zustand state stores
└── types/        # Shared TypeScript interfaces
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Backend API base URL |
