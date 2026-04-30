import Toast, { BaseToast, type ToastConfig } from 'react-native-toast-message';

import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindFonts } from '@/constants/mealmind-typography';

const toastBaseStyle = {
  backgroundColor: MealMindColors.surfaceContainerLowest,
  height: undefined as number | undefined,
  minHeight: 60,
  paddingVertical: 12,
};

const toastText1 = {
  fontSize: 16,
  fontFamily: MealMindFonts.labelSemibold,
  color: MealMindColors.onSurface,
};

const toastText2 = {
  fontSize: 14,
  fontFamily: MealMindFonts.body,
  color: MealMindColors.onSurfaceVariant,
};

export const mealmindToastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        ...toastBaseStyle,
        borderLeftColor: MealMindColors.primary,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={toastText1}
      text2Style={toastText2}
      text2NumberOfLines={4}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{
        ...toastBaseStyle,
        borderLeftColor: MealMindColors.error,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={toastText1}
      text2Style={toastText2}
      text2NumberOfLines={6}
    />
  ),
};

export function showAuthSuccessToast(text1: string, text2?: string): void {
  Toast.show({
    type: 'success',
    text1,
    text2,
    visibilityTime: 2800,
    topOffset: 56,
  });
}

/** Short positive confirmation (e.g. "Saved to Favorites"). */
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
