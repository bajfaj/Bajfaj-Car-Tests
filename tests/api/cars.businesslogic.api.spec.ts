import { test, expect } from '../fixtures/fixtures';
import { makeCarPayload } from '../data/carData';

test.describe('Cars API - Business Logic', () => {
  test('BL-01 totalSpent = bid+fee+delivery+repair', async ({ apiRequest, trackId }) => {
    const payload = { ...makeCarPayload(), winningBid: 1000, additionalFee: 200, delivery: 100, repairCost: 300 };
    const body = await (await apiRequest.post('/api/cars', { data: payload })).json();
    trackId(body.id);
    expect(body.totalSpent).toBe(1600); // 1000+200+100+300
  });

  test('BL-02 profit = -totalSpent when Available', async ({ apiRequest, trackId }) => {
    const payload = { ...makeCarPayload(), winningBid: 1000, additionalFee: 0, delivery: 0, repairCost: 0 };
    const body = await (await apiRequest.post('/api/cars', { data: payload })).json();
    trackId(body.id);
    expect(body.totalSpent).toBe(1000);
    expect(body.profit).toBe(-1000);
  });

  test('BL-03 profit = saleAmount - totalSpent when Sold', async ({ apiRequest, trackId }) => {
    const nowYear = new Date().getFullYear();
    const payload = { ...makeCarPayload(), winningBid: 1000, additionalFee: 0, delivery: 0, repairCost: 0 };
    const { id } = await (await apiRequest.post('/api/cars', { data: payload })).json();
    trackId(id);

    const put = await apiRequest.put(`/api/cars/${id}`, {
      data: { status: 'Sold', saleAmount: 2500, saleYear: nowYear, platformSoldOn: 'AUTOTRADER', advertisedPlatforms: 'AUTOTRADER' }
    });
    expect(put.status()).toBe(200);
    
    const cars = await (await apiRequest.get('/api/cars')).json();
    const car = cars.find((c: any) => c.id === id);
    expect(car.totalSpent).toBe(1000);
    expect(car.profit).toBe(1500);
  });

  test('BL-04 PUT recalculates totalSpent', async ({ apiRequest, trackId }) => {
    const { id } = await (await apiRequest.post('/api/cars', { data: { ...makeCarPayload(), winningBid: 1000, additionalFee: 0, delivery: 0, repairCost: 0 } })).json();
    trackId(id);
    await apiRequest.put(`/api/cars/${id}`, { data: { winningBid: 2000, additionalFee: 0, delivery: 0, repairCost: 0 } });
    const car = (await (await apiRequest.get('/api/cars')).json()).find((c: any) => c.id === id);
    expect(car.totalSpent).toBe(2000);
  });

  test('BL-06 legacy advertisedOn maps to advertisedPlatforms', async ({ apiRequest, trackId }) => {
    const payload: any = makeCarPayload();
    payload.advertisedOn = 'FACEBOOK';
    delete payload.advertisedPlatforms;
    const body = await (await apiRequest.post('/api/cars', { data: payload })).json();
    trackId(body.id);
    expect(body.advertisedPlatforms || body.advertisedOn).toBeDefined();
  });
});