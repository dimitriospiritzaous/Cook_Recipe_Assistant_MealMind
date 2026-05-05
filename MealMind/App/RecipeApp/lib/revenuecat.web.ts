import type { PurchaseResult, RestoreResult, RevenueCatPlanId } from '@/lib/revenuecat-types';

export function getRevenueCatStatusMessage(): string | null {
  return null;
}

export async function initRevenueCat(): Promise<void> {
  /* no-op on web */
}

export async function syncRevenueCatUser(_appUserId: string | null): Promise<void> {
  /* no-op */
}

export async function fetchRevenueCatStorePrices(): Promise<
  Partial<Record<RevenueCatPlanId, { price: string; period: string }>>
> {
  return {};
}

export async function purchaseRevenueCatPlan(_planId: RevenueCatPlanId): Promise<PurchaseResult> {
  return { ok: false, message: 'Purchases are not available on web.' };
}

export async function restoreRevenueCatPurchases(): Promise<RestoreResult> {
  return { ok: false, message: 'Purchases are not available on web.' };
}

export async function refreshRevenueCatEntitlements(): Promise<boolean> {
  return false;
}
