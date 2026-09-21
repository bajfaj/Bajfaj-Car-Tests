import { APIRequestContext } from '@playwright/test';

export async function cleanupCarsByIds(api: APIRequestContext, ids: string[]) {
  if (!ids.length) return;
  for (const id of ids) {
    // Try permanent first, then soft + permanent as fallback
    const perm = await api.delete(`/api/cars/${id}/permanent`).catch(()=> null);
    if (!perm || perm.status() === 404) {
      await api.delete(`/api/cars/${id}`).catch(()=>{});
      await api.delete(`/api/cars/${id}/permanent`).catch(()=>{});
    }
  }
}