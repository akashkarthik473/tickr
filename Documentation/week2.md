# Week 2 Development Plan

**Goal:** Escalate from "Waitlist MVP" to "Scalable Beta".

## Project 1: Real-Time Market Data Engine
**Scope:** Re-introduce WebSocket support for live stock pricing, replacing the current REST polling/stub implementation.
- [ ] Fix `websocket-client` dependency issues in `auth-backend`.
- [ ] Implement a robust WebSocket server (e.g., using `ws` or `socket.io`) to broadcast price updates.
- [ ] Update `LiveChart.jsx` to consume the socket stream.

**Success Criteria:** Chart updates every second without page refresh; backend handles disconnects gracefully.
**Effort:** 3 Days

## Project 2: Database Migration (JSON → SQLite/Postgres)
**Scope:** Move user and portfolio data from fragile JSON files to a proper relational database.
- [ ] Select ORM (Prisma or Sequelize).
- [ ] Create schema migrations for Users, Portfolios, Transactions.
- [ ] Write a migration script to import existing JSON data.
- [ ] Update `storageService.js` to use the DB adapter.

**Success Criteria:** No data loss during migration; concurrent writes do not corrupt data; improved query performance.
**Effort:** 4 Days

## Project 3: Security & Reliability Suite (includes AI Fixes)
**Scope:** Harden the application against abuse/failures and fix critical AI analysis bugs.
- [x] **FIX AI Analysis:** Debug and fix the "blank response" issue in AI Coach decision analysis (timeout/error handling). (LWK TOP PRIORITY)
- [x] **Rate Limiting:** Implement rate limits on Auth endpoints (express-rate-limit).
- [x] **Input Validation:** Add `zod` validation middleware for all API routes.
- [x] **CI/CD Repair:** Fix CI workflows and ensure they run on every commit.
- [x] **Helmet Security:** Added helmet middleware for HTTP security headers.
- [x] **Error Handler:** Added shared error handler with consistent JSON shape.

**Success Criteria:** AI analysis works reliably every time; automated tests pass; rate limiter blocks abuse scripts.
**Effort:** 3 Days
**Status:** ✅ Complete

## Project 4: Gamification Expansion
**Scope:** Deepen the "Learn to Earn" loop with new assets and features.
- [ ] **Crypto & Options:** Implement the placeholder logic in `Profile.jsx` and `trading.js`.
- [ ] **Achievements System:** Add backend logic to award badges/XP for milestones (e.g., "First Trade", "Profitable Week").
- [ ] **Shop Expansion:** Add dynamic inventory items that affect trading (e.g., "Commission Discount" - simulated).

**Success Criteria:** Users can trade (mock) crypto; achievements trigger correctly; shop items have tangible effects.
**Effort:** 4 Days

---

## MVP Blocklist (Post-MVP Items)

The following items are **out of scope** for MVP and should be tackled after launch:

### Database Migration
- [ ] Migrate from JSON files to SQLite/PostgreSQL
- [ ] Add Prisma ORM for type-safe queries
- [ ] Implement proper transaction handling

### Advanced Trading
- [ ] Real WebSocket streaming for live prices
- [ ] Options and crypto trading (mock)
- [ ] Advanced order types (stop-loss, trailing stop)

### Gamification V2
- [ ] Achievement badges system
- [ ] Leaderboards with ranking tiers
- [ ] Daily/weekly challenges

### Infrastructure
- [ ] Redis-backed rate limiting
- [ ] Proper logging service (Datadog, Logtail)
- [ ] APM and error tracking (Sentry)

### Content
- [ ] More lesson content
- [ ] Video tutorials
- [ ] Community features

---

## Completed MVP Tasks

### Lockdown & Waitlist (Week 2.5)
- [x] Add `LOCKDOWN` env flag (backend + frontend)
- [x] Create `/waitlist` page with email signup
- [x] Create `POST /api/waitlist` route (JSON storage)
- [x] Create invite system (`POST /api/invites`, `POST /api/invites/redeem`)
- [x] Add route guard (`Protected.jsx`) for lockdown mode
- [x] Add waitlist/invite email templates

### Backend Hardening
- [x] Add `helmet` middleware
- [x] Restrict CORS to `FRONTEND_URL`
- [x] Add Zod validation for API routes
- [x] Create shared error handler
- [x] Validate env at boot with Zod

### Trading Safety
- [x] Enforce `ALPACA_ENV=paper` by default
- [x] Add client+server validation for orders
- [x] Implement buy/sell endpoints with proper validation

### UX Polish
- [x] Add `ErrorBoundary` component
- [x] Add `NotFound.jsx` (404 page)
- [x] Add skeleton loading states
- [x] Create SEO helper (`useSEO` hook)

### CI/CD
- [x] Move workflows to `.github/workflows/`
- [x] Add `dependabot.yml`
- [x] Add `codeql.yml` for security scanning
- [x] Update `frontend-ci.yml` and `backend-ci.yml`

### Docs
- [x] Update README with lockdown docs
- [x] Add `robots.txt` (disallow while locked)
- [x] Update this file with completed tasks
