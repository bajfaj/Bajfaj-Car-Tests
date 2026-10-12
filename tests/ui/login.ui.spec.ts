import { test, expect } from '../fixtures';
import { env, ENV } from '../../config/env';

test.describe('UI - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(env.uiURL);
    await expect(page.getByTestId('login-email')).toBeVisible();
  });

  test('LOGIN-01 valid login redirects to dashboard', async ({ loginPage, page }) => {
    await loginPage.fillLoginForm('admin@bajfaj.com', 'Admin123!');
    await loginPage.loginBtn().click();
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });

    // Exact banner check per your screenshot
    if (ENV === 'dev') {
      await expect(page.getByText(/ENVIRONMENT:\s*DEV/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/localhost:3001/i)).toBeVisible({ timeout: 10000 });
    }
    if (ENV === 'test') {
      await expect(page.getByText(/ENVIRONMENT:\s*TEST/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/localhost:3002/i)).toBeVisible({ timeout: 10000 });
    }
    if (ENV === 'prod') {
      await expect(page.getByText(/ENVIRONMENT:\s*PROD/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/localhost:3000/i)).toBeVisible({ timeout: 10000 });
    }

    await expect(page).toHaveURL(/.*dashboard/);
    expect(await loginPage.getToken()).toBeTruthy();
  });

  test('LOGIN-02 empty email shows browser required validation', async ({ loginPage, page }) => {
    // clear the pre-filled value
    await loginPage.email().click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await loginPage.email().fill('');

    await loginPage.password().fill('password123');
    await loginPage.loginBtn().click();

    const email = loginPage.email();
    await expect(email).toHaveJSProperty('validity.valid', false);
    const msg = await email.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(msg).toMatch(/fill out|required/i);
    await expect(page).toHaveURL(/.*login/);
  });

  test('LOGIN-03 empty password shows browser required validation', async ({ loginPage, page }) => {
    await loginPage.email().fill('test@test.com');

    // clear password
    await loginPage.password().click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await loginPage.password().fill('');

    await loginPage.loginBtn().click();
    const pwd = loginPage.password();
    await expect(pwd).toHaveJSProperty('validity.valid', false);
    const msg = await pwd.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(msg).toMatch(/fill out|required/i);
    await expect(page).toHaveURL(/.*login/);
  });

  test('LOGIN-04 invalid email format shows browser validation', async ({ loginPage, page }) => {
    await loginPage.email().fill('not-an-email');
    await loginPage.password().fill('password123');
    await loginPage.loginBtn().click();
    const email = loginPage.email();
    await expect(email).toHaveJSProperty('validity.valid', false);
    const msg = await email.evaluate((el: HTMLInputElement) => el.validationMessage);
    // Chrome: "Please include an '@'..." or "Please enter an email"
    expect(msg).toMatch(/@|email/i);
    await expect(page).toHaveURL(/.*login/);
  });

  test('LOGIN-05 short password returns Invalid credentials', async ({ loginPage }) => {
    // app does NOT do client min-length check on login, backend returns Invalid credentials
    await loginPage.fillLoginForm('test@test.com', '123');
    await loginPage.loginBtn().click();
    await expect(loginPage.error()).toContainText(/Invalid credentials/i, { timeout: 10000 });
  });

  test('LOGIN-06 wrong credentials shows auth error', async ({ loginPage }) => {
    await loginPage.fillLoginForm('wrong@bajfaj.com', 'WrongPass123!');
    await loginPage.loginBtn().click();
    await expect(loginPage.error()).toContainText(/Invalid credentials/i, { timeout: 10000 });
    await expect(loginPage.loginBtn()).toBeVisible();
  });

  test('LOGIN-07 logout clears session', async ({ loginPage, page }) => {
    await loginPage.fillLoginForm('admin@bajfaj.com', 'Admin123!');
    await loginPage.loginBtn().click();
    await page.waitForURL(/.*dashboard/);
    await loginPage.logout();
    await expect(page).toHaveURL(/.*login/);
    const token = await loginPage.getToken();
    expect(token).toBeFalsy();
  });

  test('LOGIN-08 login with Enter key', async ({ loginPage, page }) => {
    await loginPage.fillLoginForm('admin@bajfaj.com', 'Admin123!');
    await page.keyboard.press('Enter');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*dashboard/);
  });
});