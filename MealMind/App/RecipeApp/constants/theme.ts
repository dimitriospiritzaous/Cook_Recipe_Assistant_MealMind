/**
 * App-wide theme hooks for navigation / legacy components.
 * MealMind palette: `constants/mealmind-colors.ts` + `useMealMindTheme()`.
 */

import { Platform } from 'react-native';

import { MEALMIND_PALETTE_DARK, MEALMIND_PALETTE_LIGHT } from './mealmind-colors';

const tintColorLight = MEALMIND_PALETTE_LIGHT.primaryContainer;
const tintColorDark = MEALMIND_PALETTE_DARK.primaryContainer;

export const Colors = {
  light: {
    text: MEALMIND_PALETTE_LIGHT.onSurface,
    background: MEALMIND_PALETTE_LIGHT.surface,
    tint: tintColorLight,
    icon: MEALMIND_PALETTE_LIGHT.onSurfaceVariant,
    tabIconDefault: MEALMIND_PALETTE_LIGHT.onSurfaceVariant,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: MEALMIND_PALETTE_DARK.onSurface,
    background: MEALMIND_PALETTE_DARK.surface,
    tint: tintColorDark,
    icon: MEALMIND_PALETTE_DARK.onSurfaceVariant,
    tabIconDefault: MEALMIND_PALETTE_DARK.onSurfaceVariant,
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
