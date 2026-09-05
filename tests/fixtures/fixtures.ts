import { test as base, expect, APIRequestContext } from '@playwright/test';
import { API_URL } from '../../config/env';

type Fixtures = {
  apiRequest: APIRequestContext;
};

export const test = base.extend<Fixtures>({
  apiRequest: async ({ playwright }: { playwright: any }, use: (r: APIRequestContext) => Promise<void>) => {
    const request = await playwright.request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });
    await use(request);
    await request.dispose();
  },
});

export { expect };