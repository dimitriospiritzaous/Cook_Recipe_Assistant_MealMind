import Toast, { BaseToast, type ToastConfig } from 'react-native-toast-message';
import { useMemo } from 'react';

import { useMealMindTheme } from '@/contexts/mealmind-theme-context';
import { MealMindFonts } from '@/constants/mealmind-typography';

export function useMealmindToastConfig(): ToastConfig {
  const { colors } = useMealMindTheme();

  return useMemo(
    () => ({
      success: (props) => (
        <BaseToast
          {...props}
          style={{
            backgroundColor: colors.surfaceContainerLowest,
            height: undefined as number | undefined,
            minHeight: 60,
            paddingVertical: 12,
            borderLeftColor: colors.primary,
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          text1Style={{
            fontSize: 16,
            fontFamily: MealMindFonts.labelSemibold,
            color: colors.onSurface,
          }}
          text2Style={{
            fontSize: 14,
            fontFamily: MealMindFonts.body,
            color: colors.onSurfaceVariant,
          }}
          text2NumberOfLines={4}
        />
      ),
      error: (props) => (
        <BaseToast
          {...props}
          style={{
            backgroundColor: colors.surfaceContainerLowest,
            height: undefined as number | undefined,
            minHeight: 60,
            paddingVertical: 12,
            borderLeftColor: colors.error,
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          text1Style={{
            fontSize: 16,
            fontFamily: MealMindFonts.labelSemibold,
            color: colors.onSurface,
          }}
          text2Style={{
            fontSize: 14,
            fontFamily: MealMindFonts.body,
            color: colors.onSurfaceVariant,
          }}
          text2NumberOfLines={6}
        />
      ),
    }),
    [colors],
  );
}

export function showAuthSuccessToast(text1: string, text2?: string): void {
  Toast.show({
    type: 'success',
    text1,
    text2,
    visibilityTime: 2800,
    topOffset: 56,
  });
}

export function showSuccessToast(text1: string, text2?: string): void {
  Toast.show({
    type: 'success',
    text1,
    text2,
    visibilityTime: 2600,
    topOffset: 56,
  });
}

export function showErrorToast(text1: string, text2?: string): void {
  Toast.show({
    type: 'error',
    text1,
    text2,
    visibilityTime: 4500,
    topOffset: 56,
  });
}
