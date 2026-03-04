# CollabHub Backend

NestJS REST API backend for the CollabHub platform.

## Prerequisites

- Node.js 18+
- PostgreSQL (running locally or via Docker)
- npm

## Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd backend
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `DATABASE_URL`, `JWT_SECRET`, and `JWT_EXPIRY`.

3. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000`.
   Swagger documentation: `http://localhost:3000/api/docs`.

## Available Scripts

| Script | Description |
|---|---|
| `npm run start:dev` | Start in watch mode |
| `npm run start:prod` | Start compiled production build |
| `npm run build` | Compile TypeScript |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed the database |
