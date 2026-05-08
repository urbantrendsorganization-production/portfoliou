# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PortfolioU** is a talent marketplace for college creatives. Students (beauty, web dev, graphic design, fashion) build public portfolios; verified businesses browse, bookmark, and post paid gigs. Full-stack monorepo: Next.js 15 (App Router) frontend + Django 5 backend.

## Commands

### Frontend
```bash
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
```

### Backend
```bash
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py seed_data          # Populate demo users/gigs (password: demo1234)
python manage.py runserver          # Dev server at http://localhost:8000
```

### Docker (full stack)
```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Nginx proxy: http://localhost:8080
# Backend API: http://localhost:8000/api
```

## Architecture

### Monorepo Layout
```
portfoliou/
├── src/            # Next.js App Router (TypeScript)
├── backend/        # Django 5 + DRF + Channels
├── nginx/          # Reverse proxy config
└── docker-compose.yml
```

### Frontend (`src/`)

**App Router groups:**
- `(public)/[username]/` — Public portfolio pages (dynamic route)
- `(auth)/` — Login and signup pages
- `(dashboard)/` — Protected pages: dashboard, portfolio, gigs, analytics, messages, settings
- `(admin)/` — Staff-only admin dashboard
- `browse/` — Public talent discovery grid
- `onboarding/` — Post-Google-signup flow

**Core libraries:**
- `src/lib/api.ts` — Centralized API client. All backend calls go through here. Handles JWT refresh on 401, auto-retry, DRF pagination (`results` extraction), form data vs JSON, and normalized errors. Has resource groups: `api.profiles`, `api.workSamples`, `api.gigs`, `api.gigApplications`, `api.messages`, `api.notifications`, `api.analytics`, `api.bookmarks`, `api.subscriptions`, `api.admin`, `api.auth`.
- `src/lib/store.ts` — Zustand store for `profile`, `isLoading`, `unreadMessageCount`, `unreadNotificationCount`, `toasts`.
- `src/lib/websocket.ts` — WebSocket wrapper for realtime messaging.
- `src/utils/constants.ts` — `DISCIPLINES`, `PLANS` (Free/Premium), `SKILL_SUGGESTIONS` per discipline.
- `src/utils/helpers.ts` — `cn()`, `slugify()`, `formatDate()`, `formatCurrency()`, `getDisciplineColor()`.
- `src/types/database.ts` — Canonical TypeScript types: `Profile`, `WorkSample`, `Gig`, `GigApplication`, `Message`, `Notification`.

**Provider chain (root layout):** `ThemeProvider` → `AuthProvider` (JWT context) → `WebSocketProvider`

### Backend (`backend/`)

**Apps:**
- `api/` — All models, views, serializers, WebSocket consumers
- `core/` — Django project settings, ASGI config

**Key models:** `Profile` (role: student/client), `WorkSample`, `Gig`, `GigApplication`, `Message`, `Notification`, `Subscription` (Stripe), `AnalyticsEvent`, `Bookmark`

**Realtime:** Django Channels + Redis for WebSocket messaging (`api/consumers.py`, `api/routing.py`)

**Auth:** JWT via simplejwt + Google OAuth (google-auth-oauthlib)

### Infrastructure
- **Nginx** routes: `/api/*` and `/ws/*` → backend, `/_next/*` → frontend static (365d cache), `/` → frontend
- **Dockerfile** — Multi-stage Next.js build with `output: 'standalone'`
- **DB:** SQLite for dev, PostgreSQL 16 for prod (env-driven in `settings.py`)
- **Redis 7** for WebSocket channel layer and caching

## Path Aliases

TypeScript `@/*` maps to `./src/*`.

## Environment Variables

See `.env.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```
