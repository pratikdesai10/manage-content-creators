# Dark Glassmorphism Redesign — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every CollabHub frontend page to match the landing page's dark glassmorphism aesthetic — `#050510` background, particle canvas, glow orbs, glass cards, gradient accents, and Framer Motion animations.

**Architecture:** Hybrid approach — extract background effects (particles, orbs, dark bg) into a shared layout wrapper rendered once by `PageLayout`. Then restyle each page's content individually using glassmorphism design tokens. Navbar and Footer are updated to always-dark mode.

**Tech Stack:** React 18, Tailwind CSS, Framer Motion, lucide-react

**Spec:** `docs/superpowers/specs/2026-03-18-dark-glassmorphism-redesign.md`

---

## Chunk 1: Shared Infrastructure

### Task 1: Create DarkBackground component

**Files:**
- Create: `frontend/src/components/layout/DarkBackground.tsx`

- [ ] **Step 1: Create DarkBackground.tsx**

```tsx
import { ParticleCanvas } from '../../pages/landing/ParticleCanvas';
import { GlowOrbs } from '../../pages/landing/GlowOrbs';

export function DarkBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[#050510]" />
      <ParticleCanvas />
      <GlowOrbs />
    </div>
  );
}
```

- [ ] **Step 2: Run build to verify import paths**

Run: `cd frontend && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/DarkBackground.tsx
git commit -m "feat: add DarkBackground shared layout component"
```

---

### Task 2: Update PageLayout to use DarkBackground

**Files:**
- Modify: `frontend/src/components/layout/PageLayout.tsx`

- [ ] **Step 1: Update PageLayout.tsx**

Replace the entire component with:

```tsx
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { DarkBackground } from './DarkBackground';

export function PageLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050510] text-white">
      <DarkBackground />
      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/PageLayout.tsx
git commit -m "feat: integrate DarkBackground into PageLayout"
```

---

### Task 3: Update Navbar to always-dark mode

**Files:**
- Modify: `frontend/src/components/layout/Navbar.tsx`

- [ ] **Step 1: Remove isLanding conditional and apply always-dark styles**

Key changes:
- Remove `const isLanding = pathname === '/';` and all `isLanding` ternaries
- Remove `useLocation` import (no longer needed)
- Nav container: `bg-[#050510]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50`
- Logo: `text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent`
- Nav links: `text-sm text-white/70 hover:text-white transition-colors`
- Sign Up button: `text-sm px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25`
- Dropdown menu: `bg-[#0a0a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl`
- Dropdown user info header: `border-b border-white/5`, email `text-xs font-semibold text-white truncate`, role `text-xs text-gray-400`
- Dropdown items: `text-sm text-white/80 hover:bg-white/5 hover:text-white transition`
- Dropdown divider: `border-t border-white/5`
- Logout button: `text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition`

- [ ] **Step 2: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/Navbar.tsx
git commit -m "feat: restyle Navbar to always-dark glassmorphism"
```

---

### Task 4: Update Footer to always-dark mode

**Files:**
- Modify: `frontend/src/components/layout/Footer.tsx`

- [ ] **Step 1: Update Footer.tsx**

Replace with:

```tsx
export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} CollabHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
```

Remove `useLocation` import — no longer needed.

- [ ] **Step 2: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/Footer.tsx
git commit -m "feat: restyle Footer to always-dark"
```

---

### Task 5: Clean up Home.tsx (remove duplicate particles/bg)

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

- [ ] **Step 1: Update Home.tsx**

Remove `ParticleCanvas`, `GlowOrbs` imports and rendering (now provided by layout). Remove the `useEffect` that sets body background color. Keep `landing-page` wrapper but remove `bg-[#050510]`:

```tsx
import { HeroSection } from './landing/HeroSection';
import { StatsBar } from './landing/StatsBar';
import { HowItWorks } from './landing/HowItWorks';
import { FeaturesBentoGrid } from './landing/FeaturesBentoGrid';
import { CreatorShowcase } from './landing/CreatorShowcase';
import { FinalCTA } from './landing/FinalCTA';

export function Home() {
  return (
    <div className="landing-page text-white -mt-16 pt-16 relative overflow-hidden min-h-screen">
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <FeaturesBentoGrid />
      <CreatorShowcase />
      <FinalCTA />
    </div>
  );
}
```

