import { APIRequestContext } from '@playwright/test';

export async function cleanupTestCars(api: APIRequestContext) {
  // clean active
  const active = await api.get('/api/cars');
  if (active.ok()) {
    const list = await active.json();
    for (const c of list.filter((x: any) => x.registration?.startsWith('TEST'))) {
      await api.delete(`/api/cars/${c.id}/permanent`).catch(() => {});
    }
  }
  // clean deleted bin too
  const deleted = await api.get('/api/cars/deleted');
  if (deleted.ok()) {
    const list = await deleted.json();
    for (const c of list.filter((x: any) => x.registration?.startsWith('TEST'))) {
      await api.delete(`/api/cars/${c.id}/permanent`).catch(() => {});
    }
  }
}