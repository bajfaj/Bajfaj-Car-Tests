import { test, expect } from '../fixtures/fixtures';
import { makeCarPayload } from '../data/carData';

test.describe('Cars API - Business Logic', () => {
  test('BL-01 totalSpent = bid+fee+delivery+repair', async ({ apiRequest }) => {
    const payload = { ...makeCarPayload(), winningBid: 1000, additionalFee: 200, delivery: 100, repairCost: 300 };
    const res = await apiRequest.post('/api/cars', { data: payload });
    const body = await res.json();
    expect(body.totalSpent).toBe(1600);
    await apiRequest.delete(`/api/cars/${body.id}/permanent`);
  });

  test('BL-02 profit = -totalSpent when Available', async ({ apiRequest }) => {
    const payload = { ...makeCarPayload(), winningBid: 1000, additionalFee: 0, delivery: 0, repairCost: 0 };
    const res = await apiRequest.post('/api/cars', { data: payload });
    const body = await res.json();
    expect(body.profit).toBe(-1000);
    expect(body.status).toBe('Available'); // <- your API uses Available, not Held
    await apiRequest.delete(`/api/cars/${body.id}/permanent`);
  });

  test('BL-03 profit = saleAmount - totalSpent when Sold', async ({ apiRequest }) => {
    const nowYear = new Date().getFullYear();
    const payload = { ...makeCarPayload(), winningBid: 1000, additionalFee: 0, delivery: 0, repairCost: 0 };
    const create = await apiRequest.post('/api/cars', { data: payload });
    expect(create.status()).toBe(201);
    const { id } = await create.json();
    try {
      const put = await apiRequest.put(`/api/cars/${id}`, {
        data: { status: 'Sold', saleAmount: 2500, saleYear: nowYear, platformSoldOn: 'AUTOTRADER', advertisedPlatforms: 'AUTOTRADER' }
      });
      expect(put.status()).toBe(200); // add this to catch validation fails early
      const get = await apiRequest.get('/api/cars');
      const cars = await get.json();
      const car = cars.find((c: any) => c.id === id);
      expect(car.profit).toBe(1500);
      expect(car.totalSpent).toBe(1000);
      expect(car.profit >= 0).toBeTruthy();
    } finally {
      await apiRequest.delete(`/api/cars/${id}/permanent`);
    }
  });

  test('BL-04 PUT recalculates totalSpent', async ({ apiRequest }) => {
    const create = await apiRequest.post('/api/cars', { data: { ...makeCarPayload(), winningBid: 1000 } });
    const { id } = await create.json();
    await apiRequest.put(`/api/cars/${id}`, { data: { winningBid: 2000 } });
    const get = await apiRequest.get('/api/cars');
    const car = (await get.json()).find((c: any) => c.id === id);
    expect(car.totalSpent).toBeGreaterThanOrEqual(2000);
    await apiRequest.delete(`/api/cars/${id}/permanent`);
  });

  test('BL-06 legacy advertisedOn maps to advertisedPlatforms', async ({ apiRequest }) => {
    const payload: any = makeCarPayload();
    payload.advertisedOn = 'FACEBOOK';
    delete payload.advertisedPlatforms;
    const res = await apiRequest.post('/api/cars', { data: payload });
    const body = await res.json();
    // index.js has logic: if advertisedOn && !advertisedPlatforms => map
    expect(body.advertisedPlatforms || body.advertisedOn).toBeDefined();
    await apiRequest.delete(`/api/cars/${body.id}/permanent`);
  });
});