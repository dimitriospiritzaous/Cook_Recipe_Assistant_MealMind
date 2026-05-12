import type { MealMindPalette } from './mealmind-colors';

/** Radii from DESIGN.md: DEFAULT 1rem, lg 2rem, xl 3rem (16 / 32 / 48 at 1rem=16). */
export const MealMindRadii = {
  sm: 12,
  md: 16,
  lg: 32,
  xl: 48,
  full: 9999,
} as const;

export const MealMindSpace = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** Ambient shadow — uses current on-surface tint. */
export function mealMindAmbientShadow(colors: MealMindPalette) {
  return {
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 10,
  } as const;
}

/** Primary CTA glow shadow. */
export function mealMindGlowCtaShadow(primary: string) {
  return {
    shadowColor: primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  } as const;
}

/** @deprecated Use mealMindAmbientShadow(colors) or mealMindGlowCtaShadow(primary) for theme-aware shadows. */
export const MealMindShadow = {
  ambient: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 10,
  },
  glowCta: {
    shadowColor: '#8f4e00',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
};
