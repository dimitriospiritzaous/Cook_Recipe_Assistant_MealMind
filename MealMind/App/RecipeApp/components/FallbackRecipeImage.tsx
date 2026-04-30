import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import type { ImageStyle, StyleProp } from 'react-native';

import {
  GENERIC_MEAL_IMAGE_PLACEHOLDERS,
  RELIABLE_GENERIC_FOOD_BACKDROPS,
} from '@/lib/recipe-image-placeholders';
import { TRUSTED_RECIPE_HERO_URLS } from '@/lib/mealmind-recipe-mocks';

type Props = {
  uri: string | undefined;
  style: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain' | 'fill';
  /** AI-generated recipes: on error, use neutral prep shots only (never pasta/salmon design mocks). */
  useNeutralFallbacks?: boolean;
  /** Recipe id (or similar) so expo-image does not recycle the wrong bitmap across list rows. */
  stableKey?: string;
  /** Fires when the current source finishes loading (including after an automatic fallback swap). */
  onLoad?: () => void;
};

/**
 * Loads a remote recipe hero; on failure steps through fallbacks so the card never stays blank.
 */
export function FallbackRecipeImage({
  uri,
  style,
  contentFit = 'cover',
  useNeutralFallbacks = false,
  stableKey,
  onLoad,
}: Props) {
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setAttempt(0);
  }, [uri, useNeutralFallbacks, stableKey]);
  const chain = useMemo(() => {
    const u = uri?.trim();
    const primary =
      u && (/^https:\/\//i.test(u) || /^file:\/\//i.test(u)) ? u : null;
    const pool = useNeutralFallbacks ? GENERIC_MEAL_IMAGE_PLACEHOLDERS : TRUSTED_RECIPE_HERO_URLS;
    const merged = [primary, ...pool, ...RELIABLE_GENERIC_FOOD_BACKDROPS].filter((x): x is string =>
      Boolean(x),
    );
    const seen = new Set<string>();
    const list: string[] = [];
    for (const x of merged) {
      if (!seen.has(x)) {
        seen.add(x);
        list.push(x);
      }
    }
    return list.length > 0 ? list : [...RELIABLE_GENERIC_FOOD_BACKDROPS];
  }, [uri, useNeutralFallbacks]);
  const idx = Math.min(attempt, Math.max(0, chain.length - 1));
  const src = chain[idx];
  const recyclingKey = `${stableKey ?? 'row'}|${src}|${idx}`;

  return (
    <Image
      key={`${stableKey ?? 'img'}|${src}|${idx}`}
      recyclingKey={recyclingKey}
      source={{ uri: src }}
      style={style}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      onLoad={() => onLoad?.()}
      onError={() => setAttempt((a) => (a + 1 < chain.length ? a + 1 : a))}
    />
  );
}
