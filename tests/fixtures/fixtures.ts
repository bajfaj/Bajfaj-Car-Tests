import { test as base, expect, APIRequestContext } from '@playwright/test';
import { env } from '../../config/env';
import { cleanupCarsByIds } from '../utils/cleanup';

type Fixtures = {
  apiRequest: APIRequestContext;
  createdCarIds: string[];
  trackId: (id: string) => void;
};

export const test = base.extend<Fixtures>({
  createdCarIds: async ({}, use) => {
    const ids: string[] = [];
    await use(ids);
  },

  trackId: async ({ createdCarIds }, use) => {
    await use((id: string) => {
      if (id && !createdCarIds.includes(id)) {
        createdCarIds.push(id);
      }
    });
  },

  apiRequest: async ({ playwright, createdCarIds }, use) => {
    const request = await playwright.request.newContext({
      baseURL: env.apiURL,
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
    await use(request);
    
    // auto-cleanup after each test
    if (createdCarIds.length > 0) {
      await cleanupCarsByIds(request, createdCarIds);
    }
    await request.dispose();
  },
});

export { expect };