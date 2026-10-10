import { BasePage } from './base.page';
import { expect } from '@playwright/test';

export class DashboardPage extends BasePage {
  async expectLoaded() {
    await expect(this.dashboardLink()).toHaveClass(/bg-blue-600/);
    await expect(this.page.getByRole('heading', { name: /dashboard/i }).first()).toBeVisible({ timeout: 10000 });
  }
}