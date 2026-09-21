import { test, expect } from '../fixtures/fixtures';
import { makeCarPayload, makeSoldUpdatePayload } from '../data/carData';
import { cleanupCarsByIds } from '../utils/cleanup';

test.describe('Cars API - Full Lifecycle (7 endpoints)', () => {
  test.describe.configure({ mode: 'serial' });

  let carId: string;
  const payload = makeCarPayload();
  const soldPayload = makeSoldUpdatePayload();

  test.afterAll(async ({ apiRequest }) => {
    if (carId) {
      await cleanupCarsByIds(apiRequest, [carId]);
    }
  });

  test('1. POST /api/cars - creates car + calculates totalSpent & profit', async ({ apiRequest }) => {
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    carId = body.id;
    expect(carId).toBeDefined();

    const expectedTotal = payload.winningBid + payload.additionalFee + payload.delivery + payload.repairCost;
    expect(body.totalSpent).toBe(expectedTotal);
    expect(body.profit).toBe(-expectedTotal);
  });

  test('2. GET /api/cars - should contain created car', async ({ apiRequest }) => {
    const cars = await (await apiRequest.get('/api/cars')).json();
    const found = cars.find((c: any) => c.id === carId);
    expect(found).toBeDefined();
    expect(found.deleted).toBe(0);
  });

  test('3. PUT /api/cars/:id - update to Sold + profit calc', async ({ apiRequest }) => {
    const res = await apiRequest.put(`/api/cars/${carId}`, { data: soldPayload });
    expect(res.ok()).toBeTruthy();

    const cars = await (await apiRequest.get('/api/cars')).json();
    const updated = cars.find((c: any) => c.id === carId);

    const expectedTotal = payload.winningBid + payload.additionalFee + payload.delivery + payload.repairCost;
    expect(updated.status).toBe('Sold');
    expect(updated.profit).toBe(soldPayload.saleAmount - expectedTotal);
  });

  test('4. DELETE /api/cars/:id - soft delete', async ({ apiRequest }) => {
    const res = await apiRequest.delete(`/api/cars/${carId}`, { data: { reason: 'E2E test cleanup' } });
    expect(res.ok()).toBeTruthy();
  });

  test('5. GET /api/cars - soft deleted should NOT appear', async ({ apiRequest }) => {
    const cars = await (await apiRequest.get('/api/cars')).json();
    expect(cars.find((c: any) => c.id === carId)).toBeUndefined();
  });

  test('6. GET /api/cars/deleted - SHOULD appear', async ({ apiRequest }) => {
    const deletedCars = await (await apiRequest.get('/api/cars/deleted')).json();
    const found = deletedCars.find((c: any) => c.id === carId);
    expect(found).toBeDefined();
    expect(found.deleted).toBe(1);
  });

  test('7. PUT /api/cars/:id/restore - restore', async ({ apiRequest }) => {
    const res = await apiRequest.put(`/api/cars/${carId}/restore`);
    expect(res.ok()).toBeTruthy();

    const active = await (await apiRequest.get('/api/cars')).json();
    expect(active.find((c: any) => c.id === carId)).toBeDefined();
  });

  test('8. DELETE /api/cars/:id/permanent - hard delete forever', async ({ apiRequest }) => {
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