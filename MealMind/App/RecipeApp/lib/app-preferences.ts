import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

import { getDeviceLanguageTag, normalizeLocale, type AppLocale } from '@/lib/i18n/locales';
import { translate } from '@/lib/i18n/translate';

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

/** Stored override, or device locale when the user has never chosen a language. */
export async function getAppLanguage(): Promise<string> {
  const v = await AsyncStorage.getItem(LANG_KEY);
  if (v != null && v !== '') {
    return normalizeLocale(v);
  }
  return getDeviceLanguageTag();
}

export async function setAppLanguage(code: string): Promise<void> {
  await AsyncStorage.setItem(LANG_KEY, normalizeLocale(code));
}

const NATIVE_NAMES: Record<string, string> = {
  en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch',
  it: 'Italiano', pt: 'Português', ja: '日本語', ko: '한국어',
  zh: '中文', ar: 'العربية', hi: 'हिन्दी', tr: 'Türkçe',
  ru: 'Русский', pl: 'Polski', nl: 'Nederlands', sv: 'Svenska',
  da: 'Dansk', no: 'Norsk', fi: 'Suomi', el: 'Ελληνικά',
  he: 'עברית', th: 'ไทย', vi: 'Tiếng Việt', id: 'Bahasa Indonesia',
  uk: 'Українська', ms: 'Bahasa Melayu', ro: 'Română', cs: 'Čeština',
  hu: 'Magyar', bn: 'বাংলা', tl: 'Filipino',
};

/** Language display name in the current UI locale. */
export function languageLabel(code: string, viewerLocale: AppLocale = 'en'): string {
  const normalized = normalizeLocale(code);
  const key = `language.name.${normalized}`;
  const localized = translate(viewerLocale, key);
  if (localized !== key) return localized;
  return NATIVE_NAMES[normalized] ?? code.toUpperCase();
}
