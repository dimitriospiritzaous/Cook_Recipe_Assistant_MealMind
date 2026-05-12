import { useMemo } from 'react';

import {
  COOKING_STYLE_CHIPS,
  COOKING_TIME_CHIPS,
  MEAL_TYPE_CHIPS,
  type MealChip,
  type CookingStyleId,
  type CookingTimeId,
  type MealTypeId,
} from '@/lib/meal-taxonomy';

import { useI18n } from '@/contexts/i18n-context';

export function useTranslatedTaxonomy(): {
  mealTypes: MealChip<MealTypeId>[];
  cookingStyles: MealChip<CookingStyleId>[];
  cookingTimes: MealChip<CookingTimeId>[];
} {
  const { t } = useI18n();
  return useMemo(
    () => ({
      mealTypes: MEAL_TYPE_CHIPS.map((c) => ({ ...c, label: t(`chips.meal.${c.id}`) })),
      cookingStyles: COOKING_STYLE_CHIPS.map((c) => ({ ...c, label: t(`chips.style.${c.id}`) })),
      cookingTimes: COOKING_TIME_CHIPS.map((c) => ({ ...c, label: t(`chips.time.${c.id}`) })),
    }),
    [t],
  );
}
