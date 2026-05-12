import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { MEALMIND_PALETTE_DARK, MEALMIND_PALETTE_LIGHT, type MealMindPalette } from '@/constants/mealmind-colors';
import { loadAndApplyStoredTheme } from '@/lib/app-preferences';

type MealMindThemeValue = {
  colorScheme: 'light' | 'dark';
  colors: MealMindPalette;
};

const MealMindThemeContext = createContext<MealMindThemeValue | null>(null);

export function MealMindThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const colorScheme: 'light' | 'dark' = system === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    void loadAndApplyStoredTheme();
  }, []);

  const value = useMemo<MealMindThemeValue>(
    () => ({
      colorScheme,
      colors: colorScheme === 'dark' ? MEALMIND_PALETTE_DARK : MEALMIND_PALETTE_LIGHT,
    }),
    [colorScheme],
  );

  return <MealMindThemeContext.Provider value={value}>{children}</MealMindThemeContext.Provider>;
}

export function useMealMindTheme(): MealMindThemeValue {
  const ctx = useContext(MealMindThemeContext);
  if (!ctx) {
    throw new Error('useMealMindTheme must be used within MealMindThemeProvider');
  }
  return ctx;
}

/** Convenience alias for `{ colors } = useMealMindTheme()`. */
export function useMealMindColors(): MealMindPalette {
  return useMealMindTheme().colors;
}
