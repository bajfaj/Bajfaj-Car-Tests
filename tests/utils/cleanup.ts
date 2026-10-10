import { APIRequestContext } from '@playwright/test';

export async function cleanupCarsByIds(api: APIRequestContext, ids: string[]) {
  if (!ids?.length) return;

  console.log(`[cleanup] cleaning ${ids.length} cars: ${ids.join(', ')}`);

  for (const id of ids) {
    if (!id) continue;
    try {
      // 1. Try permanent delete directly (if API allows)
      const perm = await api.delete(`/api/cars/${id}/permanent`).catch(() => null);

      if (perm && perm.ok()) {
        console.log(`[cleanup] ✓ permanent deleted ${id}`);
        continue;
      }

      // 2. Fallback: soft delete then permanent (your current logic, good)
      if (!perm || perm.status() === 404) {
        const soft = await api.delete(`/api/cars/${id}`).catch(() => null);
        if (soft) {
          console.log(`[cleanup] soft delete ${id} -> ${soft.status()}`);
        }
        const perm2 = await api.delete(`/api/cars/${id}/permanent`).catch(() => null);
        if (perm2?.ok()) {
          console.log(`[cleanup] ✓ permanent deleted after soft ${id}`);
        }
      }
    } catch (e) {
      console.warn(`[cleanup] failed to delete ${id}:`, e);
      // don't throw - we don't want cleanup to fail the test
    }
  }

  // Clear the array so your fixture knows it's done
  ids.length = 0;
}

// Optional: helper for single cleanup if you need it later
export async function cleanupCarById(api: APIRequestContext, id: string) {
  return cleanupCarsByIds(api, [id]);
}