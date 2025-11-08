# Next Week Engineering Focus (4 Projects)

> Snapshot of high-impact initiatives the team can realistically complete in one week.

## Project 1 – Shop & Inventory Reliability
- [ ] Add integration tests for `POST /shop/purchase` and `/shop/use` covering success, insufficient coins, and double-use attempts.
- [ ] Update `Inventory.jsx` to show activation history + remaining duration pulled from API, and ensure buttons reflect true state.
- [ ] Ship a data reset script (Node CLI) that restores `auth-backend/data/*.json` to pristine seeds for QA.
- [ ] Document the “restart server after editing data files” requirement in README + tooling notes.

## Project 2 – AICoach Page Decomposition (Phase 1)
- [ ] Extract the chat transcript UI into its own component + hook (`useCoachChat`), wiring it to existing data sources.
- [ ] Carve out the decision sidebar (orders, stats) into `DecisionSidebar` with clearly typed props.
- [ ] Add Storybook (or Vite preview stories) for the new components to allow visual regression checks.

## Project 3 – Testing & CI Baseline
- [ ] Configure Jest (or Vitest) for `auth-backend/` and add smoke tests for auth + trading routes.
- [ ] Enable Vitest + React Testing Library for `stockbuddy/`; add smoke tests for `Inventory` and `Shop` screens.
- [ ] Add `npm run lint` & `npm run test` scripts in root `package.json`, wire to GitHub Actions (or chosen CI) for PR gating.

## Project 4 – Auth & Config Hardening (Quick Wins)
- [ ] Move JWT secret, email credentials, and third-party API keys into `.env` with startup validation.
- [ ] Introduce rate limiting (e.g., express-rate-limit) on `/auth/login` and `/auth/google`.
- [ ] Log auth attempts (success + failure) to a rotating log file for basic auditability.
- [ ] Draft a migration note outlining options to move user storage off plaintext JSON (SQLite/Prisma proposal).
