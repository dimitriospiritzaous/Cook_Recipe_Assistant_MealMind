/**
 * MealMind palettes — light (Design/harvest_hearth) + dark companion.
 * Use `useMealMindTheme()` / `useMealMindColors()` from `@/contexts/mealmind-theme-context` in components.
 */
export type MealMindPalette = {
  surface: string;
  surfaceContainer: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceContainerLowest: string;
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;
  primaryFixed: string;
  onPrimaryFixedVariant: string;
  secondary: string;
  secondaryContainer: string;
  secondaryFixed: string;
  onSecondaryContainer: string;
  onSecondaryFixedVariant: string;
  tertiary: string;
  tertiaryContainer: string;
  tertiaryFixed: string;
  onTertiaryFixed: string;
  onTertiaryFixedVariant: string;
  tertiaryFixedDim: string;
  onTertiaryContainer: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  error: string;
  errorContainer: string;
  onErrorContainer: string;
  surfaceContainerHighest: string;
};

export const MEALMIND_PALETTE_LIGHT: MealMindPalette = {
  surface: '#fef8f5',
  surfaceContainer: '#f2edea',
  surfaceContainerLow: '#f8f2f0',
  surfaceContainerHigh: '#ede7e4',
  surfaceContainerLowest: '#ffffff',
  primary: '#8f4e00',
  primaryContainer: '#ff9f43',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#6d3a00',
  primaryFixed: '#ffdcc2',
  onPrimaryFixedVariant: '#6d3a00',
  secondary: '#566342',
  secondaryContainer: '#d7e5bb',
  secondaryFixed: '#dae8be',
  onSecondaryContainer: '#5a6745',
  onSecondaryFixedVariant: '#3f4b2c',
  tertiary: '#665e49',
  tertiaryContainer: '#c0b59c',
  tertiaryFixed: '#eee1c7',
  onTertiaryFixed: '#211b0b',
  onTertiaryFixedVariant: '#4e4633',
  tertiaryFixedDim: '#d1c5ac',
  onTertiaryContainer: '#4e4733',
  onSurface: '#1d1b1a',
  onSurfaceVariant: '#544437',
  outline: '#877365',
  outlineVariant: '#dac2b1',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  surfaceContainerHighest: '#e7e1df',
};

/**
 * @deprecated Use `useMealMindColors()` from `@/contexts/mealmind-theme-context` in UI code.
 * Light palette only; does not react to dark mode.
 */
export const MealMindColors: MealMindPalette = MEALMIND_PALETTE_LIGHT;

/** Warm dark surfaces; keep brand orange readable on deep brown. */
export const MEALMIND_PALETTE_DARK: MealMindPalette = {
  surface: '#141210',
  surfaceContainer: '#1f1c19',
  surfaceContainerLow: '#191714',
  surfaceContainerHigh: '#2a2622',
  surfaceContainerLowest: '#0e0c0b',
  primary: '#ffb86c',
  primaryContainer: '#c9782e',
  onPrimary: '#1a0f00',
  onPrimaryContainer: '#1a0f00',
  primaryFixed: '#5c3d24',
  onPrimaryFixedVariant: '#ffd8b8',
  secondary: '#b8c9a0',
  secondaryContainer: '#3d4530',
  secondaryFixed: '#3d4530',
  onSecondaryContainer: '#e3e9d4',
  onSecondaryFixedVariant: '#c5d1ae',
  tertiary: '#cfc4a8',
  tertiaryContainer: '#4a4434',
  tertiaryFixed: '#3a3428',
  onTertiaryFixed: '#f5ecd4',
  onTertiaryFixedVariant: '#d4c9ae',
  tertiaryFixedDim: '#5c5545',
  onTertiaryContainer: '#ebe3cf',
  onSurface: '#f4ede6',
  onSurfaceVariant: '#c9b8a8',
  outline: '#a08f82',
  outlineVariant: '#4a4038',
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  surfaceContainerHighest: '#35302b',
};
