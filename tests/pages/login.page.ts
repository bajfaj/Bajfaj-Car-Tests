import { BasePage } from './base.page';
import { expect } from '@playwright/test';

export class LoginPage extends BasePage {
  email() {
    return this.page.getByTestId('email');
  }

  password() {
    return this.page.getByTestId('password');
  }

  loginBtn() {
    return this.page.getByTestId('login-btn');
  }

  error() {
    return this.page.getByTestId('error');
  }

  async expectLoaded() {
    await expect(this.email()).toBeVisible({ timeout: 10000 });
    await expect(this.password()).toBeVisible();
    await expect(this.loginBtn()).toBeVisible();
  }

  async fillLoginForm(email: string, password: string) {
    const e = this.email();
    const p = this.password();

    await e.click();
    await this.page.keyboard.press('ControlOrMeta+A');
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.type(email); // type('') after select-all+backspace = state becomes ''

    await p.click();
    await this.page.keyboard.press('ControlOrMeta+A');
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.type(password);
  }

  async mockLogin(email = 'test@test.com', password = 'password123') {
    await this.fillLoginForm(email, password);
    await this.loginBtn().click();
    await this.page.waitForURL(/.*dashboard/, { timeout: 10000 });
  }

  async getToken() {
    try {
      return await this.page.evaluate(() => localStorage.getItem('token'));
    } catch {
      // prevents "Execution context was destroyed" when page navigates
      return null;
    }
  }
}