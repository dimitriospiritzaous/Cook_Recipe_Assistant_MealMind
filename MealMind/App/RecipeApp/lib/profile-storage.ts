import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@supabase/supabase-js';

export const ONBOARDING_COMPLETE_KEY = 'mealmind.onboardingComplete';
export const GET_STARTED_SEEN_KEY = 'mealmind.getStartedSeen';
export const INTRO_SEEN_KEY = 'mealmind.introSeen';
export const PROFILE_DRAFT_KEY = 'mealmind.profileDraft';
/** Last signed-in Supabase user id (for clearing local profile when the account changes). */
export const LAST_AUTH_USER_ID_KEY = 'mealmind.lastAuthUserId';

export type KitchenComfort = 'quick_simple' | 'balanced' | 'ambitious';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type WellnessGoal =
  | 'eat_healthier'
  | 'save_time'
  | 'lose_weight'
  | 'gain_muscle'
  | 'maintain_weight'
  | 'reduce_waste'
  | 'budget'
  | 'unsure';

export type DietaryPreference =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'keto'
  | 'low_carb'
  | 'high_protein'
  | 'gluten_free'
  | 'dairy_free'
  | 'other';

export type CookingExperience = 'new' | 'home_cook' | 'confident' | 'pro';

export type StoredProfile = {
  countryCode: string;
  skillLevel: SkillLevel;
  /** Default when not collected in onboarding (balanced). */
  kitchenComfort: KitchenComfort;
  preferences: string[];
  dislikes: string[];
  /** Edited on Profile only; default false (non-vegetarian). */
  vegetarianFocus: boolean;
  pescetarianFriendly: boolean;
  /** Intro wizard fields (Design/onboarding). */
  wellnessGoal: WellnessGoal;
  dietaryPreference: DietaryPreference;
  cuisines: string[];
  allergies: string[];
  avoidFoods: string[];
  cookingExperience: CookingExperience;
  kitchenEquipment: string[];
  cookingSchedule: string;
  flavorProfile: string[];
  spicyLevel: 'mild' | 'medium' | 'hot';
  calorieFocus: 'no_preference' | 'lower' | 'balanced' | 'higher';
  /** User finished the 12-step intro; stored in profile JSON for sync across devices. */
  introWizardComplete?: boolean;
  /** User finished get-started / full gate; returning sign-ins skip onboarding. */
  flowOnboardingDone?: boolean;
};

function isSkillLevel(x: unknown): x is SkillLevel {
  return x === 'beginner' || x === 'intermediate' || x === 'advanced';
}

function isKitchenComfort(x: unknown): x is KitchenComfort {
  return x === 'quick_simple' || x === 'balanced' || x === 'ambitious';
}

function isWellnessGoal(x: unknown): x is WellnessGoal {
  return (
    x === 'eat_healthier' ||
    x === 'save_time' ||
    x === 'lose_weight' ||
    x === 'gain_muscle' ||
    x === 'maintain_weight' ||
    x === 'reduce_waste' ||
    x === 'budget' ||
    x === 'unsure'
  );
}

function isDietaryPreference(x: unknown): x is DietaryPreference {
  return (
    x === 'none' ||
    x === 'vegetarian' ||
    x === 'vegan' ||
    x === 'keto' ||
    x === 'low_carb' ||
    x === 'high_protein' ||
    x === 'gluten_free' ||
    x === 'dairy_free' ||
    x === 'other'
  );
}

function isCookingExperience(x: unknown): x is CookingExperience {
  return x === 'new' || x === 'home_cook' || x === 'confident' || x === 'pro';
}

function parseStringArray(x: unknown): string[] {
  return Array.isArray(x) ? x.filter((v): v is string => typeof v === 'string') : [];
}

