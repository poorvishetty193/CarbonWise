# CarbonWise — AI-Powered Carbon Footprint Tracker

> *Track what you emit, reduce what matters — powered by Claude AI and real IPCC science.*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Anthropic Claude](https://img.shields.io/badge/Claude-3%20Haiku-orange?style=flat-square&logo=anthropic)](https://anthropic.com)
[![Firebase](https://img.shields.io/badge/Firebase-10-yellow?style=flat-square&logo=firebase)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Vitest](https://img.shields.io/badge/Tests-26%20Passing-brightgreen?style=flat-square)](./lib/__tests__)

---

## 📋 Table of Contents

1. [Vertical Chosen](#1-vertical-chosen)
2. [Approach & Logic](#2-approach--logic)
3. [How the Solution Works](#3-how-the-solution-works)
4. [Features](#4-features)
5. [Services & Libraries Used](#5-services--libraries-used)
6. [Architecture](#6-architecture)
7. [Assumptions Made](#7-assumptions-made)
8. [Setup Instructions](#8-setup-instructions)
9. [Environment Variables](#9-environment-variables)
10. [Running Tests](#10-running-tests)
11. [Code Quality Standards](#11-code-quality-standards)
12. [Security Implementation](#12-security-implementation)
13. [Accessibility](#13-accessibility)
14. [Performance](#14-performance)
15. [Project Structure](#15-project-structure)
16. [License](#16-license)

---

## 1. Vertical Chosen

**Climate Action & Personal Sustainability**

Climate change is driven disproportionately by individual lifestyle choices — transport, food, energy, and shopping — yet most people have no quantitative understanding of their personal contribution. CarbonWise addresses this by giving individuals a daily carbon ledger with science-backed emission factors sourced from IPCC AR6 guidelines. The platform serves environmentally conscious individuals, students, and organizations wanting to reduce their footprint through measurable, data-driven behavioral change. By combining real carbon science with gamification and streaming AI coaching, CarbonWise transforms abstract emissions data into a competitive, rewarding personal challenge.

---

## 2. Approach & Logic

### Design Philosophy

- **Climate urgency meets calm science** — dark greens and glassmorphism convey seriousness without alarm fatigue.
- **Quantify first, advise second** — every recommendation is anchored to real kg CO₂e values, never vague guilt.
- **Compete to improve** — gamification (streaks, badges, leaderboards) sustains long-term engagement.

### AI Strategy

CarbonWise uses **Anthropic Claude 3 Haiku** (`claude-3-haiku-20240307`) via the official `@anthropic-ai/sdk` for all AI features:

| Feature | What AI Does |
|---|---|
| **Weekly Insights** | Analyses the user's activity summary JSON against their weekly carbon budget, then streams a personalised 3-step reduction plan in Markdown |
| **Carbon Scoring Context** | Provides qualitative framing of the computed kg CO₂e number — whether it is above, at, or below the user's target |
| **Mock Fallback** | When `ANTHROPIC_API_KEY` is absent (development/demo mode), a pre-written streaming response simulates the full experience with zero API cost |

### Decision Making Logic

1. User logs an activity (category → subcategory → amount/units).
2. `/api/carbon-score` computes emissions: `amount × EMISSION_FACTOR[category][subcategory]` using IPCC AR6 coefficients.
3. The result is persisted to Firestore under `activities/{activityId}` (user-scoped).
4. On the Insights page, the full weekly activity summary is serialised to JSON and sent to `/api/ai-insights`.
5. Claude receives a structured system prompt defining its role as a non-preachy climate coach, then streams a Markdown response word-by-word.
6. The leaderboard aggregates weekly totals server-side via Firebase Admin SDK and writes them under `leaderboard/{weekId}/entries/{userId}` — users can only read, never write.

### Why This Approach Wins

Rather than a simple chatbot, CarbonWise grounds every AI response in a user's real, quantified activity log — Claude cannot hallucinate numbers that contradict the data it receives. The sliding-window rate limiter and Edge Runtime ensure consistent sub-200ms API response initiation at global scale, while streaming eliminates the perceived wait for AI-generated content.

---

## 3. How the Solution Works

### Data Flow

```
User Input (Browser)
        ↓
Next.js Frontend (React 18 + TypeScript — App Router)
        ↓
Next.js API Routes (Edge Runtime) ← All secrets live here
        ↓
 ┌──────────────────────────────────┐
 │  Anthropic Claude 3 Haiku        │  ← /api/ai-insights (streaming SSE)
 │  Firebase Admin SDK              │  ← /api/login, /api/logout
 │  Carbon Calculator (IPCC AR6)    │  ← /api/carbon-score
 │  Firebase Analytics              │  ← /api/analytics
 └──────────────────────────────────┘
        ↓
Streamed / Structured JSON Response
        ↓
React UI renders with skeleton loaders + Framer Motion animations
```

### Key Technical Decisions

| Decision | Reason |
|---|---|
| **Edge Runtime on AI route** | Faster cold starts, lower global latency for streaming |
| **Streaming SSE responses** | Real-time word-by-word feel; no waiting for full Claude response |
| **Firestore for persistence** | Real-time listeners (`onSnapshot`) for live score updates without polling |
| **Firebase Admin lazy getters** | `getAdminDb()` / `getAdminAuth()` prevent build-time crashes during `next build` |
| **In-memory rate limiting** | Sliding window, 10 req/IP/60s — no Redis needed for hackathon scale |
| **`next/dynamic` with `ssr: false`** | All chart/animation components bypass SSR to prevent prerender failures |
| **SWC compiler (no Babel)** | Native speed; handles private class methods in `undici`/`firebase` without plugins |
| **Zero `any` TypeScript** | Type safety enforced across entire codebase; all catch blocks use `error: unknown` |

### API Routes

| Route | Method | Runtime | Purpose |
|---|---|---|---|
| `/api/ai-insights` | POST | Edge | Stream Claude 3 Haiku personalised carbon coaching |
| `/api/carbon-score` | POST | Edge | Calculate kg CO₂e from activity inputs (IPCC AR6) |
| `/api/analytics` | POST | Edge | Server-side Firebase Analytics event relay |
| `/api/login` | POST | Edge | Create Firebase session cookie (httpOnly, secure) |
| `/api/logout` | POST | Edge | Clear Firebase session cookie |

---

## 4. Features

### 🌍 Activity Logger — Log Your Daily Carbon Footprint
Users log activities across four scientifically categorised domains: **Transport**, **Food**, **Energy**, and **Shopping**. Each subcategory maps to an IPCC AR6 emission factor. The form validates inputs with real-time carbon previews using `/api/carbon-score` before writing to Firestore. A `CategoryPicker` component renders each category with colour-coded visual cues, dynamically imported to avoid SSR conflicts.

### 🤖 AI Insights — Streaming Climate Coach
The Insights page collects the full weekly activity log, serialises it to JSON, and streams the response from Claude 3 Haiku via SSE. The system prompt instructs Claude to act as a non-preachy, practical coach, structuring output with Markdown headers and bulleted action steps. When no API key is configured, a mock streamer delivers a sample response at realistic speed — ideal for demos.

### 📊 Real-Time Carbon Dashboard — Live Score Tracking
The dashboard home renders a live carbon score using `useRealtimeScore` (Firestore `onSnapshot` listener), a `WeeklyBar` chart (Recharts) showing 7-day emissions, an `EmissionsRing` donut chart, and an `ImpactGlobe` 3D visualisation — all dynamically imported to guarantee SSR safety. A `CarbonPulse` animated indicator shows whether the user is above or below budget.

### 🏆 Leaderboard — Compete to Reduce
A weekly leaderboard (`leaderboard/{weekId}/entries/{userId}`) aggregates users by total kg CO₂e saved relative to a baseline. Scores are written exclusively by the Firebase Admin SDK server-side — Firestore rules block all client writes. The `useLeaderboard` hook subscribes in real time so rankings update without a page refresh.

### 🎖️ Gamification — Badges & Streaks
Five achievement badges (defined in `lib/constants.ts`): **Carbon Pioneer** (first log), **Climate Advocate** (3-day streak), **Herbivore Hero** (vegan day), **Shield of Earth** (5 days under budget), **Rider on the Rail** (zero private vehicle week). `useUserStreak` computes consecutive tracking days from Firestore, and `useCarbonBudget` monitors weekly totals against a user-defined target with alert events sent to Firebase Analytics.

### 👤 User Profile & Budget Setting
The Profile page allows users to set a weekly carbon budget (kg CO₂e/week), view earned badges, and see their historical trend. Budget data persists in Firestore under `users/{userId}` with strict auth-scoped read/write rules.

---

## 5. Services & Libraries Used

### Google / Firebase Services

| Service | Integration | Files | Purpose |
|---|---|---|---|
| **Firebase Authentication** | `firebase/auth` + `firebase-admin` + `next-firebase-auth-edge` | `lib/firebase/client.ts`, `lib/firebase/admin.ts`, `middleware.ts` | Email/password auth, session cookies, route protection |
| **Cloud Firestore** | `firebase/firestore` (client) + `firebase-admin` (server) | `lib/firebase/admin.ts`, `app/actions/activity.ts`, `app/actions/user.ts`, all hooks | Activity log, user profiles, leaderboard, real-time listeners |
| **Firebase Analytics** | `firebase/analytics` + `logEvent` | `lib/analytics.ts`, `lib/firebase/client.ts` | 10 tracked engagement events (see `ANALYTICS_EVENTS` in `lib/constants.ts`) |
| **Google Fonts** | `next/font/google` | `app/layout.tsx` | **Inter** (body) + **Fraunces** (display headings) |

### AI

| Service | SDK | Files | Purpose |
|---|---|---|---|
| **Anthropic Claude 3 Haiku** | `@anthropic-ai/sdk ^0.22.0` | `app/api/ai-insights/route.ts` | Streaming personalised carbon reduction coaching |

### Core Framework

| Library | Version | Purpose |
|---|---|---|
| **Next.js** | `^14.1.4` | App Router, SSR, API routes, image optimisation |
| **React** | `^18.2.0` | UI rendering, hooks, Suspense |
| **TypeScript** | `^5.3.3` | Static typing throughout |
| **Tailwind CSS** | `^3.4.1` | Utility-first styling, custom design tokens |

### UI & Visualisation

| Library | Version | Purpose |
|---|---|---|
| **Recharts** | `^2.12.3` | `WeeklyBar` bar chart, `EmissionsRing` donut chart |
| **Framer Motion** | `^11.0.8` | Page transitions, micro-animations, `PageTransition` component |
| **Lucide React** | `^0.359.0` | Icon system throughout the UI |
| **clsx + tailwind-merge** | `^2.1.0 / ^2.2.2` | Conditional class merging without conflicts |

### Security & Data

| Library | Version | Purpose |
|---|---|---|
| **isomorphic-dompurify** | `^2.0.0` | XSS sanitisation on all user string inputs before Firestore writes |
| **date-fns** | `^3.6.0` | Date arithmetic for streaks, weekly grouping, leaderboard windows |

### Development & Testing

| Library | Version | Purpose |
|---|---|---|
| **Vitest** | `^1.3.1` | Test runner (replaces Jest) |
| **@testing-library/react** | `^14.2.1` | Component-level test utilities |
| **jsdom** | `^24.0.0` | DOM environment for Vitest |
| **@next/bundle-analyzer** | `^14.1.4` | Bundle size inspection |

---

## 6. Architecture

### Page → Component Pattern

```
app/(dashboard)/[page]/page.tsx       →  Server Component (metadata + auth boundary)
                                               ↓
components/[page]/[Page]Client.tsx    →  Client Component (state, effects, real-time)
                                               ↓
hooks/use[Feature].ts                 →  Custom hook (Firestore subscription / API call)
                                               ↓
lib/                                  →  Pure logic (calculator, sanitize, rate-limit)
```

### Firestore Security Model

```
/users/{userId}            →  read/write: auth.uid == userId
/activities/{activityId}   →  read/write: auth.uid == resource.data.uid
/leaderboard/{weekId}/
  entries/{userId}         →  read: authenticated users
                              write: false (Admin SDK only)
```

---

## 7. Assumptions Made

1. **Authentication required** — all dashboard routes require a Firebase session; anonymous browsing is not supported.
2. **Emission factors are global averages** — IPCC AR6 coefficients are used without regional grid-intensity customisation (e.g., UK vs US electricity).
3. **Weekly budget is user-defined** — the app does not attempt to calculate a "fair share" automatically; users input their own target.
4. **In-memory rate limiter** — works correctly on single-instance deployments. In a horizontally-scaled environment, a Redis-backed store (e.g., Upstash) would be required.
5. **Leaderboard writes are server-only** — the current implementation computes leaderboard totals via a server action triggered by activity logs; a proper Cloud Function scheduler is assumed for production at scale.
6. **No offline PWA** — a service worker is not implemented; the app requires an active internet connection.
7. **Anthropic Claude API availability** — the AI Insights feature gracefully degrades to a mock streamer if `ANTHROPIC_API_KEY` is absent.
8. **Date arithmetic uses local time** — streak calculations use `date-fns` with the browser's local timezone; users spanning midnight across timezones may see unexpected streak breaks.

---

## 8. Setup Instructions

### Prerequisites

- **Node.js** 18.17 or higher
- **npm** 9 or higher
- **Firebase project** — [create one free](https://console.firebase.google.com)
- **Anthropic API key** — [get one free at console.anthropic.com](https://console.anthropic.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/poorvishetty193/CarbonWise.git
cd CarbonWise

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Open .env.local and fill in your keys (see Section 9)

# 4. Start the development server
npm run dev
# Open http://localhost:3000
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → Create project → Enable **Authentication** (Email/Password).
2. Enable **Firestore Database** in production mode.
3. Deploy the security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add   # select your project
   firebase deploy --only firestore:rules
   ```
4. Generate a **Service Account key**: Project Settings → Service Accounts → Generate new private key.
5. Copy the JSON values into the `FIREBASE_ADMIN_*` env vars below.

### Production Build

```bash
npm run build
npm run start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker compose up --build

# Or build the image manually
docker build -t carbonwise .
docker run -p 3000:3000 --env-file .env.local carbonwise
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
# Add all environment variables in the Vercel dashboard
```

### Deploy to Firebase App Hosting (Recommended for SSR)

```bash
firebase apphosting:backends:create
firebase deploy
```

---

## 9. Environment Variables

```env
# ============================================================
# CARBONWISE — ENVIRONMENT VARIABLES
# Copy this file to .env.local and fill in your values.
# NEVER commit .env.local to version control.
# ============================================================

# ── AI (server-side only — no NEXT_PUBLIC_ prefix) ──────────
ANTHROPIC_API_KEY=sk-ant-...

# ── Firebase Admin SDK (server-side only) ───────────────────
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# ── Firebase Client SDK (safe to expose — non-secret) ───────
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ── App ─────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Session ─────────────────────────────────────────────────
COOKIE_SECRET_KEY_CURRENT=a-strong-random-secret-min-32-chars
COOKIE_SECRET_KEY_PREVIOUS=another-strong-random-secret-32-chars

# ── Rate Limiting ────────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

> ⚠️ **Security:** Variables without `NEXT_PUBLIC_` are server-side only and are **never** bundled into the browser. The Firebase Admin private key must remain confidential.

---

## 10. Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file change)
npm run test:watch

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Full quality gate (type-check + lint + test + build)
npx tsc --noEmit && npm run lint && npm test && npm run build
```

### Test Coverage

| File | What It Tests |
|---|---|
| `lib/__tests__/carbon-calculator.test.ts` | Emission factor lookups, unit calculations, invalid subcategory error throwing |
| `lib/__tests__/sanitize.test.ts` | DOMPurify stripping of `<script>` tags, XSS vectors, HTML entities, empty strings |
| `lib/__tests__/rate-limit.test.ts` | Sliding window allows first 10 requests, blocks the 11th within the window |
| `lib/__tests__/activity-actions.test.ts` | Firestore server actions: log activity, fetch weekly summary, delete activity, auth guard |

> All **26 tests** pass via Vitest. The test environment uses `jsdom` with mocked Firebase Admin getters (`getAdminDb`, `getAdminAuth`) to prevent real SDK initialisation.

---

## 11. Code Quality Standards

| Standard | Implementation |
|---|---|
| **Zero `any` types** | All interfaces defined in `types/index.ts`; `unknown` + type guards used throughout |
| **Typed catch blocks** | `catch (error: unknown)` with `error instanceof Error` guard on every catch |
| **JSDoc on all exports** | Every function in `lib/` and all API route handlers documented |
| **Constants file** | No magic strings — emission factors, routes, events, API paths all in `lib/constants.ts` |
| **Custom hooks** | All stateful logic extracted: `useActivityLog`, `useCarbonBudget`, `useLeaderboard`, `useRealtimeScore`, `useUserStreak` |
| **Named exports only** | All components and lib functions use named exports (except Next.js `default` page exports) |
| **Return types** | All `async` functions have explicit `Promise<T>` return types |
| **No `console.log`** | Only `console.error` in catch blocks of API routes |
| **Error boundaries** | `ErrorBoundary` component wraps client pages |
| **Accessibility utils** | `SkipToContent` component present on all pages |

---

## 12. Security Implementation

| Measure | Implementation |
|---|---|
| **API key isolation** | `ANTHROPIC_API_KEY` and all Firebase Admin keys exist only in server-side routes — never bundled to the browser |
| **Input sanitisation** | `sanitize()` in `lib/sanitize.ts` runs `DOMPurify.sanitize()` on all user-supplied strings before Firestore writes |
| **Rate limiting** | Sliding window enforcer in `lib/rate-limit.ts` — 10 requests per IP per 60s window on all 5 POST endpoints |
| **429 with Retry-After** | Rate-limited responses return `{ "error": "Too many requests" }` with `Retry-After: 60` header |
| **Session cookies** | `httpOnly: true`, `secure: true` (production), `sameSite: 'strict'`, `maxAge: 12 days` |
| **Firestore security rules** | User profiles and activities are auth-scoped; leaderboard is read-only for authenticated users, write-blocked to all clients |
| **No hardcoded secrets** | Grep-verified: zero occurrences of `NEXT_PUBLIC_ANTHROPIC`, `NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT`, or raw API keys in source |
| **Token verification** | `next-firebase-auth-edge` middleware verifies the session token on every protected route |
| **XSS prevention** | HTML stripped by DOMPurify before any string reaches Firestore |
| **Type validation** | Runtime type checks (`typeof`, `instanceof`) on all API request bodies |

---

## 13. Accessibility

WCAG 2.1 AA targets implemented throughout:

| Feature | Implementation |
|---|---|
| **Skip to content** | `SkipToContent` component (`components/layout/SkipToContent.tsx`) is the first focusable element on every page |
| **Keyboard navigation** | Full tab order maintained; visible focus rings on all interactive elements |
| **Screen reader support** | ARIA labels and roles on charts, buttons, and form fields |
| **Semantic HTML** | Single `<h1>` per page, correct heading hierarchy, landmark elements (`<main>`, `<nav>`, `<header>`) |
| **Colour contrast** | All text/background combinations target ≥ 4.5:1 ratio |
| **Touch targets** | All interactive elements meet 44×44px minimum |
| **Mobile navigation** | `MobileNav` component provides a responsive bottom navigation bar for small screens |
| **iOS zoom prevention** | All `<input>` elements use `font-size: 16px` minimum to prevent auto-zoom on iOS Safari |

---

## 14. Performance

| Optimisation | Implementation |
|---|---|
| **Edge Runtime** | `/api/ai-insights` uses `export const runtime = 'edge'` for minimal cold-start latency |
| **Streaming AI responses** | Claude responses stream word-by-word via SSE — no blocking wait for the full response |
| **Dynamic imports** | `WeeklyBar`, `EmissionsRing`, `ImpactGlobe`, `CarbonPulse`, `CategoryPicker`, `PageTransition` all use `next/dynamic` with `ssr: false` |
| **SWC compiler** | Babel removed; SWC handles TypeScript and JSX natively at ~17× faster compile times |
| **Skeleton loaders** | Every async data fetch renders a skeleton state via Suspense boundaries |
| **Real-time listeners** | `onSnapshot` (Firestore) avoids polling — updates push to the client instantly |
| **Google Fonts via `next/font`** | Self-hosted at build time — zero CLS, no external font network request at runtime |
| **Bundle analysis** | `@next/bundle-analyzer` configured for on-demand inspection (`ANALYZE=true npm run build`) |

---

## 15. Project Structure

```
CarbonWise/
├── app/                                    # Next.js 14 App Router
│   ├── layout.tsx                          # Root layout — Inter + Fraunces fonts, metadata
│   ├── globals.css                         # Tailwind base + CSS custom properties
│   ├── (auth)/                             # Auth route group (no shell layout)
│   │   ├── layout.tsx                      # Minimal auth page wrapper
│   │   ├── login/page.tsx                  # Login page
│   │   └── register/page.tsx              # Register page
│   ├── (dashboard)/                        # Protected route group (shell + auth)
│   │   ├── layout.tsx                      # Dashboard layout — auth guard, Shell
│   │   ├── page.tsx                        # Home / Dashboard page
│   │   ├── log/page.tsx                    # Log Activity page
│   │   ├── insights/page.tsx               # AI Insights page
│   │   ├── leaderboard/page.tsx            # Leaderboard page
│   │   └── profile/page.tsx               # User Profile page
│   ├── actions/                            # Next.js Server Actions
│   │   ├── activity.ts                     # Log, fetch, delete activity (Firestore)
│   │   └── user.ts                         # Get/update user profile + badges
│   └── api/                               # Edge API routes
│       ├── ai-insights/route.ts            # POST — Claude 3 Haiku streaming insights
│       ├── carbon-score/route.ts           # POST — IPCC AR6 emission calculation
│       ├── analytics/route.ts              # POST — Firebase Analytics relay
│       ├── login/route.ts                  # POST — Create session cookie
│       └── logout/route.ts                # POST — Clear session cookie
│
├── components/                            # Reusable UI components
│   ├── activity/
│   │   ├── ActivityCard.tsx               # Single activity log item display
│   │   ├── ActivityForm.tsx               # Log activity form (dynamic CategoryPicker)
│   │   ├── CategoryPicker.tsx             # Visual category selector grid
│   │   └── LogActivityClient.tsx          # Client wrapper for activity logging page
│   ├── charts/
│   │   ├── WeeklyBar.tsx                  # Recharts bar chart (7-day emissions)
│   │   ├── EmissionsRing.tsx              # Recharts donut chart (category breakdown)
│   │   ├── ImpactGlobe.tsx                # 3D globe emission visualisation
│   │   └── CarbonPulse.tsx                # Animated pulse indicator (over/under budget)
│   ├── dashboard/
│   │   └── DashboardHomeClient.tsx        # Client dashboard with all dynamic chart imports
│   ├── insights/
│   │   └── InsightsClient.tsx             # Streams Claude response, renders Markdown
│   ├── leaderboard/
│   │   └── LeaderboardClient.tsx          # Real-time leaderboard with rank display
│   ├── profile/
│   │   └── ProfileClient.tsx             # Badge display, budget setting, profile edit
│   ├── layout/
│   │   ├── Shell.tsx                      # App shell — sidebar nav + AI Whisperer drawer
│   │   ├── MobileNav.tsx                  # Bottom navigation bar (mobile)
│   │   ├── PageTransition.tsx             # Framer Motion route transition wrapper
│   │   ├── ErrorBoundary.tsx              # React error boundary
│   │   └── SkipToContent.tsx             # WCAG skip-to-main-content link
│   └── ui/                               # Primitive UI components
│       ├── Button.tsx                     # Polymorphic button with variants
│       ├── Card.tsx                       # Glassmorphism card container
│       ├── Input.tsx                      # Accessible labelled input field
│       └── Badge.tsx                      # Achievement badge display
│
├── hooks/                                 # Custom React hooks
│   ├── useActivityLog.ts                  # Fetches and subscribes to activity feed
│   ├── useCarbonBudget.ts                 # Tracks weekly spend vs user budget + alerts
│   ├── useLeaderboard.ts                  # Real-time Firestore leaderboard listener
│   ├── useRealtimeScore.ts                # Live carbon score via onSnapshot
│   └── useUserStreak.ts                   # Computes consecutive tracking day streak
│
├── lib/                                   # Core business logic + utilities
│   ├── carbon-calculator.ts              # Pure emission calculation (IPCC AR6 factors)
│   ├── constants.ts                       # EMISSION_FACTORS, BADGE_DEFINITIONS, ROUTES, ANALYTICS_EVENTS
│   ├── sanitize.ts                        # DOMPurify wrapper for all string inputs
│   ├── rate-limit.ts                      # In-memory sliding window rate limiter
│   ├── analytics.ts                       # Type-safe Firebase Analytics event tracker
│   ├── auth-context.tsx                   # React context for Firebase Auth state
│   ├── firebase/
│   │   ├── client.ts                      # Firebase client SDK initialisation (singleton)
│   │   └── admin.ts                       # Firebase Admin lazy getters (getAdminDb, getAdminAuth)
│   └── __tests__/                        # Vitest test suites
│       ├── carbon-calculator.test.ts      # Emission calculation unit tests
│       ├── sanitize.test.ts               # XSS sanitisation tests
│       ├── rate-limit.test.ts             # Rate limiter blocking tests
│       └── activity-actions.test.ts       # Server action integration tests
│
├── types/
│   ├── index.ts                           # ActivityCategory, Activity, UserProfile, LeaderboardEntry
│   └── firebase.d.ts                      # Firebase SDK type augmentations
│
├── .github/
│   └── workflows/
│       ├── ci.yml                         # Run lint + type-check + tests on every PR
│       └── deploy.yml                     # Deploy to Firebase App Hosting on push to main
│
├── .env.example                           # Environment variable template (commit-safe)
├── .env.local.example                     # Detailed annotated template with instructions
├── .gitignore                             # Excludes .env.local, .next/, node_modules/, tsconfig.tsbuildinfo
├── Dockerfile                             # Multi-stage production Docker build
├── docker-compose.yml                     # Local container orchestration
├── firebase.json                          # Firebase project configuration
├── firestore.rules                        # Firestore security rules
├── middleware.ts                          # next-firebase-auth-edge session validation + route protection
├── next.config.mjs                        # SWC config, undici webpack alias, serverComponentsExternalPackages
├── tailwind.config.ts                     # Design system tokens (colours, fonts, spacing)
├── tsconfig.json                          # TypeScript strict mode configuration
├── vitest.config.ts                       # Vitest + jsdom test environment
└── README.md                              # This file
```

---

## 16. License

```
MIT License

Copyright (c) 2024 Poorvi Shetty

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

*Built with 💚 by **Poorvi Shetty***  
*Powered by Anthropic Claude 3 Haiku · Firebase · Next.js 14 · IPCC AR6 Emission Science*

**Start tracking your footprint. Every kg of CO₂e you save is a vote for the planet. 🌍**
