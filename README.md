# Bajfaj Car Management - API Test Automation

Playwright + TypeScript API test suite for bajfaj-car-management.

Built to validate full lifecycle CRUD with real business-logic, edge-case, validation & security assertions. All tests are isolated with auto-cleanup fixtures.

## Tech Stack
- Playwright Test (APIRequestContext)
- TypeScript, dotenv
- Isolated fixtures (`apiRequest` + `trackId`) + cleanup utils (`cleanupCarsByIds`)
- Auto-cleanup: `fixtures.ts` tracks all created car IDs and deletes them in `afterEach`, so no test data leaks to dev DB

## Coverage - 35 Tests (All Passing)
5 spec files under `tests/api/`:

| File | What it covers | Count |
| :--- | :--- | :--- |
| **cars.api.spec.ts** | Health check, CRUD lifecycle, profit calc, stats endpoint | 8 |
| **cars.businesslogic.api.spec.ts** | BL-01 to BL-06: profit = sale - totalSpent, totalSpent = winningBid+fees+delivery+repair, PUT/PATCH recalculation, legacy advertisedOn mapping | 5 |
| **cars.edgecases.api.spec.ts** | Empty payloads, invalid IDs, duplicate plates, boundary values | 5 |
| **cars.validation.api.spec.ts** | Negative winningBid, missing required fields, invalid status enum, 400 assertions | 14 |
| **cars.security.api.spec.ts** | SQLi / XSS payloads, unauthorized access checks, permanent delete guard | 3 |

## Key Findings & Fixes
- During PATCH test, API returned stale `profit`. Fixed in main app repo - profit now recalculates on every update. This suite proves the fix.
- BL-03 failure fixed: `makeCarPayload()` includes default fees. Tests now explicitly zero `additionalFee`, `delivery`, `repairCost` for deterministic profit assertions.
- Leak fixed: Previously cars leaked as `AB12...` test data. Now `trackId(id)` ensures 100% cleanup.

## How to run
```bash
npm install
cp .env.example .env
# set API_URL=http://localhost:3002 in .env

# run all 35 API tests
npm run test:api:dev -- api
# or
npx playwright test tests/api

# view report
npx playwright show-report