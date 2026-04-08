# CollabHub Deployment Guide

**Stack:** NestJS backend + React/Vite frontend  
**Cost:** $0  
**Platforms:** Neon (database) · Render (backend) · Vercel (frontend)

---

## First-Time Setup

Follow these steps **in order** — each step depends on the previous one.

### Step 1 — Neon (PostgreSQL Database)

1. Sign up at https://neon.tech with GitHub (no credit card needed)
2. Create Project → name: `collabhub`, pick your nearest region
3. Dashboard → **Connection Details** → set dropdown to **Prisma**
4. Copy the full connection string — looks like:
   ```
   postgresql://collabhub_owner:xxxx@ep-xxx.aws.neon.tech/collabhub?sslmode=require
   ```
   Save this — you'll need it in Step 2.

---

### Step 2 — Render (NestJS Backend)

1. Sign up at https://render.com with GitHub
2. Dashboard → **New + → Web Service** → connect the `manage-content-creators` repo
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install --include=dev && npm run build && npx prisma generate`
   - **Start Command:** `npx prisma migrate deploy && node dist/main`
   - **Instance Type:** Free

4. Add environment variables:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Neon connection string from Step 1 |
   | `PORT` | `3000` |
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | A strong random string (generate with command below) |
   | `JWT_ACCESS_EXPIRY` | `15m` |
   | `JWT_REFRESH_EXPIRY` | `7d` |
   | `ALLOWED_ORIGINS` | *(leave blank — fill after Step 3)* |

   **Generate JWT_SECRET** (run in your terminal):
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. Click **Create Web Service** — first deploy takes 3-5 min
6. Once status shows **Live**, visit:
   ```
   https://your-render-url.onrender.com/api/docs
   ```
   Swagger UI should appear. Save the Render URL.

---

### Step 3 — Vercel (React Frontend)

1. Sign up at https://vercel.com with GitHub
2. **Add New → Project** → import `manage-content-creators`
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `tsc -b && vite build`
   - **Output Directory:** `dist`

4. Add environment variable:
   - `VITE_API_URL` = `https://your-render-url.onrender.com`

5. Click **Deploy** — takes ~1-2 min
6. You'll get a URL like `https://collabhub-xxx.vercel.app`. Save it.

---

### Step 4 — Wire CORS + Seed Mock Data

**CORS (required):**
1. Go to Render → your web service → **Environment** tab
2. Set `ALLOWED_ORIGINS` = your Vercel URL (e.g. `https://collabhub-xxx.vercel.app`)
3. Render auto-redeploys. Wait for it to go Live again.

**Seed mock data (one-time only):**
1. Render → your web service → **Shell** tab
2. Run:
   ```bash
   npm run db:seed
   ```
3. Wait ~30-60 seconds. It populates creators, agencies, collaborations, etc.

> **Important:** Only run seed once. Running it again will wipe and re-seed the database.

---

### Verify Everything Works

- [ ] `https://your-render-url.onrender.com/api/docs` — Swagger loads
- [ ] `https://your-vercel-url.vercel.app` — React app loads
- [ ] Sign up in the UI completes without error
- [ ] No CORS errors in browser DevTools console
- [ ] Browser Network tab shows API calls going to Render URL (not localhost)

---

## Deploying Latest Code (After Setup)

**Both Render and Vercel auto-deploy whenever you push to `main`.** You don't need to do anything manually.

### Normal workflow

```bash
# Make your changes locally, then:
git add .
git commit -m "feat: your change"
git push origin main
```

- **Vercel** detects the push and rebuilds the frontend automatically (~1-2 min)
- **Render** detects the push and rebuilds the backend automatically (~3-5 min)
- **Database migrations** — if you added new Prisma migrations, they run automatically on the next Render deploy via `npx prisma migrate deploy` in the Start Command

### Checking deploy status

| Platform | Where to check |
|----------|---------------|
| Render | Dashboard → your service → **Events** tab |
| Vercel | Dashboard → your project → **Deployments** tab |

### If a deploy fails

1. Check the build logs (Render: **Logs** tab, Vercel: **Deployments → click the failed deploy**)
2. Fix the issue locally, push again — a new deploy starts automatically

---

## Free Tier Limitations

| Platform | Limitation | Workaround |
|----------|-----------|------------|
| Render | Backend **sleeps after 15 min of inactivity**. First request after sleep takes ~30-60s | Sign up at https://uptimerobot.com (free), create a monitor to ping `https://your-render-url.onrender.com/api/docs` every 5 min |
| Neon | 0.5 GB storage, 190 compute hours/month | Enough for early-stage apps |
| Vercel | 100 GB bandwidth/month | Far more than needed |

---

## Environment Variables Reference

### Render (backend)

```
DATABASE_URL=postgresql://...@...neon.tech/collabhub?sslmode=require
PORT=3000
NODE_ENV=production
JWT_SECRET=<64-char random hex>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
ALLOWED_ORIGINS=https://your-vercel-url.vercel.app
```

### Vercel (frontend)

```
VITE_API_URL=https://your-render-url.onrender.com
```

### Local development (backend/.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/collabhub
PORT=3000
JWT_SECRET=any-local-dev-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```
