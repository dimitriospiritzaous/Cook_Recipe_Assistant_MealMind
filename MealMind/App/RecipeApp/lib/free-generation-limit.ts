import AsyncStorage from '@react-native-async-storage/async-storage';

import { initRevenueCat, refreshRevenueCatEntitlements } from '@/lib/revenuecat';

const USED_KEY = 'mealmind.freeAiRecipeGenerationUsed';

export async function hasUsedFreeAiRecipeGeneration(): Promise<boolean> {
  return (await AsyncStorage.getItem(USED_KEY)) === '1';
}

async function markFreeAiRecipeGenerationUsed(): Promise<void> {
  await AsyncStorage.setItem(USED_KEY, '1');
}

/** Pro (RevenueCat entitlement) bypasses the one-time free limit. */
export async function canGenerateAiRecipes(): Promise<boolean> {
  await initRevenueCat();
  if (await refreshRevenueCatEntitlements()) {
    return true;
  }
  return !(await hasUsedFreeAiRecipeGeneration());
}

/** Call after a successful AI batch so free users cannot run again. */
export async function recordAiGenerationCompletedIfFreeTier(): Promise<void> {
  await initRevenueCat();
  if (await refreshRevenueCatEntitlements()) {
    return;
  }
  await markFreeAiRecipeGenerationUsed();
}
