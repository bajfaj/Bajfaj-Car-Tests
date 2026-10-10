import { test, expect } from '../fixtures';

test.describe('UI - Dashboard', () => {
  test('DASH-01 dashboard loads with cards and env banner', async ({ dashboardPage, page }) => {
    await dashboardPage.goto('/dashboard');
    await dashboardPage.expectLoaded();
    await expect(dashboardPage.envBanner()).toBeVisible();
  });
});