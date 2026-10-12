import { BasePage } from './base.page';
import { expect, Locator } from '@playwright/test';

export class LoginPage extends BasePage {
  email(): Locator {
    return this.page.getByTestId('login-email');
  }

  password(): Locator {
    return this.page.getByTestId('login-password');
  }

  loginBtn(): Locator {
    return this.page.getByTestId('login-button');
  }

  error(): Locator {
    // login error - check common patterns
    return this.page.locator('[data-testid="login-error"], [data-testid="error"], [role="alert"], .text-red-500, .text-red-600, p.text-sm').first();
  }

  logoutBtn(): Locator {
    return this.page.getByRole('button', { name: /logout/i });
  }

  async expectLoaded() {
    await expect(this.email()).toBeVisible({ timeout: 15000 });
    await expect(this.password()).toBeVisible();
    await expect(this.loginBtn()).toBeVisible();
  }

  async fillLoginForm(email: string, password: string) {
    await this.email().click();
    await this.page.keyboard.press('ControlOrMeta+A');
    await this.page.keyboard.press('Backspace');
    await this.email().fill(email);

    await this.password().click();
    await this.page.keyboard.press('ControlOrMeta+A');
    await this.page.keyboard.press('Backspace');
    await this.password().fill(password);
  }

  async getToken() {
    try {
      return await this.page.evaluate(() => 
        localStorage.getItem('token') || localStorage.getItem('access_token') || sessionStorage.getItem('token')
      );
    } catch { return null; }
  }

  async logout() {
    await this.logoutBtn().click();
    await this.page.waitForURL(/.*login/, { timeout: 10000 });
  }

  async login(email = 'admin@bajfaj.com', password = 'Admin123!') {
    await this.fillLoginForm(email, password);
    await this.loginBtn().click();
    await this.page.waitForURL(/.*dashboard/, { timeout: 15000 });
  }
  async mockLogin(e = 'admin@bajfaj.com', p = 'Admin123!') { return this.login(e,p); }
}