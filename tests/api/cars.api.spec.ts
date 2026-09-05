import { test, expect } from '../fixtures/fixtures';
import { makeCarPayload, makeSoldUpdatePayload } from '../data/carData';
import { cleanupTestCars } from '../utils/cleanup';

test.describe('Cars API - Full Lifecycle (7 endpoints)', () => {
  test.describe.configure({ mode: 'serial' });

  let carId: number;
  const payload = makeCarPayload();
  const soldPayload = makeSoldUpdatePayload();

  test.beforeAll(async ({ apiRequest }) => {
    await cleanupTestCars(apiRequest);
  });

  test.afterAll(async ({ apiRequest }) => {
    // final hard cleanup for anything left
    if (carId) {
      await apiRequest.delete(`/api/cars/${carId}/permanent`).catch(() => {});
    }
    await cleanupTestCars(apiRequest);
  });

  test('1. POST /api/cars - creates car + calculates totalSpent & profit', async ({ apiRequest }) => {
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect(res.ok()).toBeTruthy();
    expect([200, 201]).toContain(res.status());

    const body = await res.json();
    carId = body.id;
    expect(carId).toBeDefined();

    // Server calculates these - validate logic
    const expectedTotal = payload.winningBid + payload.additionalFee + payload.delivery + payload.repairCost;
    expect(body.totalSpent).toBe(expectedTotal);
    expect(body.profit).toBe(-expectedTotal); // Not sold yet, so profit = -totalSpent
    expect(body.registration).toBe(payload.registration);
  });

  test('2. GET /api/cars - should contain created car', async ({ apiRequest }) => {
    const res = await apiRequest.get('/api/cars');
    expect(res.ok()).toBeTruthy();
    const cars = await res.json(); // returns array directly
    expect(Array.isArray(cars)).toBeTruthy();

    const found = cars.find((c: any) => c.id === carId);
    expect(found).toBeDefined();
    expect(found.registration).toBe(payload.registration);
    expect(found.deleted).toBe(0);
  });

  test('3. PUT /api/cars/:id - update to Sold + profit calc', async ({ apiRequest }) => {
   
const updatePayload = soldPayload; // just { status:'Sold', saleAmount:13150, ... }

    const res = await apiRequest.put(`/api/cars/${carId}`, {
      data: updatePayload
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.success).toBe(true);

    // Verify via GET all (you have no GET by id)
    const listRes = await apiRequest.get('/api/cars');
    const cars = await listRes.json();
    const updated = cars.find((c: any) => c.id === carId);

    expect(updated.status).toBe('Sold');
    expect(updated.saleAmount).toBe(soldPayload.saleAmount);
    expect(updated.platformSoldOn).toBe('AutoTrader');

    const expectedTotal = payload.winningBid + payload.additionalFee + payload.delivery + payload.repairCost;
    const expectedProfit = soldPayload.saleAmount - expectedTotal;
    expect(updated.totalSpent).toBe(expectedTotal);
    expect(updated.profit).toBe(expectedProfit);
  });

  test('4. DELETE /api/cars/:id - soft delete with reason', async ({ apiRequest }) => {
    const res = await apiRequest.delete(`/api/cars/${carId}`, {
      data: { reason: 'E2E test cleanup' }
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('5. GET /api/cars - soft deleted should NOT appear', async ({ apiRequest }) => {
    const res = await apiRequest.get('/api/cars');
    const cars = await res.json();
    const found = cars.find((c: any) => c.id === carId);
    expect(found).toBeUndefined();
  });

  test('6. GET /api/cars/deleted - soft deleted SHOULD appear', async ({ apiRequest }) => {
    const res = await apiRequest.get('/api/cars/deleted');
    expect(res.ok()).toBeTruthy();
    const deletedCars = await res.json();
    const found = deletedCars.find((c: any) => c.id === carId);
    expect(found).toBeDefined();
    expect(found.deleted).toBe(1);
    expect(found.deleted_reason).toBe('E2E test cleanup');
    expect(found.deleted_at).toBeDefined();
  });

  test('7. PUT /api/cars/:id/restore - restore car', async ({ apiRequest }) => {
    const res = await apiRequest.put(`/api/cars/${carId}/restore`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);

    // Should be back in active list
    const activeRes = await apiRequest.get('/api/cars');
    const activeCars = await activeRes.json();
    expect(activeCars.find((c: any) => c.id === carId)).toBeDefined();

    // Should NOT be in deleted list anymore
    const deletedRes = await apiRequest.get('/api/cars/deleted');
    const deletedCars = await deletedRes.json();
    expect(deletedCars.find((c: any) => c.id === carId)).toBeUndefined();
  });

  test('8. DELETE /api/cars/:id/permanent - hard delete forever', async ({ apiRequest }) => {
    // soft delete first to mimic real flow
    await apiRequest.delete(`/api/cars/${carId}`, { data: { reason: 'final delete' } });

    const res = await apiRequest.delete(`/api/cars/${carId}/permanent`);
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).success).toBe(true);

    // Gone from BOTH lists
    const activeCars = await (await apiRequest.get('/api/cars')).json();
    const deletedCars = await (await apiRequest.get('/api/cars/deleted')).json();

    expect(activeCars.find((c: any) => c.id === carId)).toBeUndefined();
    expect(deletedCars.find((c: any) => c.id === carId)).toBeUndefined();

    // prevent afterAll trying to delete again
    carId = 0 as any;
  });
});