import { test as base, expect, APIRequestContext } from '@playwright/test';
import { env } from '../../config/env';

type Fixtures = {
  apiRequest: APIRequestContext;
};

export const test = base.extend<Fixtures>({
  apiRequest: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: env.apiURL, // industry: baseURL defined ONCE here
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
    await use(request);
    await request.dispose();
  },
});

export { expect };