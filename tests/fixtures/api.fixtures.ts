import { test as base, APIRequestContext } from '@playwright/test';
import { env } from '../../config/env';
import { cleanupCarsByIds } from '../utils/cleanup';

type Fixtures = {
  apiRequest: APIRequestContext;
  api: APIRequestContext;
  createdCarIds: string[];
  trackId: (id: string) => void;
  authToken: string;
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

  // --- NOW REAL LOGIN ---
  authToken: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: env.apiURL,
    });

    const res = await request.post('/api/auth/login', {
      data: {
        email: 'admin@bajfaj.com',
        password: 'Admin123!',
      },
    });

    if (!res.ok()) {
      throw new Error(`Login failed ${res.status()}: ${await res.text()}`);
    }

    const { token } = await res.json();
    console.log(`[authToken] real JWT ${token.slice(0,20)}...`);
    
    await use(token);
    await request.dispose();
  },

  // --- AUTHENTICATED REQUEST WITH TOKEN ---
  apiRequest: async ({ playwright, createdCarIds, authToken }, use) => {
    const request = await playwright.request.newContext({
      baseURL: env.apiURL,
      extraHTTPHeaders: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`, // <-- now real token
      },
    });
    await use(request);
    
    if (createdCarIds.length > 0) {
      await cleanupCarsByIds(request, createdCarIds);
    }
    await request.dispose();
  },

  api: async ({ apiRequest }, use) => {
    await use(apiRequest);
  },
});

export { expect } from '@playwright/test';