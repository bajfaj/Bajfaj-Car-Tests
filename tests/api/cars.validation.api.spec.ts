import { test, expect } from '../fixtures/fixtures';
import { makeCarPayload } from '../data/carData';

test.describe('Cars API - Validation', () => {

  test('VAL-01 registration format TOOLONG123 -> 400', async ({ apiRequest }) => {
    const payload = { ...makeCarPayload(), registration: 'TOOLONG123' };
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect([400,422]).toContain(res.status());
  });

  test('VAL-02 registration empty -> 400', async ({ apiRequest }) => {
    const payload = { ...makeCarPayload(), registration: '' };
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect([400,422]).toContain(res.status());
  });

  test('VAL-03 make missing -> 400', async ({ apiRequest }) => {
    const payload: any = makeCarPayload();
    delete payload.make;
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect([400,422]).toContain(res.status());
  });

  test('VAL-04 purchaseYear future 2030 -> 400', async ({ apiRequest }) => {
    const payload = { ...makeCarPayload(), purchaseYear: 2030 };
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect([400,422]).toContain(res.status());
  });

  test('VAL-05 winningBid negative -> 400', async ({ apiRequest }) => {
    const payload = { ...makeCarPayload(), winningBid: -500 };
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect([400,422]).toContain(res.status());
  });

  test('VAL-06 transmission invalid -> 400', async ({ apiRequest }) => {
    const payload = { ...makeCarPayload(), transmission: 'InvalidTrans' };
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect([400,422]).toContain(res.status());
  });

  test('VAL-07 fuel invalid -> 400', async ({ apiRequest }) => {
    const payload = { ...makeCarPayload(), fuel: 'WATER' };
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect([400,422]).toContain(res.status());
  });

  test('VAL-08 delivery negative -> 400', async ({ apiRequest }) => {
    const payload = { ...makeCarPayload(), delivery: -50 };
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect([400,422]).toContain(res.status());
  });

  test('VAL-09 sell without saleAmount -> 400', async ({ apiRequest, trackId }) => {
    const create = await apiRequest.post('/api/cars', { data: makeCarPayload() });
    const { id } = await create.json();
    trackId(id);
    const res = await apiRequest.put(`/api/cars/${id}`, { data: { status: 'Sold' } });
    expect([400,422]).toContain(res.status());
  });

  test('VAL-10 saleYear < purchaseYear -> 400', async ({ apiRequest, trackId }) => {
    const create = await apiRequest.post('/api/cars', { data: { ...makeCarPayload(), purchaseYear: 2023 } });
    const { id } = await create.json();
    trackId(id);
    const res = await apiRequest.put(`/api/cars/${id}`, { 
      data: { status: 'Sold', saleAmount: 2000, saleYear: 2020, platformSoldOn: 'EBAY', advertisedPlatforms: 'EBAY' } 
    });
    expect([400,422]).toContain(res.status());
  });

  test('VAL-11 sell without platformSoldOn -> 400', async ({ apiRequest, trackId }) => {
    const create = await apiRequest.post('/api/cars', { data: makeCarPayload() });
    const { id } = await create.json();
    trackId(id);
    const res = await apiRequest.put(`/api/cars/${id}`, { 
      data: { status: 'Sold', saleAmount: 2000, saleYear: 2024, advertisedPlatforms: 'EBAY' } 
    });
    expect([400,422]).toContain(res.status());
  });

  test('VAL-12 sell without advertisedPlatforms -> 400', async ({ apiRequest, trackId }) => {
    const create = await apiRequest.post('/api/cars', { data: makeCarPayload() });
    const { id } = await create.json();
    trackId(id);
    const res = await apiRequest.put(`/api/cars/${id}`, { 
      data: { status: 'Sold', saleAmount: 2000, saleYear: 2024, platformSoldOn: 'EBAY' } 
    });
    expect([400,422]).toContain(res.status());
  });

  test('VAL-13 model missing -> 400', async ({ apiRequest }) => {
    const payload: any = makeCarPayload();
    delete payload.model;
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect([400,422]).toContain(res.status());
  });

  test('VAL-14 additionalFee negative -> 400', async ({ apiRequest }) => {
    const payload = { ...makeCarPayload(), additionalFee: -10 };
    const res = await apiRequest.post('/api/cars', { data: payload });
    expect([400,422]).toContain(res.status());
  });
});