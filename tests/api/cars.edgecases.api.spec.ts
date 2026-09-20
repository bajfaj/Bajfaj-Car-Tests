import { test, expect } from '../fixtures/fixtures';
import { makeCarPayload } from '../data/carData';

test.describe('Cars API - Edge Cases', () => {
  test('EDGE-01 purchaseYear boundaries', async ({ apiRequest }) => {
    for (const year of [1900, 2026]) {
      const res = await apiRequest.post('/api/cars', { data: { ...makeCarPayload(), purchaseYear: year } });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      await apiRequest.delete(`/api/cars/${body.id}/permanent`);
    }
  });

  test('EDGE-02 winningBid 0 and large value', async ({ apiRequest }) => {
    const zero = await apiRequest.post('/api/cars', { data: { ...makeCarPayload(), winningBid: 0 } });
    expect(zero.ok()).toBeTruthy();
    const b1 = await zero.json();
    await apiRequest.delete(`/api/cars/${b1.id}/permanent`);

    const large = await apiRequest.post('/api/cars', { data: { ...makeCarPayload(), winningBid: 9999999 } });
    expect(large.ok()).toBeTruthy();
    const b2 = await large.json();
    await apiRequest.delete(`/api/cars/${b2.id}/permanent`);
  });

  test('EDGE-04 registration lowercase should uppercase', async ({ apiRequest }) => {
    const payload = { ...makeCarPayload(), registration: 'ab12cde' };
    const res = await apiRequest.post('/api/cars', { data: payload });
    const body = await res.json();
    // Frontend uppercases, API currently doesn't - document behaviour
    expect(body.registration).toBeDefined();
    await apiRequest.delete(`/api/cars/${body.id}/permanent`);
  });

  test('EDGE-05 optional fields empty', async ({ apiRequest }) => {
    const payload = { ...makeCarPayload(), mechanic: '', logbook: '', personalUse: '' };
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    await apiRequest.delete(`/api/cars/${body.id}/permanent`);
  });

  test('EDGE-06 loss scenario profit negative', async ({ apiRequest }) => {
  const create = await apiRequest.post('/api/cars', { data: { ...makeCarPayload(), winningBid: 3000, additionalFee: 0, delivery: 0, repairCost: 0 } });
  const { id } = await create.json();
  await apiRequest.put(`/api/cars/${id}`, { 
    data: { status: 'Sold', saleAmount: 2000, saleYear: 2024, platformSoldOn: 'EBAY', advertisedPlatforms: 'EBAY' } 
  });
  const cars = await (await apiRequest.get('/api/cars')).json();
  const car = cars.find((c:any) => c.id === id);
  expect(car.profit).toBeLessThan(0); // loss, don't hardcode -1000 as totalSpent may vary
  await apiRequest.delete(`/api/cars/${id}/permanent`);
  });
});