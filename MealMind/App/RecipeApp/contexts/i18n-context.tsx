import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { AppLocale } from '@/lib/i18n/locales';
import { getDeviceLanguageTag } from '@/lib/i18n/locales';
import { translate as translateString } from '@/lib/i18n/translate';
import { getAppLanguage, setAppLanguage } from '@/lib/app-preferences';

type I18nContextValue = {
  locale: AppLocale;
  /** Resolved after first async read of stored language (or device default). */
  ready: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLocale: (code: AppLocale) => Promise<void>;
  refreshLocale: () => Promise<void>;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<AppLocale>(() => getDeviceLanguageTag());
  const [ready, setReady] = useState(false);

  const refreshLocale = useCallback(async () => {
    const next = (await getAppLanguage()) as AppLocale;
    setLocaleState(next);
    setReady(true);
  }, []);

  useEffect(() => {
    void refreshLocale();
  }, [refreshLocale]);

  const setLocale = useCallback(async (code: AppLocale) => {
    await setAppLanguage(code);
    setLocaleState(code);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translateString(locale, key, vars),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, ready, t, setLocale, refreshLocale }),
    [locale, ready, t, setLocale, refreshLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
