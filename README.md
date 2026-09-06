# Bajfaj Car Management - API Test Automation

Playwright + TypeScript API test suite for [bajfaj-car-management](https://github.com/bajfaj/bajfaj-car-management).

Built to validate full lifecycle CRUD with real business-logic assertions.

### Tech Stack
- Playwright Test (APIRequestContext)
- TypeScript, dotenv
- Isolated fixtures + cleanup utils

### Coverage - 8 Tests (All Passing)
File: `tests/api/cars.api.spec.ts`

1. Health check `GET /api/cars`
2. Create car with profit calculation check
3. Get car by ID
4. Full update (PUT) with re-calculated profit
5. Partial update (PATCH) - Bug Found & Fixed - profit was NOT recalculating
6. Delete car
7. Validation - negative purchasePrice returns 400
8. Stats endpoint aggregates correctly

### Key Finding
During PATCH test, API returned stale `profit`. Fixed in main app repo. This suite now proves the fix.

### How to run
```bash
npm install
cp .env.example .env
# set API_URL=http://localhost:3002
npx playwright test --reporter=list
```

### Structure
```
config/env.ts - env loader
tests/api/cars.api.spec.ts - main suite
data/carData.ts - factories
fixtures/fixtures.ts - fixtures
utils/cleanup.ts - auto delete created cars
```

### Related Repo
App: https://github.com/bajfaj/bajfaj-car-management