- [ ] **Step 2: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Visual check — open localhost, verify landing page still looks correct with particles/orbs now coming from layout**

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "refactor: remove duplicate particles/bg from Home (now in layout)"
```

---

## Chunk 2: Simple Pages (Login, Settings, EmailVerification, NotFound)

### Task 6: Restyle Login page

**Files:**
- Modify: `frontend/src/pages/Login.tsx`

- [ ] **Step 1: Update Login.tsx to dark glassmorphism**

Key changes:
- Add `import { motion } from 'framer-motion';`
- Wrap entire return in `<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>`
- Container: `max-w-md mx-auto px-4 py-16`
- Heading: `text-3xl font-bold text-white mb-2 text-center`
- Subheading: `text-gray-400 text-center mb-8`
- Card: replace `bg-white rounded-xl shadow-sm border border-gray-200 p-8` with `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8`
- Input class: replace `inputClass` const with `'w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors'`
- Labels: `text-sm font-medium text-gray-400 mb-1`
- Error messages: `text-xs text-red-400 mt-1`
- API error box: `bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm`
- Show/Hide button: `text-gray-500 hover:text-gray-300 text-sm`
- Submit button: `w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5`
- Sign up link: `text-indigo-400 hover:text-indigo-300 font-medium`
- Bottom text: `text-sm text-gray-500`

- [ ] **Step 2: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Login.tsx
git commit -m "feat: restyle Login page to dark glassmorphism"
```

---

### Task 7: Restyle Settings page

**Files:**
- Modify: `frontend/src/pages/Settings.tsx`

- [ ] **Step 1: Update Settings.tsx to dark glassmorphism**

Key changes:
- Add `import { motion } from 'framer-motion';`
- Wrap page in `<motion.div>` with fade-up entry
- Page heading: `text-2xl font-bold text-white mb-8`
- Change Password section: replace `bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6` with `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6`
- Icon colors: replace `text-purple-600` with `text-indigo-400`
- Section headings: `text-lg font-semibold text-white`
- Labels: `text-sm font-medium text-gray-400 mb-1`
- All inputs: `w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-3 py-2 text-sm outline-none transition-colors`
- Eye buttons: `text-gray-500 hover:text-gray-300`
- Error text: `text-xs text-red-400 mt-1`
- Primary buttons: `px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50`
- Update Email section: same glass card pattern
- Current email text: `text-sm text-gray-400 mb-4`, email value `font-medium text-gray-300`
- Delete Account section: replace `bg-white rounded-xl border border-red-200 shadow-sm p-6` with `bg-red-500/[0.04] rounded-2xl border border-red-500/15 p-6`
- Delete heading: `text-lg font-semibold text-red-400`
- Warning box: replace `bg-red-50 rounded-lg p-4` with `bg-red-500/[0.08] border border-red-500/20 rounded-lg p-4`, text `text-sm text-red-300`, icon `text-red-400`
- Delete button: `px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/25`
- Confirm text: `text-sm text-gray-400 font-medium`, `DELETE` span: `font-mono bg-white/10 px-1.5 py-0.5 rounded text-white`
- Cancel button: `px-4 py-2 text-sm font-medium text-white/80 border border-white/20 rounded-lg hover:bg-white/10 transition`
- Confirm delete input: same dark input + `focus:ring-red-500/30 focus:border-red-500/50`

- [ ] **Step 2: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Settings.tsx
git commit -m "feat: restyle Settings page to dark glassmorphism"
```

---

### Task 8: Restyle EmailVerification page

**Files:**
- Modify: `frontend/src/pages/signup/EmailVerification.tsx`

- [ ] **Step 1: Update EmailVerification.tsx to dark glassmorphism**

Key changes:
- Add `import { motion } from 'framer-motion';`
- Outer container: replace `min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-white px-4` with `min-h-[80vh] flex items-center justify-center px-4`
- Wrap card in `<motion.div>` with fade-up entry
- Card: replace `bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-8 max-w-md w-full text-center` with `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 max-w-md w-full text-center`
- Icon circle: replace `bg-purple-100` with `bg-gradient-to-br from-indigo-500/20 to-purple-500/20`, icon color `text-indigo-400`
- Heading: `text-2xl font-bold text-white mb-2`
- Description: `text-gray-400 mb-6`
- Resend button: `w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-indigo-500/25`
- Login link: `text-sm text-indigo-400 hover:text-indigo-300`

- [ ] **Step 2: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/signup/EmailVerification.tsx
git commit -m "feat: restyle EmailVerification page to dark glassmorphism"
```

