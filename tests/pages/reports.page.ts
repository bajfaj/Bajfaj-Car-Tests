import { BasePage } from './base.page';
import { expect } from '@playwright/test';

export class ReportsPage extends BasePage {
  async expectLoaded() {
    await expect(this.reportsLink()).toHaveClass(/bg-blue-600/);
    await expect(this.page.getByRole('heading', { name: /reports/i }).first()).toBeVisible({ timeout: 10000 });
  }
}