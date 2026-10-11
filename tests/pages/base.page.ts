import { Page, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  // Your Sidebar.jsx structure
  sidebar() {
    return this.page.locator('div.w-64.bg-gray-900').first();
  }

  // NavLinks from your Sidebar.jsx - exact match
  dashboardLink() { return this.page.getByRole('link', { name: 'Dashboard' }); }
  carsLink() { return this.page.getByRole('link', { name: 'Cars', exact: true }); }
  reportsLink() { return this.page.getByRole('link', { name: /Reports \/ Analytics/i }); }

  // This is used by your smoke tests - now 100% matches your Sidebar.jsx
  async navigateTo(destination: 'dashboard' | 'cars' | 'reports') {
    const map = {
      dashboard: this.dashboardLink(),
      cars: this.carsLink(),
      reports: this.reportsLink(),
    };
    const link = map[destination];
    await link.waitFor({ state: 'visible', timeout: 10000 });
    await link.click();
    await this.page.waitForURL(`**/${destination}`, { timeout: 10000 });

    // handle your onLinkClick that closes mobile menu
    await this.page.waitForTimeout(300);
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  envBanner() {
    return this.page.locator('[data-testid="env-banner"]');
  }

  // Useful: check active state from your linkClass
  async expectActive(link: 'dashboard' | 'cars' | 'reports') {
    const map = {
      dashboard: this.dashboardLink(),
      cars: this.carsLink(),
      reports: this.reportsLink(),
    };
    await expect(map[link]).toHaveClass(/bg-blue-600/);
  }
}