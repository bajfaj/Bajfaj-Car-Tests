import { test, expect } from '../fixtures';
import { makeCarPayload, makeSoldUpdatePayload } from '../data/carData';
import { cleanupCarsByIds } from '../utils/cleanup';
import { env } from '../../config/env';

test.describe('Cars API - Full Lifecycle (10 endpoints inc Auth)', () => {
  test.describe.configure({ mode: 'serial' });

  let carId: string;
  const payload = makeCarPayload();
  const soldPayload = makeSoldUpdatePayload();

  test.afterAll(async ({ apiRequest }) => {
    if (carId) {
      await cleanupCarsByIds(apiRequest, [carId]);
    }
  });

  // 1 & 2 - NEW AUTH TESTS
  test('1. POST /api/auth/login - success returns token', async ({ playwright }) => {
    const req = await playwright.request.newContext({ baseURL: env.apiURL });
    const res = await req.post('/api/auth/login', {
      data: { email: 'admin@bajfaj.com', password: 'Admin123!' }
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.token).toBeDefined();
    await req.dispose();
  });

  test('2. POST /api/auth/login - fail with wrong password', async ({ playwright }) => {
    const req = await playwright.request.newContext({ baseURL: env.apiURL });
    const res = await req.post('/api/auth/login', {
      data: { email: 'admin@bajfaj.com', password: 'Wrong!' }
    });
    expect(res.status()).toBe(401);
    await req.dispose();
  });

  // 3 - was your 1
  test('3. POST /api/cars - creates car + calculates totalSpent & profit', async ({ apiRequest, trackId }) => {
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    carId = body.id;
   // trackId(carId);
    expect(carId).toBeDefined();

    const expectedTotal = payload.winningBid + payload.additionalFee + payload.delivery + payload.repairCost;
    expect(body.totalSpent).toBe(expectedTotal);
    expect(body.profit).toBe(-expectedTotal);
  });

  test('4. GET /api/cars - should contain created car', async ({ apiRequest }) => {
    const cars = await (await apiRequest.get('/api/cars')).json();
    const found = cars.find((c: any) => c.id === carId);
    expect(found).toBeDefined();
    expect(found.deleted).toBe(0);
  });

  test('5. PUT /api/cars/:id - update to Sold + profit calc', async ({ apiRequest }) => {
    const res = await apiRequest.put(`/api/cars/${carId}`, { data: soldPayload });
    expect(res.ok()).toBeTruthy();

    const cars = await (await apiRequest.get('/api/cars')).json();
    const updated = cars.find((c: any) => c.id === carId);

    const expectedTotal = payload.winningBid + payload.additionalFee + payload.delivery + payload.repairCost;
    expect(updated.status).toBe('Sold');
    expect(updated.profit).toBe(soldPayload.saleAmount - expectedTotal);
  });

  test('6. DELETE /api/cars/:id - soft delete', async ({ apiRequest }) => {
    const res = await apiRequest.delete(`/api/cars/${carId}`, { data: { reason: 'E2E test cleanup' } });
    expect(res.ok()).toBeTruthy();
  });

  test('7. GET /api/cars - soft deleted should NOT appear', async ({ apiRequest }) => {
    const cars = await (await apiRequest.get('/api/cars')).json();
    expect(cars.find((c: any) => c.id === carId)).toBeUndefined();
  });

  test('8. GET /api/cars/deleted - SHOULD appear', async ({ apiRequest }) => {
    const deletedCars = await (await apiRequest.get('/api/cars/deleted')).json();
    const found = deletedCars.find((c: any) => c.id === carId);
    expect(found).toBeDefined();
    expect(found.deleted).toBe(1);
  });

  test('9. PUT /api/cars/:id/restore - restore', async ({ apiRequest }) => {
    const res = await apiRequest.put(`/api/cars/${carId}/restore`);
    expect(res.ok()).toBeTruthy();

    const active = await (await apiRequest.get('/api/cars')).json();
    expect(active.find((c: any) => c.id === carId)).toBeDefined();
  });

  test('10. DELETE /api/cars/:id/permanent - hard delete forever', async ({ apiRequest }) => {
    await apiRequest.delete(`/api/cars/${carId}`, { data: { reason: 'final delete' } });
    const res = await apiRequest.delete(`/api/cars/${carId}/permanent`);
    expect(res.ok()).toBeTruthy();

    const active = await (await apiRequest.get('/api/cars')).json();
    const deleted = await (await apiRequest.get('/api/cars/deleted')).json();
    expect(active.find((c: any) => c.id === carId)).toBeUndefined();
    expect(deleted.find((c: any) => c.id === carId)).toBeUndefined();

    carId = '' as any; // prevent afterAll double delete
  });
});