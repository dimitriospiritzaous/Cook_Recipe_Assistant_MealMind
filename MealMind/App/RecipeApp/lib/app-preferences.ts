import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const THEME_KEY = 'mealmind.themePreference';
const LANG_KEY = 'mealmind.appLanguage';

export type ThemePreference = 'system' | 'light' | 'dark';

export const DEFAULT_THEME: ThemePreference = 'system';
export const DEFAULT_LANGUAGE = 'en';

export async function getThemePreference(): Promise<ThemePreference> {
  const v = await AsyncStorage.getItem(THEME_KEY);
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return DEFAULT_THEME;
}

export async function setThemePreference(pref: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, pref);
  applyThemePreferenceToAppearance(pref);
}

export function applyThemePreferenceToAppearance(pref: ThemePreference): void {
  if (pref === 'system') {
    Appearance.setColorScheme(null);
  } else {
    Appearance.setColorScheme(pref);
  }
}

export async function loadAndApplyStoredTheme(): Promise<void> {
  const pref = await getThemePreference();
  applyThemePreferenceToAppearance(pref);
}

export async function getAppLanguage(): Promise<string> {
  const v = await AsyncStorage.getItem(LANG_KEY);
  return v && v.length > 0 ? v : DEFAULT_LANGUAGE;
}

export async function setAppLanguage(code: string): Promise<void> {
  await AsyncStorage.setItem(LANG_KEY, code);
}

export function languageLabel(code: string): string {
  switch (code) {
    case 'en':
      return 'English';
    case 'es':
      return 'Spanish';
    case 'fr':
      return 'French';
    default:
      return code.toUpperCase();
  }
}