---

### Task 9: Restyle NotFound page

**Files:**
- Modify: `frontend/src/pages/NotFound.tsx`

- [ ] **Step 1: Update NotFound.tsx to dark glassmorphism**

Replace with:

```tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function NotFound() {
  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-24 text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <h1 className="text-8xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
        404
      </h1>
      <h2 className="text-2xl font-bold text-white mb-4">Page not found</h2>
      <p className="text-gray-400 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
      >
        Go home
      </Link>
    </motion.div>
  );
}
```

- [ ] **Step 2: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/NotFound.tsx
git commit -m "feat: restyle NotFound page to dark glassmorphism"
```

---

### Task 10: Visual review checkpoint — simple pages

- [ ] **Step 1: Start dev server and visually check all simple pages**

Run: `cd frontend && npm run dev`

Check these routes:
- `/` — landing page still works, no duplicate particles
- `/login` — dark glass card, gradient button, dark inputs
- `/settings` — glass sections, dark inputs, red danger zone
- `/signup/verify-email` — centered dark glass card
- `/nonexistent-route` — gradient 404 text

- [ ] **Step 2: Fix any visual issues found**

- [ ] **Step 3: Commit fixes if any**

---

## Chunk 3: Discovery & Public Profiles

### Task 11: Restyle CreatorDiscovery page

**Files:**
- Modify: `frontend/src/pages/creators/CreatorDiscovery.tsx`

- [ ] **Step 1: Update CreatorDiscovery.tsx to dark glassmorphism**

Read the current file first, then apply these changes:
- Add `import { motion } from 'framer-motion';`
- Page container: remove `min-h-screen bg-white`, use `min-h-screen`
- Page content wrapper: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- Page heading: `text-3xl font-bold text-white`
- Subtitle: `text-gray-400`
- Search input: dark input pattern (`bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg`)
- Search icon: `text-gray-500`
- Filters button: `border border-white/20 text-white hover:bg-white/10 rounded-lg backdrop-blur-sm transition-all` with active count badge `bg-indigo-500/20 text-indigo-400`
- Filter panel: `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6`
- Filter section labels: `text-sm font-medium text-gray-400`
- Category/Platform chips inactive: `px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/[0.08] cursor-pointer transition-all`
- Category/Platform chips active: `px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 cursor-pointer transition-all`
- Dropdowns (rate, availability, followers): `bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none`
- City/State inputs: dark input pattern
- Creator cards: `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)] transition-all duration-300 cursor-pointer`
- Card avatar initials: `bg-gradient-to-br from-indigo-500 to-purple-600 text-white`
- Card name: `text-white font-semibold`
- Card handle: `text-gray-500 text-sm`
- Category badges: `bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full text-xs`
- Location: `text-gray-400 text-sm`
- Followers: `text-gray-400 text-sm`
- Availability badge: `bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-xs`
- Wrap card grid items in `<motion.div>` with staggered reveal: `initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}`
- Loading spinner: `border-indigo-500 border-t-transparent`
- Loading text: `text-gray-400`
- Error text: `text-red-400`
- Empty text: `text-gray-500`

- [ ] **Step 2: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/creators/CreatorDiscovery.tsx
git commit -m "feat: restyle CreatorDiscovery to dark glassmorphism"
```

---

### Task 12: Restyle CreatorPublicProfile page

**Files:**
- Modify: `frontend/src/pages/creators/CreatorPublicProfile.tsx`

- [ ] **Step 1: Update CreatorPublicProfile.tsx to dark glassmorphism**

