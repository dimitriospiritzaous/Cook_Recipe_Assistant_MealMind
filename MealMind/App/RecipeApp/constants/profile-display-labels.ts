import type {
  CookingExperience,
  DietaryPreference,
  WellnessGoal,
} from '@/lib/profile-storage';

export const WELLNESS_GOAL_LABELS: Record<WellnessGoal, string> = {
  eat_healthier: 'Eat healthier',
  save_time: 'Save time',
  lose_weight: 'Lose weight',
  gain_muscle: 'Gain muscle',
  maintain_weight: 'Maintain weight',
  reduce_waste: 'Reduce food waste',
  budget: 'Eat on a budget',
  unsure: 'Not sure yet',
};

export const DIETARY_PREFERENCE_LABELS: Record<DietaryPreference, string> = {
  none: 'No preference',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  keto: 'Keto',
  low_carb: 'Low carb',
  high_protein: 'High protein',
  gluten_free: 'Gluten free',
  dairy_free: 'Dairy free',
  other: 'Other',
};

export const COOKING_EXPERIENCE_LABELS: Record<CookingExperience, string> = {
  new: 'New to cooking',
  home_cook: 'Home cook',
  confident: 'Confident',
  pro: 'Pro / enthusiast',
};

export function spicyLevelLabel(level: 'mild' | 'medium' | 'hot'): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function calorieFocusLabel(
  focus: 'no_preference' | 'lower' | 'balanced' | 'higher',
): string {
  switch (focus) {
    case 'no_preference':
      return 'No preference';
    case 'lower':
      return 'Lower calories';
    case 'balanced':
      return 'Balanced';
    case 'higher':
      return 'Higher calories';
    default:
      return focus;
  }
}
