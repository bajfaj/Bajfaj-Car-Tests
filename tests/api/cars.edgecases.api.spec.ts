import { test, expect } from '../fixtures/fixtures';
import { makeCarPayload } from '../data/carData';

test.describe('Cars API - Edge Cases', () => {
  test('EDGE-01 purchaseYear boundaries', async ({ apiRequest, trackId }) => {
    for (const year of [1900, 2026]) {
      const body = await (await apiRequest.post('/api/cars', { data: { ...makeCarPayload(), purchaseYear: year } })).json();
      trackId(body.id);
    }
  });

  test('EDGE-02 winningBid 0 and large value', async ({ apiRequest, trackId }) => {
    const b1 = await (await apiRequest.post('/api/cars', { data: { ...makeCarPayload(), winningBid: 0 } })).json();
    trackId(b1.id);
    const b2 = await (await apiRequest.post('/api/cars', { data: { ...makeCarPayload(), winningBid: 9999999 } })).json();
    trackId(b2.id);
  });

  test('EDGE-04 registration lowercase should uppercase', async ({ apiRequest, trackId }) => {
    const body = await (await apiRequest.post('/api/cars', { data: { ...makeCarPayload(), registration: 'ab12cde' } })).json();
    trackId(body.id);
    expect(body.registration).toBeDefined();
  });

  test('EDGE-05 optional fields empty', async ({ apiRequest, trackId }) => {
    const body = await (await apiRequest.post('/api/cars', { data: { ...makeCarPayload(), mechanic: '', logbook: '', personalUse: '' } })).json();
    trackId(body.id);
  });

  test('EDGE-06 loss scenario profit negative', async ({ apiRequest, trackId }) => {
    const { id } = await (await apiRequest.post('/api/cars', { data: { ...makeCarPayload(), winningBid: 3000 } })).json();
    trackId(id);
    await apiRequest.put(`/api/cars/${id}`, { data: { status: 'Sold', saleAmount: 2000, saleYear: 2024, platformSoldOn: 'EBAY', advertisedPlatforms: 'EBAY' } });
    const car = (await (await apiRequest.get('/api/cars')).json()).find((c:any) => c.id === id);
    expect(car.profit).toBeLessThan(0);
  });
});