Read the current file first, then apply these changes:
- Add `import { motion } from 'framer-motion';`
- Loading spinner: `border-indigo-500 border-t-transparent`
- Error state: `text-gray-400`, back link `text-indigo-400 hover:text-indigo-300`
- Back link: `text-gray-400 hover:text-white`
- Hero card: replace `bg-white rounded-xl border border-gray-100 shadow-sm p-6` with `rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-white/5 to-purple-500/10 backdrop-blur-sm p-6`
- Avatar initials: `bg-gradient-to-br from-indigo-500 to-purple-600 text-white` (replace `bg-indigo-100 text-indigo-600`)
- Name: `text-2xl font-bold text-white`
- Handle: `text-gray-400 text-sm`
- Category badges: `bg-indigo-500/15 text-indigo-400` (replace `bg-indigo-50 text-indigo-700`)
- Location: `text-gray-400`
- Availability badge: `bg-emerald-500/10 text-emerald-400` (replace `bg-green-50 text-green-700`)
- All section cards (Bio, Social, Content, Additional): replace `bg-white rounded-xl border border-gray-100 shadow-sm p-6` with `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6`
- Section headings: `text-lg font-semibold text-white`
- Bio text: `text-gray-300`
- Social row dividers: `border-white/5` (replace `border-gray-50`)
- Social platform label: `text-white font-medium`
- Social handle: `text-gray-500`
- Social icon: `text-indigo-400` (replace `text-gray-400`)
- Follower count: `text-white font-semibold`
- Engagement rate: `text-gray-500`
- Section sublabels: `text-sm font-medium text-gray-400`
- Content type chips: `bg-white/5 border border-white/10 text-white/70 px-2.5 py-0.5 rounded-full text-xs` (replace `bg-gray-100 text-gray-700`)
- Values (rate, travel): `text-white` (replace `text-gray-900`)
- Portfolio link: `text-indigo-400 hover:text-indigo-300`
- Edit button: `px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25`
- Wrap sections in `<motion.div>` with staggered reveal

- [ ] **Step 2: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/creators/CreatorPublicProfile.tsx
git commit -m "feat: restyle CreatorPublicProfile to dark glassmorphism"
```

---

### Task 13: Restyle AgencyPublicProfile page

**Files:**
- Modify: `frontend/src/pages/agencies/AgencyPublicProfile.tsx`

- [ ] **Step 1: Update AgencyPublicProfile.tsx to dark glassmorphism**

Read the current file first. Apply these changes:
- Add `import { motion } from 'framer-motion';`
- Page container: remove `bg-white min-h-screen`
- Loading spinner: `border-indigo-500 border-t-transparent`
- Error/not found: `text-gray-400`, link `text-indigo-400 hover:text-indigo-300`
- Back link: `text-gray-400 hover:text-white`
- Hero card: gradient glass pattern (`rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-white/5 to-purple-500/10 backdrop-blur-sm p-6`)
- Logo/avatar initials: `bg-gradient-to-br from-indigo-500 to-purple-600 text-white` (replace any `bg-indigo-100 text-indigo-600`)
- Brand name: `text-2xl font-bold text-white`
- Industry text: `text-gray-400 text-sm`
- Company size: `text-gray-400 text-sm`
- Year founded: `text-gray-400 text-sm`
- Website link: `text-indigo-400 hover:text-indigo-300`
- Description section card: standard glass card (`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6`), body `text-gray-300`
- Contact Info section card: standard glass card, contact labels `text-sm font-medium text-gray-400`, values `text-white`, email/phone `text-gray-300`
- Target Audience section card: standard glass card, heading `text-lg font-semibold text-white`, audience chips `bg-indigo-500/15 text-indigo-400 px-2.5 py-0.5 rounded-full text-xs`
- Campaign Preferences section card: standard glass card, sub-headings `text-sm font-medium text-gray-400`, preference chips `bg-white/5 border border-white/10 text-white/70 px-2.5 py-0.5 rounded-full text-xs`, budget/payment values `text-white`
- Brand Socials section card: standard glass card, external links `text-indigo-400 hover:text-indigo-300`, link containers `border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors`
- Edit button: `px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25`
- All section headings: `text-lg font-semibold text-white`
- Wrap sections in staggered `<motion.div>` with `initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}`

- [ ] **Step 2: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/agencies/AgencyPublicProfile.tsx
git commit -m "feat: restyle AgencyPublicProfile to dark glassmorphism"
```

---

### Task 14: Visual review checkpoint — Discovery & Profiles

- [ ] **Step 1: Visually check these routes**

- `/creators` — dark glass filter panel, chip toggles, creator card grid with hover effects
- `/creators/:id` — gradient-glass hero, stacked glass sections (will show error state without backend — verify error state is dark-themed)
- `/agencies/:id` — same patterns, verify error state

- [ ] **Step 2: Fix any visual issues**

- [ ] **Step 3: Commit fixes if any**

---

## Chunk 4: Dashboards

### Task 15: Restyle CreatorDashboard

**Files:**
- Modify: `frontend/src/pages/dashboard/CreatorDashboard.tsx`

- [ ] **Step 1: Read the current file and understand its structure**

This is a large file. Read it fully before making changes.

- [ ] **Step 2: Update CreatorDashboard.tsx to dark glassmorphism**

