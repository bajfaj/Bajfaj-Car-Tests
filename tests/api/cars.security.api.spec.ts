import { test, expect } from '../fixtures/fixtures';
import { makeCarPayload } from '../data/carData';

test.describe('Cars API - Security / Negative', () => {
  test('SEC-01 PUT invalid id 999999', async ({ apiRequest }) => {
    const put = await apiRequest.put('/api/cars/999999', { data: { make: 'Test' } });
    expect(put.status()).toBe(404);
  });

  test('SEC-04 SQL injection attempt', async ({ apiRequest, trackId }) => {
    const payload = { ...makeCarPayload(), registration: "'; DROP TABLE cars; --" };
    const res = await apiRequest.post('/api/cars', { data: payload });
    const check = await apiRequest.get('/api/cars');
    expect(check.ok()).toBeTruthy();
    if (res.ok()) trackId((await res.json()).id);
  });

  test('SEC-05 duplicate registration currently allowed [BUG]', async ({ apiRequest, trackId }) => {
    const payload = makeCarPayload();
    const b1 = await (await apiRequest.post('/api/cars', { data: payload })).json();
    trackId(b1.id);
    const second = await apiRequest.post('/api/cars', { data: payload });
    expect([200, 201, 400, 409].includes(second.status())).toBeTruthy();
    if (second.ok()) trackId((await second.json()).id);
  });
});