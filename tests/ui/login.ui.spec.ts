import { test, expect } from '../fixtures';

test.describe('UI - Login Mock', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto('/login');
  });

  test('LOGIN-02 empty email', async ({ loginPage }) => {
    await loginPage.password().fill('password123');
    await loginPage.loginBtn().click();
    await expect(loginPage.error()).toContainText(/Email is required/i);
  });

  test('LOGIN-03 short password', async ({ loginPage }) => {
    await loginPage.email().fill('test@test.com');
    await loginPage.password().fill('123');
    await loginPage.loginBtn().click();
    await expect(loginPage.error()).toContainText(/minimum 6/i);
  });

  test('LOGIN-04 real success', async ({ loginPage, page }) => {
    await loginPage.fillLoginForm('admin@bajfaj.com', 'Admin123!');
    await loginPage.loginBtn().click();
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*dashboard/);
    const token = await loginPage.getToken();
    expect(token).toBeTruthy();
  });
});