import { Platform } from 'react-native';
import Purchases, { PACKAGE_TYPE, type PurchasesPackage } from 'react-native-purchases';

import type { PurchaseResult, RestoreResult, RevenueCatPlanId } from '@/lib/revenuecat-types';

const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim() || 'pro';

/** Fallback identifiers if your offering uses custom package IDs instead of standard types. */
const PACKAGE_ID_OVERRIDE: Record<RevenueCatPlanId, string | undefined> = {
  monthly: process.env.EXPO_PUBLIC_RC_PACKAGE_MONTHLY?.trim() || undefined,
  three_month: process.env.EXPO_PUBLIC_RC_PACKAGE_THREE_MONTH?.trim() || undefined,
  six_month: process.env.EXPO_PUBLIC_RC_PACKAGE_SIX_MONTH?.trim() || undefined,
};

const PLAN_TO_TYPE: Record<RevenueCatPlanId, PACKAGE_TYPE> = {
  monthly: PACKAGE_TYPE.MONTHLY,
  three_month: PACKAGE_TYPE.THREE_MONTH,
  six_month: PACKAGE_TYPE.SIX_MONTH,
};

let configured = false;
let lastInitWarning: string | null = null;

function getApiKey(): string | undefined {
  const key =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY
      : Platform.OS === 'android'
        ? process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY
        : undefined;
  return key?.trim() || undefined;
}

export function getRevenueCatStatusMessage(): string | null {
  return lastInitWarning;
}

export async function initRevenueCat(): Promise<void> {
  if (configured) return;
  const apiKey = getApiKey();
  if (!apiKey) {
    lastInitWarning =
      'Add EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY (iOS) and EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY (Android) to .env, then rebuild a dev client.';
    if (__DEV__) {
      console.warn('[RevenueCat]', lastInitWarning);
    }
    return;
  }
  try {
    Purchases.configure({ apiKey });
    if (__DEV__) {
      await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    }
    configured = true;
    lastInitWarning = null;
  } catch (e) {
    lastInitWarning = e instanceof Error ? e.message : 'RevenueCat failed to configure.';
    if (__DEV__) {
      console.warn('[RevenueCat] configure error', e);
    }
  }
}

export async function syncRevenueCatUser(appUserId: string | null): Promise<void> {
  if (!configured) return;
  try {
    if (appUserId) {
      await Purchases.logIn(appUserId);
    } else {
      await Purchases.logOut();
    }
  } catch (e) {
    if (__DEV__) {
      console.warn('[RevenueCat] sync user failed', e);
    }
  }
}

function pickPackage(packages: PurchasesPackage[], planId: RevenueCatPlanId): PurchasesPackage | null {
  const byType = packages.find((p) => p.packageType === PLAN_TO_TYPE[planId]);
  if (byType) return byType;
  const override = PACKAGE_ID_OVERRIDE[planId];
  if (override) {
    const byId = packages.find((p) => p.identifier === override);
    if (byId) return byId;
  }
  return null;
}

export async function fetchRevenueCatStorePrices(): Promise<
  Partial<Record<RevenueCatPlanId, { price: string; period: string }>>
> {
  if (!configured) return {};
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return {};

    const out: Partial<Record<RevenueCatPlanId, { price: string; period: string }>> = {};
    const packs = current.availablePackages;
    (['monthly', 'three_month', 'six_month'] as const).forEach((planId) => {
      const pkg = pickPackage(packs, planId);
      if (pkg != null) {
        out[planId] = {
          price: pkg.product.priceString,
          period: planId === 'monthly' ? '/month' : planId === 'three_month' ? '/3 mo' : '/6 mo',
        };
      }
    });
    return out;
  } catch (e) {
    if (__DEV__) {
      console.warn('[RevenueCat] getOfferings failed', e);
    }
    return {};
  }
}

function isUserCancelled(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'userCancelled' in e &&
    (e as { userCancelled?: boolean }).userCancelled === true
  );
}

export async function purchaseRevenueCatPlan(planId: RevenueCatPlanId): Promise<PurchaseResult> {
  if (!configured) {
    return {
      ok: false,
      message:
        lastInitWarning ??
        'Subscriptions are not configured. Add RevenueCat API keys and use a development build (not Expo Go).',
    };
  }
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) {
      return {
        ok: false,
        message:
          'No subscription offering found. In RevenueCat, set a current offering with Monthly, Three month, and Six month packages.',
      };
    }
    const pkg = pickPackage(current.availablePackages, planId);
    if (!pkg) {
      return {
        ok: false,
        message: `No package for “${planId}”. In RevenueCat, add a package with type ${PLAN_TO_TYPE[planId]} or set EXPO_PUBLIC_RC_PACKAGE_* to match your package identifier.`,
      };
    }
    await Purchases.purchasePackage(pkg);
    return { ok: true };
  } catch (e) {
    if (isUserCancelled(e)) {
      return { ok: false, cancelled: true, message: 'Purchase cancelled.' };
    }
    const msg =
      e instanceof Error
        ? e.message
        : typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message: unknown }).message)
          : 'Purchase failed.';
    return { ok: false, message: msg };
  }
}

export async function restoreRevenueCatPurchases(): Promise<RestoreResult> {
  if (!configured) {
    return {
      ok: false,
      message:
        lastInitWarning ??
        'Restore is not available. Add RevenueCat API keys and use a development build (not Expo Go).',
    };
  }
  try {
    await Purchases.restorePurchases();
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Restore failed.';
    return { ok: false, message: msg };
  }
}

export async function refreshRevenueCatEntitlements(): Promise<boolean> {
  if (!configured) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] != null;
  } catch {
    return false;
  }
}
