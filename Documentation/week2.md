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
- [ ] **FIX AI Analysis:** Debug and fix the "blank response" issue in AI Coach decision analysis (timeout/error handling).
- [ ] **Rate Limiting:** Implement strict rate limits on Auth and AI endpoints (Redis-backed).
- [ ] **Input Validation:** Add `zod` or `joi` validation middleware for all API routes.
- [ ] **CI/CD Repair:** Fix the broken `jest` dependency tree and ensure CI passes on every commit.

**Success Criteria:** AI analysis works reliably every time; automated tests pass; rate limiter blocks abuse scripts.
**Effort:** 3 Days

## Project 4: Gamification Expansion
**Scope:** Deepen the "Learn to Earn" loop with new assets and features.
- [ ] **Crypto & Options:** Implement the placeholder logic in `Profile.jsx` and `trading.js`.
- [ ] **Achievements System:** Add backend logic to award badges/XP for milestones (e.g., "First Trade", "Profitable Week").
- [ ] **Shop Expansion:** Add dynamic inventory items that affect trading (e.g., "Commission Discount" - simulated).

**Success Criteria:** Users can trade (mock) crypto; achievements trigger correctly; shop items have tangible effects.
**Effort:** 4 Days
