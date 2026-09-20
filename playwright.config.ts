import { defineConfig, devices } from '@playwright/test';
import { env, ENV } from './config/env'; 

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: ENV === 'prod' ? 2 : 1, // more retries in prod
  reporter: [['html'], ['list']],
  projects: [
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: { baseURL: env.apiURL }, // uses env file
    },
    {
      name: 'chromium',
      testMatch: /.*\.ui\.spec\.ts/,
      use: { 
        baseURL: env.uiURL,
        ...devices['Desktop Chrome'] 
      },
    },
  ],
});