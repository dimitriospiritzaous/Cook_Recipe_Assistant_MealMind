import { Platform } from 'react-native';

import type { RevenueCatApi } from '@/lib/revenuecat-types';

export type { PurchaseResult, RestoreResult, RevenueCatApi, RevenueCatPlanId } from '@/lib/revenuecat-types';

const impl: RevenueCatApi =
  Platform.OS === 'web'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./revenuecat.web')
    : // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./revenuecat.native');

export const getRevenueCatStatusMessage = impl.getRevenueCatStatusMessage;
export const initRevenueCat = impl.initRevenueCat;
export const syncRevenueCatUser = impl.syncRevenueCatUser;
export const fetchRevenueCatStorePrices = impl.fetchRevenueCatStorePrices;
export const purchaseRevenueCatPlan = impl.purchaseRevenueCatPlan;
export const restoreRevenueCatPurchases = impl.restoreRevenueCatPurchases;
export const refreshRevenueCatEntitlements = impl.refreshRevenueCatEntitlements;
