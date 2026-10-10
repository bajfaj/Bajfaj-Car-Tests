import { BasePage } from './base.page';
import { expect } from '@playwright/test';

export class CarsPage extends BasePage {
  async expectLoaded() {
    await expect(this.carsLink()).toHaveClass(/bg-blue-600/);
    await expect(this.page.getByRole('heading', { name: /cars/i }).first()).toBeVisible({ timeout: 10000 });
  }
}