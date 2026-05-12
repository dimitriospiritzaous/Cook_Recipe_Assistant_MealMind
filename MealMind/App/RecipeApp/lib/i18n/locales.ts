import * as Localization from 'expo-localization';

export const SUPPORTED_LOCALES = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh',
  'ar', 'hi', 'tr', 'ru', 'pl', 'nl', 'sv', 'da', 'no',
  'fi', 'el', 'he', 'th', 'vi', 'id', 'uk', 'ms', 'ro',
  'cs', 'hu', 'bn', 'tl',
] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export function normalizeLocale(code: string): AppLocale {
  const base = code.split(/[-_]/)[0]?.toLowerCase() ?? 'en';
  if ((SUPPORTED_LOCALES as readonly string[]).includes(base)) return base as AppLocale;
  // Common aliases
  if (base === 'nb' || base === 'nn') return 'no';
  if (base === 'fil') return 'tl';
  if (base === 'iw') return 'he';
  if (base === 'in') return 'id';
  return 'en';
}

export function getDeviceLanguageTag(): AppLocale {
  const locales = Localization.getLocales();
  const tag = locales[0]?.languageTag ?? locales[0]?.languageCode ?? 'en';
  return normalizeLocale(tag);
}
