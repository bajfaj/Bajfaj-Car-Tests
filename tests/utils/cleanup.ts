import { APIRequestContext } from '@playwright/test';

export async function cleanupTestCars(api: APIRequestContext) {
  // clean active
  const active = await api.get('/api/cars');
  if (active.ok()) {
    const list = await active.json();
    const toDelete = list.filter((x: any) => x.registration?.startsWith('TEST'));
    console.log(`[CLEANUP] Found ${toDelete.length} TEST cars in active`);
    for (const c of toDelete) {
      await api.delete(`/api/cars/${c.id}/permanent`).catch(() => {});
    }
  }
  // clean deleted bin too
  const deleted = await api.get('/api/cars/deleted');
  if (deleted.ok()) {
    const list = await deleted.json();
    const toDelete = list.filter((x: any) => x.registration?.startsWith('TEST'));
    console.log(`[CLEANUP] Found ${toDelete.length} TEST cars in deleted bin`);
    for (const c of toDelete) {
      await api.delete(`/api/cars/${c.id}/permanent`).catch(() => {});
    }
  }
}