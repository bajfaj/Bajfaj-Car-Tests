import { test, expect } from '../fixtures';

test('CARS-01 inventory page loads with filters', async ({ carsPage }) => {
  await carsPage.goto('/dashboard');
  await carsPage.navigateTo('cars');
  await carsPage.expectLoaded();
});