/** Normalize profile JSON from AsyncStorage or Supabase `profiles.profile` jsonb. */
export function normalizeStoredProfileJson(input: unknown): StoredProfile | null {
  if (typeof input !== 'object' || input === null) return null;
  const p = input as Record<string, unknown>;
  try {
    return {
      countryCode: typeof p.countryCode === 'string' ? p.countryCode : 'WORLDWIDE',
      skillLevel: isSkillLevel(p.skillLevel) ? p.skillLevel : 'beginner',
      kitchenComfort: isKitchenComfort(p.kitchenComfort) ? p.kitchenComfort : 'balanced',
      preferences: parseStringArray(p.preferences),
      dislikes: parseStringArray(p.dislikes),
      vegetarianFocus: Boolean(p.vegetarianFocus),
      pescetarianFriendly: Boolean(p.pescetarianFriendly),
      wellnessGoal: isWellnessGoal(p.wellnessGoal) ? p.wellnessGoal : 'unsure',
      dietaryPreference: isDietaryPreference(p.dietaryPreference) ? p.dietaryPreference : 'none',
      cuisines: parseStringArray(p.cuisines),
      allergies: parseStringArray(p.allergies),
      avoidFoods: parseStringArray(p.avoidFoods),
      cookingExperience: isCookingExperience(p.cookingExperience) ? p.cookingExperience : 'home_cook',
      kitchenEquipment: parseStringArray(p.kitchenEquipment),
      cookingSchedule: typeof p.cookingSchedule === 'string' ? p.cookingSchedule : 'flexible',
      flavorProfile: parseStringArray(p.flavorProfile),
      spicyLevel: p.spicyLevel === 'hot' || p.spicyLevel === 'medium' || p.spicyLevel === 'mild' ? p.spicyLevel : 'medium',
      calorieFocus:
        p.calorieFocus === 'no_preference' ||
        p.calorieFocus === 'lower' ||
        p.calorieFocus === 'balanced' ||
        p.calorieFocus === 'higher'
          ? p.calorieFocus
          : 'no_preference',
      ...(p.introWizardComplete === true ? { introWizardComplete: true as const } : {}),
      ...(p.flowOnboardingDone === true ? { flowOnboardingDone: true as const } : {}),
    };
  } catch {
    return null;
  }
}

/**
 * Apply server-backed onboarding progress to local AsyncStorage flags (same device or new device).
 * Any existing `profiles` row means the app has upserted at least once — skip intro for returning
 * sign-ins even when `profile` is `{}` (normalizes to defaults) or legacy JSON lacks wizard flags.
 */
export async function hydrateLocalFlagsFromRemoteProfile(remote: StoredProfile): Promise<void> {
  await setProfile(remote);
  await setIntroSeen();
  if (remote.flowOnboardingDone === true || remote.introWizardComplete === true) {
    await setGetStartedSeen();
    await setOnboardingComplete();
  }
}

function parseProfile(raw: string): StoredProfile | null {
  try {
    return normalizeStoredProfileJson(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function getIntroSeen(): Promise<boolean> {
  const v = await AsyncStorage.getItem(INTRO_SEEN_KEY);
  return v === '1';
}

export async function setIntroSeen(): Promise<void> {
  await AsyncStorage.setItem(INTRO_SEEN_KEY, '1');
}

export async function getOnboardingComplete(): Promise<boolean> {
  const v = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
  return v === '1';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, '1');
}

export async function getGetStartedSeen(): Promise<boolean> {
  const v = await AsyncStorage.getItem(GET_STARTED_SEEN_KEY);
  return v === '1';
}

export async function setGetStartedSeen(): Promise<void> {
  await AsyncStorage.setItem(GET_STARTED_SEEN_KEY, '1');
}

/** Supabase Auth `user_metadata` key — survives new devices and local cache clears. */
export const AUTH_USER_METADATA_INTRO_COMPLETE = 'mealmind_intro_complete' as const;

export function userMetadataSaysIntroComplete(user: User | undefined | null): boolean {
  if (!user) return false;
  return user.user_metadata?.[AUTH_USER_METADATA_INTRO_COMPLETE] === true;
}

/** When JWT already marks intro as done, mirror that into AsyncStorage (e.g. second login, reinstall). */
export async function syncLocalIntroFlagsFromAuthUser(user: User | undefined | null): Promise<void> {
  if (!userMetadataSaysIntroComplete(user)) return;
  await setIntroSeen();
  await setGetStartedSeen();
  await setOnboardingComplete();
}

export async function getProfile(): Promise<StoredProfile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_DRAFT_KEY);
  if (raw == null) return null;
  return parseProfile(raw);
}

export async function setProfile(profile: StoredProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(profile));
}

/** Wipes intro / get-started / onboarding-complete flags and the profile draft (e.g. sign out or account switch). */
export async function clearProfileAndOnboardingState(): Promise<void> {
  await AsyncStorage.multiRemove([INTRO_SEEN_KEY, ONBOARDING_COMPLETE_KEY, GET_STARTED_SEEN_KEY, PROFILE_DRAFT_KEY]);
}

export async function getLastAuthUserId(): Promise<string | null> {
  return await AsyncStorage.getItem(LAST_AUTH_USER_ID_KEY);
}

export async function setLastAuthUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(LAST_AUTH_USER_ID_KEY, userId);
}

export async function clearLastAuthUserId(): Promise<void> {
  await AsyncStorage.removeItem(LAST_AUTH_USER_ID_KEY);
}

export async function clearOnboardingForDev(): Promise<void> {
  await clearProfileAndOnboardingState();
}
