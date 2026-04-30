import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MockRecipe } from '@/lib/mealmind-recipe-mocks';

const FAVORITES_KEY = 'mealmind.favorites.v1';

export type FavoriteEntry = {
  savedAt: number;
  recipe: MockRecipe;
};

function safeParse(raw: string | null): FavoriteEntry[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .map((row) => {
        const r = row as Partial<FavoriteEntry> | null;
        if (!r || typeof r !== 'object') return null;
        const recipe = (r as { recipe?: unknown }).recipe as MockRecipe | undefined;
        if (!recipe || typeof recipe !== 'object' || typeof recipe.id !== 'string') return null;
        const savedAt =
          typeof (r as { savedAt?: unknown }).savedAt === 'number'
            ? (r as { savedAt: number }).savedAt
            : Date.now();
        return { savedAt, recipe };
      })
      .filter((x): x is FavoriteEntry => Boolean(x));
  } catch {
    return [];
  }
}

export async function getFavoriteEntries(): Promise<FavoriteEntry[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  const list = safeParse(raw);
  // newest first
  return list.sort((a, b) => b.savedAt - a.savedAt);
}

export async function getFavoriteRecipes(): Promise<MockRecipe[]> {
  const entries = await getFavoriteEntries();
  return entries.map((e) => e.recipe);
}

export async function isRecipeFavorited(recipeId: string): Promise<boolean> {
  const entries = await getFavoriteEntries();
  return entries.some((e) => e.recipe.id === recipeId);
}

export async function addFavoriteRecipe(recipe: MockRecipe): Promise<void> {
  const entries = await getFavoriteEntries();
  const filtered = entries.filter((e) => e.recipe.id !== recipe.id);
  filtered.unshift({ savedAt: Date.now(), recipe });
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

export async function removeFavoriteRecipe(recipeId: string): Promise<void> {
  const entries = await getFavoriteEntries();
  const next = entries.filter((e) => e.recipe.id !== recipeId);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
}

export async function toggleFavoriteRecipe(recipe: MockRecipe): Promise<{ nowFavorited: boolean }> {
  const entries = await getFavoriteEntries();
  const exists = entries.some((e) => e.recipe.id === recipe.id);
  if (exists) {
    await removeFavoriteRecipe(recipe.id);
    return { nowFavorited: false };
  }
  await addFavoriteRecipe(recipe);
  return { nowFavorited: true };
}

export async function clearFavorites(): Promise<void> {
  await AsyncStorage.removeItem(FAVORITES_KEY);
}
