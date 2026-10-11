import { defineConfig, devices } from '@playwright/test';
import { env, ENV } from './config/env';

console.log(`\n>>> ENV: ${ENV} | API: ${env.apiURL} | UI: ${env.uiURL} <<<\n`);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  retries: ENV === 'prod' ? 2 : 1,
  reporter: [['html'], ['list']],
  workers: ENV === 'prod' ? 1 : undefined,

  projects: [
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      workers: 1,
      use: { 
        baseURL: env.apiURL,
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },
    {
      name: 'ui',
      testMatch: /.*\.ui\.spec\.ts/,
      testDir: './tests/ui',
      use: { 
        baseURL: env.uiURL,
        ...devices['Desktop Chrome'],
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
      },
    },
  ],
});