Key changes throughout the file:
- All `bg-white` → standard glass card pattern (`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm`)
- All `border-gray-100/200` → `border-white/10`
- All `shadow-sm` → remove (glass cards don't need box shadow)
- All `text-gray-900` → `text-white`
- All `text-gray-700` → `text-gray-300`
- All `text-gray-600` → `text-gray-400`
- All `text-gray-500` → `text-gray-500` (keep)
- All `text-gray-400` → `text-gray-500`
- All `hover:bg-gray-50` → `hover:bg-white/5`
- All `border-gray-50` dividers → `border-white/5`
- Profile sidebar: gradient glass card (`rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-white/5 to-purple-500/10 backdrop-blur-sm`)
- Profile avatar: `bg-gradient-to-br from-indigo-500 to-purple-600` (replace `bg-indigo-100`)
- Edit Profile link: `bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/25`
- Stat card values: `text-white`
- Stat badges: keep green/emerald patterns
- Sparkline SVGs: keep existing (they already use colored strokes)
- Collab status badges: `bg-emerald-500/10 text-emerald-400` (active), `bg-amber-500/10 text-amber-400` (pending)
- Brand icons: `bg-indigo-500/15` or `bg-purple-500/15` (replace `bg-indigo-100`)
- Message avatars: gradient circles
- Chat panel: glass card with dark input for compose
- Sent messages: `bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl`
- Received messages: `bg-white/5 border border-white/10 text-gray-300 rounded-2xl`

- [ ] **Step 3: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/dashboard/CreatorDashboard.tsx
git commit -m "feat: restyle CreatorDashboard to dark glassmorphism"
```

---

### Task 16: Restyle AgencyDashboard

**Files:**
- Modify: `frontend/src/pages/dashboard/AgencyDashboard.tsx`

- [ ] **Step 1: Read the current file fully**

- [ ] **Step 2: Update AgencyDashboard.tsx to dark glassmorphism**

Apply the same base replacements as CreatorDashboard throughout the file:
- All `bg-white` → `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm`
- All `border-gray-100/200` → `border-white/10`
- All `shadow-sm` → remove
- All `text-gray-900` → `text-white`
- All `text-gray-700` → `text-gray-300`
- All `text-gray-600` → `text-gray-400`
- All `hover:bg-gray-50` → `hover:bg-white/5`
- All `border-gray-50` dividers → `border-white/5`

Agency-specific elements:
- Profile sidebar: gradient glass card (`rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-white/5 to-purple-500/10 backdrop-blur-sm`)
- Agency avatar/logo: `bg-gradient-to-br from-indigo-500 to-purple-600 text-white`
- Edit Profile link: `bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/25`
- 4 stat cards: glass card pattern, values `text-white`, badges `bg-emerald-500/10 text-emerald-400`
- Budget Overview card: glass card, bar chart track `bg-white/10 rounded-full`, bar fills `bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full`, budget labels `text-gray-400`, budget values `text-white`
- Campaigns list card: glass card, campaign rows `border-white/5` dividers, campaign name `text-white`, campaign meta `text-gray-400`, status badges: active `bg-emerald-500/10 text-emerald-400`, draft `bg-amber-500/10 text-amber-400`, completed `bg-white/10 text-gray-400`
- Messages list card: glass card, avatar gradient circles, message preview `text-gray-500`, timestamp `text-gray-600`
- Top Creators list card: glass card, creator avatars with gradient circles, follower count `text-gray-400`
- Campaign detail panel: glass card with `border-indigo-500/20`, detail labels `text-gray-400`, values `text-white`
- Chat panel: glass card floating bottom-right, sent messages `bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl`, received `bg-white/5 border border-white/10 text-gray-300 rounded-2xl`, compose input dark pattern + primary send button

- [ ] **Step 3: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/dashboard/AgencyDashboard.tsx
git commit -m "feat: restyle AgencyDashboard to dark glassmorphism"
```

---

### Task 17: Visual review checkpoint — Dashboards

- [ ] **Step 1: Check these routes**

- `/dashboard/creator` — glass sidebar, stat cards, collab/message lists
- `/dashboard/agency` — glass sidebar, 4 stat cards, campaigns/messages

- [ ] **Step 2: Fix any issues**

- [ ] **Step 3: Commit fixes if any**

---

## Chunk 5: Edit Profiles

### Task 18: Restyle CreatorEditProfile

**Files:**
- Modify: `frontend/src/pages/dashboard/CreatorEditProfile.tsx`

- [ ] **Step 1: Read the current file fully**

- [ ] **Step 2: Update to dark glassmorphism**

Key changes:
- Add `import { motion } from 'framer-motion';`
- Page heading: `text-2xl font-bold text-white`
- All form section cards: standard glass card pattern
- Section headings with icons: `text-lg font-semibold text-white`, icons `text-indigo-400`
- All `<input>`: dark input pattern
- All `<textarea>`: dark input + `min-h-[80px] resize-vertical`
- All `<select>`: dark select pattern
- All labels: `text-sm font-medium text-gray-400`
- Error text: `text-xs text-red-400`
- Social account rows: nested glass containers `bg-white/[0.03] border border-white/[0.06] rounded-xl p-4`
- Add social button: ghost button pattern
- Remove social button: `text-red-400 hover:text-red-300`
- Chip toggles inactive: `bg-white/5 border border-white/10 text-white/70 hover:bg-white/[0.08]` (replace `bg-white border-gray-300 text-gray-600`)
- Chip toggles active: `bg-indigo-500/20 border border-indigo-500/40 text-indigo-400` (replace `bg-indigo-100 border-indigo-300 text-indigo-700`)
- Cancel button: ghost pattern
- Save button: primary gradient pattern
- Loading spinner: `border-indigo-500 border-t-transparent`
- Error state: `text-red-400`

- [ ] **Step 3: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/dashboard/CreatorEditProfile.tsx
git commit -m "feat: restyle CreatorEditProfile to dark glassmorphism"
```

---

### Task 19: Restyle AgencyEditProfile

**Files:**
- Modify: `frontend/src/pages/dashboard/AgencyEditProfile.tsx`

- [ ] **Step 1: Read the current file fully**

- [ ] **Step 2: Update AgencyEditProfile.tsx to dark glassmorphism**

Apply the same base replacements as CreatorEditProfile throughout the file:
- All `bg-white` section cards → `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6`
- All inputs: `w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-3 py-2 text-sm outline-none transition-colors`
- All selects: same as input + `appearance-none`
- All labels: `text-sm font-medium text-gray-400 mb-1`
- All section headings: `text-lg font-semibold text-white`
- Error text: `text-xs text-red-400`
- Page heading: `text-2xl font-bold text-white`

Agency-specific elements:
- 6 section card icon headers: lucide-react icons with `text-indigo-400` (replace any `text-purple-600` or `text-gray-600`)
- Contact Person section: dark inputs for name, email, phone, designation
- Brand Details section: dark inputs + dark selects for industry (`bg-white/5 border border-white/10 text-white`) and company size dropdowns
- Brand Socials section: icon-prefixed URL inputs — icon `text-gray-500`, input dark pattern
- Location section: dark inputs for city, state, country
- Target Audience section: checkbox toggle groups rendered as chip toggles — inactive `bg-white/5 border border-white/10 text-white/70`, active `bg-indigo-500/20 border border-indigo-500/40 text-indigo-400`. Groups: age ranges, gender, location tiers, languages. Income dropdown: dark select pattern.
- Campaign Preferences section: chip toggle groups for platforms, content types, payment types, follower ranges, creator categories (max 5). Budget/timeline/frequency: dark select dropdowns.
- Cancel button: ghost pattern (`border border-white/20 text-white hover:bg-white/10`)
- Save button: primary gradient pattern
- Loading spinner: `border-indigo-500 border-t-transparent`
- Error state: `text-red-400` with `AlertCircle` icon `text-red-400`
- Not-found state: `text-gray-400`
- Back link: `text-indigo-400 hover:text-indigo-300`

- [ ] **Step 3: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/dashboard/AgencyEditProfile.tsx
git commit -m "feat: restyle AgencyEditProfile to dark glassmorphism"
```

---

### Task 20: Visual review checkpoint — Edit Profiles

- [ ] **Step 1: Check these routes**

- `/dashboard/creator/edit-profile` — glass form sections, dark inputs, chip toggles
- `/dashboard/agency/edit-profile` — glass form sections, 6 sections with icons

- [ ] **Step 2: Fix any issues**

- [ ] **Step 3: Commit fixes if any**

---

## Chunk 6: Signup Wizards & Shared Components

### Task 21: Restyle signup shared components

**Files:**
- Modify: `frontend/src/pages/signup/components/ProgressBar.tsx`
- Modify: `frontend/src/pages/signup/components/StepNavigator.tsx`
- Modify: `frontend/src/pages/signup/components/shared/PasswordStrengthMeter.tsx`
- Modify: `frontend/src/pages/signup/components/shared/PhoneInput.tsx`
- Modify: `frontend/src/pages/signup/components/shared/CategorySelector.tsx`
- Modify: `frontend/src/pages/signup/components/shared/ImageUpload.tsx`
- Modify: `frontend/src/pages/signup/components/shared/SocialAccountEntry.tsx`
- Modify: `frontend/src/pages/signup/components/shared/ChipMultiSelect.tsx`
- Modify: `frontend/src/pages/signup/components/shared/TermsAccordion.tsx`
- Modify: `frontend/src/pages/signup/components/shared/TermsCheckboxGroup.tsx`

- [ ] **Step 1: Read each shared component file**

- [ ] **Step 2: Update ProgressBar.tsx**

- Step indicator track: `bg-white/10` (replace any light bg)
- Completed step fill: `bg-gradient-to-r from-indigo-500 to-purple-600`
- Step numbers: completed `text-white bg-gradient-to-r from-indigo-500 to-purple-600`, pending `text-gray-500 bg-white/10 border border-white/10`
- Step labels: `text-gray-400`

- [ ] **Step 3: Update StepNavigator.tsx**

- Back button: ghost pattern (`border border-white/20 text-white hover:bg-white/10`)
- Next/Submit button: primary gradient pattern

- [ ] **Step 4: Update PasswordStrengthMeter.tsx**

- Bar track: `bg-white/10`
- Strength fills: weak `bg-red-500`, medium `bg-amber-500`, strong `bg-emerald-500`
- Label text: `text-gray-400`

- [ ] **Step 5: Update PhoneInput.tsx**

- Input: dark input pattern
- `+91` prefix: `text-gray-500`

- [ ] **Step 6: Update CategorySelector.tsx**

- Chip toggle inactive/active: same chip pattern from design tokens

- [ ] **Step 7: Update ImageUpload.tsx**

- Drop zone: `border-2 border-dashed border-white/10 rounded-xl bg-white/[0.02] hover:border-indigo-500/30 transition-colors`
- Text: `text-gray-400`
- Icon: `text-gray-500`

- [ ] **Step 8: Update SocialAccountEntry.tsx**

- Container: `bg-white/[0.03] border border-white/[0.06] rounded-xl p-4`
- Inputs/selects: dark patterns
- Remove button: `text-red-400 hover:text-red-300`

- [ ] **Step 9: Update ChipMultiSelect.tsx**

- Same chip toggle pattern (inactive/active)

- [ ] **Step 10: Update TermsAccordion.tsx**

- Container: glass card pattern
- Header: `text-white`
- Content: `text-gray-300`
- Toggle icon: `text-gray-400`

- [ ] **Step 11: Update TermsCheckboxGroup.tsx**

- Checkbox: `accent-indigo-500`
- Labels: `text-gray-300`
- Required label: `text-gray-400`

- [ ] **Step 12: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 13: Commit**

```bash
git add frontend/src/pages/signup/components/
git commit -m "feat: restyle signup shared components to dark glassmorphism"
```

---

### Task 22: Restyle CreatorSignup wizard

**Files:**
- Modify: `frontend/src/pages/signup/CreatorSignup.tsx`
- Modify: `frontend/src/pages/signup/components/creator/PersonalInfoStep.tsx`
- Modify: `frontend/src/pages/signup/components/creator/SocialMediaStep.tsx`
- Modify: `frontend/src/pages/signup/components/creator/ProfileCategoriesStep.tsx`
- Modify: `frontend/src/pages/signup/components/creator/CollaborationPrefsStep.tsx`
- Modify: `frontend/src/pages/signup/components/creator/CreatorReviewStep.tsx`

- [ ] **Step 1: Read all creator signup files**

- [ ] **Step 2: Update CreatorSignup.tsx**

- Container: remove any light backgrounds
- Step content wrapper: glass card pattern
- Keep Framer Motion slide transitions
- Keep confetti on success

- [ ] **Step 3: Update each step component**

For all step components:
- All `bg-white` → remove
- All inputs: dark input pattern
- All labels: `text-sm font-medium text-gray-400`
- All headings: `text-white`
- All body text: `text-gray-300`
- All error text: `text-xs text-red-400`
- Section separators: `border-white/5`

- [ ] **Step 4: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/signup/CreatorSignup.tsx frontend/src/pages/signup/components/creator/
git commit -m "feat: restyle CreatorSignup wizard to dark glassmorphism"
```

---

### Task 23: Restyle AgencySignup wizard

**Files:**
- Modify: `frontend/src/pages/signup/AgencySignup.tsx`
- Modify: `frontend/src/pages/signup/components/agency/AccountManagerStep.tsx`
- Modify: `frontend/src/pages/signup/components/agency/BrandDetailsStep.tsx`
- Modify: `frontend/src/pages/signup/components/agency/LocationAudienceStep.tsx`
- Modify: `frontend/src/pages/signup/components/agency/CampaignPrefsStep.tsx`
- Modify: `frontend/src/pages/signup/components/agency/AgencyReviewStep.tsx`

- [ ] **Step 1: Read all agency signup files**

- [ ] **Step 2: Update AgencySignup.tsx and all agency step components**

Update `AgencySignup.tsx`:
- Container: remove any light backgrounds
- Step content wrapper: glass card pattern (`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm`)
- Keep Framer Motion slide transitions and confetti

Update each agency step component (`AccountManagerStep.tsx`, `BrandDetailsStep.tsx`, `LocationAudienceStep.tsx`, `CampaignPrefsStep.tsx`, `AgencyReviewStep.tsx`):
- All inputs: `w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-3 py-2 text-sm outline-none transition-colors`
- All selects: same as input + `appearance-none`
- All labels: `text-sm font-medium text-gray-400 mb-1`
- All headings: `text-white font-semibold`
- All body/description text: `text-gray-300`
- All error text: `text-xs text-red-400`
- All `bg-white` containers → remove
- All `border-gray-*` → `border-white/10` or `border-white/5`
- All `text-gray-900` → `text-white`
- All `text-gray-700` → `text-gray-300`
- Section separators: `border-white/5`
- Review step summary values: `text-white`, labels `text-gray-400`

- [ ] **Step 3: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/signup/AgencySignup.tsx frontend/src/pages/signup/components/agency/
git commit -m "feat: restyle AgencySignup wizard to dark glassmorphism"
```

---

### Task 24: Visual review checkpoint — Signup flows

- [ ] **Step 1: Check these routes**

- `/signup/creator` — dark wizard with glass step cards, progress bar, dark inputs
- `/signup/agency` — same patterns

- [ ] **Step 2: Fix any issues**

- [ ] **Step 3: Commit fixes if any**

---

## Chunk 7: Final Verification

### Task 25: Full build verification

- [ ] **Step 1: Run production build**

Run: `cd frontend && npm run build`
Expected: Build succeeds with no TypeScript errors

- [ ] **Step 2: Run lint**

Run: `cd frontend && npm run lint`
Expected: No new errors

- [ ] **Step 3: Full visual review of all routes via Playwright or manual browser walkthrough**

Routes to check:
- `/` — landing page (particles from layout, no duplicates)
- `/login` — dark glass login
- `/signup/creator` — dark wizard
- `/signup/agency` — dark wizard
- `/signup/verify-email` — dark glass card
- `/creators` — dark discovery with filters
- `/creators/:id` — dark profile (error state ok)
- `/agencies/:id` — dark profile (error state ok)
- `/dashboard/creator` — dark dashboard
- `/dashboard/agency` — dark dashboard
- `/dashboard/creator/edit-profile` — dark edit form (error state ok)
- `/dashboard/agency/edit-profile` — dark edit form (error state ok)
- `/settings` — dark settings
- `/nonexistent` — dark 404

- [ ] **Step 4: Fix any remaining issues**

- [ ] **Step 5: Final commit**

```bash
git add frontend/src/
git commit -m "fix: final visual polish for dark glassmorphism redesign"
```

---

### Task 26: Update claude.md documentation

- [ ] **Step 1: Update `frontend/src/components/claude.md`**

Add note that Navbar and Footer are always-dark mode, DarkBackground provides particles/orbs globally.

- [ ] **Step 2: Update `frontend/src/pages/claude.md`**

Add note that all pages use dark glassmorphism theme — `bg-[#050510]` provided by layout, glass card pattern for all containers, dark inputs, gradient buttons.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/claude.md frontend/src/pages/claude.md
git commit -m "docs: update claude.md files for dark glassmorphism redesign"
```
