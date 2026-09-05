import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

const ENV = (process.env.ENV || 'dev') as 'dev' | 'test' | 'prod';

const config = {
  dev: {
    apiURL: 'http://localhost:3001',
    uiURL: 'http://localhost:5173',
    db: 'bajfaj_dev.db'
  },
  test: {
    apiURL: 'http://localhost:3002',
    uiURL: 'http://localhost:5173', // same port! vite always 5173
    db: 'bajfaj_test.db'
  },
  prod: {
    apiURL: 'http://localhost:3000',
    uiURL: 'http://localhost:5173', // same port!
    db: 'bajfaj_prod.db'
  }
};

if (!config[ENV]) throw new Error(`Invalid ENV=${ENV}. Use dev/test/prod`);

console.log(`>>> ENV=${ENV} | API=${config[ENV].apiURL} | UI=${config[ENV].uiURL} | DB=${config[ENV].db}`);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,
  reporter: [['html'], ['list']],
  projects: [
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: { baseURL: config[ENV].apiURL },
    },
    {
      name: 'chromium',
      testMatch: /.*\.ui\.spec\.ts/,
      use: { 
        baseURL: config[ENV].uiURL,
        ...devices['Desktop Chrome'] 
      },
    },
  ],
});