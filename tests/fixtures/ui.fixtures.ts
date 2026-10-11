import { test as base } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { CarsPage } from '../pages/cars.page';
import { ReportsPage } from '../pages/reports.page';
import { LoginPage } from '../pages/login.page';

type UiFixtures = {
  dashboardPage: DashboardPage;
  carsPage: CarsPage;
  reportsPage: ReportsPage;
  loginPage: LoginPage;
};

export const test = base.extend<UiFixtures>({
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  carsPage: async ({ page }, use) => {
    await use(new CarsPage(page));
  },
  reportsPage: async ({ page }, use) => {
    await use(new ReportsPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect } from '@playwright/test';