import { test } from '../fixtures';

test('REP-01 reports page loads', async ({ reportsPage }) => {
  await reportsPage.goto('/dashboard');
  await reportsPage.navigateTo('reports');
  await reportsPage.expectLoaded();
});