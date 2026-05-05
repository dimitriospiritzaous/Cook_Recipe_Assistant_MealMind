/** Billing options wired to RevenueCat offering packages (see `lib/revenuecat.native.ts`). */
export type RevenueCatPlanId = 'monthly' | 'three_month' | 'six_month';

export type PurchaseResult =
  | { ok: true }
  | { ok: false; cancelled?: boolean; message: string };

export type RestoreResult = { ok: true } | { ok: false; message: string };

/** Shared surface for `revenuecat.native` / `revenuecat.web` (see `revenuecat.ts`). */
export interface RevenueCatApi {
  getRevenueCatStatusMessage(): string | null;
  initRevenueCat(): Promise<void>;
  syncRevenueCatUser(appUserId: string | null): Promise<void>;
  fetchRevenueCatStorePrices(): Promise<
    Partial<Record<RevenueCatPlanId, { price: string; period: string }>>
  >;
  purchaseRevenueCatPlan(planId: RevenueCatPlanId): Promise<PurchaseResult>;
  restoreRevenueCatPurchases(): Promise<RestoreResult>;
  refreshRevenueCatEntitlements(): Promise<boolean>;
}
