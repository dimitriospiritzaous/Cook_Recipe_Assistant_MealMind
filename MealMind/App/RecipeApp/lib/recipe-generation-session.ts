import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MockRecipe } from '@/lib/mealmind-recipe-mocks';

const PENDING_KEY = 'mealmind.pendingRecipeSearch';
const GENERATED_KEY = 'mealmind.lastGeneratedRecipes';

export type PendingRecipeSearch = {
  ingredients: string[];
  mealTypeLabel: string;
  cookingTimeLabel: string;
  cookingStyleLabel: string;
};

export async function setPendingRecipeSearch(payload: PendingRecipeSearch): Promise<void> {
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(payload));
}

function parsePendingRaw(raw: string): PendingRecipeSearch | null {
  try {
    const p = JSON.parse(raw) as PendingRecipeSearch;
    if (!p || !Array.isArray(p.ingredients)) {
      return null;
    }
    return {
      ingredients: p.ingredients.filter((s) => typeof s === 'string'),
      mealTypeLabel: typeof p.mealTypeLabel === 'string' ? p.mealTypeLabel : '',
      cookingTimeLabel: typeof p.cookingTimeLabel === 'string' ? p.cookingTimeLabel : '',
      cookingStyleLabel: typeof p.cookingStyleLabel === 'string' ? p.cookingStyleLabel : '',
    };
  } catch {
    return null;
  }
}

/** Read pending search without consuming it (for gating before generation). */
export async function peekPendingRecipeSearch(): Promise<PendingRecipeSearch | null> {
  const raw = await AsyncStorage.getItem(PENDING_KEY);
  if (raw == null) {
    return null;
  }
  return parsePendingRaw(raw);
}

export async function takePendingRecipeSearch(): Promise<PendingRecipeSearch | null> {
  const raw = await AsyncStorage.getItem(PENDING_KEY);
  await AsyncStorage.removeItem(PENDING_KEY);
  if (raw == null) {
    return null;
  }
  return parsePendingRaw(raw);
}

/** Drop a queued search without running generation (e.g. free tier blocked). */
export async function clearPendingRecipeSearch(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_KEY);
}

export type LastGeneratedSession = {
  savedAt: number;
  recipes: MockRecipe[];
  /** Meal type chip label from home (e.g. Lunch) when user ran Find My Meal. */
  mealTypeLabel?: string;
  cookingTimeLabel?: string;
  cookingStyleLabel?: string;
  /** Snapshot of home search (ingredients + filters) for Load more generations. */
  searchContext?: PendingRecipeSearch;
};

type StoredGenerated = LastGeneratedSession;

function parseSearchContextRaw(raw: unknown): PendingRecipeSearch | undefined {
  if (raw == null || typeof raw !== 'object') {
    return undefined;
  }
  const p = raw as Record<string, unknown>;
  if (!Array.isArray(p.ingredients)) {
    return undefined;
  }
  return {
    ingredients: p.ingredients.filter((s): s is string => typeof s === 'string'),
    mealTypeLabel: typeof p.mealTypeLabel === 'string' ? p.mealTypeLabel : '',
    cookingTimeLabel: typeof p.cookingTimeLabel === 'string' ? p.cookingTimeLabel : '',
    cookingStyleLabel: typeof p.cookingStyleLabel === 'string' ? p.cookingStyleLabel : '',
  };
}

export async function setLastGeneratedRecipes(
  recipes: MockRecipe[],
  meta?: Pick<LastGeneratedSession, 'mealTypeLabel' | 'cookingTimeLabel' | 'cookingStyleLabel' | 'searchContext'>,
): Promise<void> {
  const payload: StoredGenerated = { savedAt: Date.now(), recipes, ...meta };
  await AsyncStorage.setItem(GENERATED_KEY, JSON.stringify(payload));
}

export async function clearLastGeneratedRecipes(): Promise<void> {
  await AsyncStorage.removeItem(GENERATED_KEY);
}

export async function getLastGeneratedSession(): Promise<LastGeneratedSession | null> {
  const raw = await AsyncStorage.getItem(GENERATED_KEY);
  if (raw == null) {
    return null;
  }
  try {
    const p = JSON.parse(raw) as StoredGenerated;
    if (!p?.recipes || !Array.isArray(p.recipes)) {
      return null;
    }
    return {
      savedAt: typeof p.savedAt === 'number' ? p.savedAt : Date.now(),
      recipes: p.recipes,
      mealTypeLabel: typeof p.mealTypeLabel === 'string' ? p.mealTypeLabel : undefined,
      cookingTimeLabel: typeof p.cookingTimeLabel === 'string' ? p.cookingTimeLabel : undefined,
      cookingStyleLabel: typeof p.cookingStyleLabel === 'string' ? p.cookingStyleLabel : undefined,
      searchContext: parseSearchContextRaw(p.searchContext),
    };
  } catch {
    return null;
  }
}

export async function getLastGeneratedRecipes(): Promise<MockRecipe[] | null> {
  const s = await getLastGeneratedSession();
  return s?.recipes ?? null;
}

export async function getGeneratedRecipeById(id: string): Promise<MockRecipe | null> {
  const list = await getLastGeneratedRecipes();
  return list?.find((r) => r.id === id) ?? null;
}
