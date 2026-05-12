import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindScreen } from '@/components/mealmind';
import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useI18n } from '@/contexts/i18n-context';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';
import type { AppLocale } from '@/lib/i18n/locales';
import { getAppLanguage, languageLabel } from '@/lib/app-preferences';
import { showSuccessToast } from '@/lib/mealmind-toast';

const LOCALES: { code: AppLocale; key: string; native: string }[] = [
  { code: 'en', key: 'language.name.en', native: 'English' },
  { code: 'es', key: 'language.name.es', native: 'Español' },
  { code: 'fr', key: 'language.name.fr', native: 'Français' },
  { code: 'de', key: 'language.name.de', native: 'Deutsch' },
  { code: 'it', key: 'language.name.it', native: 'Italiano' },
  { code: 'pt', key: 'language.name.pt', native: 'Português' },
  { code: 'nl', key: 'language.name.nl', native: 'Nederlands' },
  { code: 'ru', key: 'language.name.ru', native: 'Русский' },
  { code: 'uk', key: 'language.name.uk', native: 'Українська' },
  { code: 'pl', key: 'language.name.pl', native: 'Polski' },
  { code: 'cs', key: 'language.name.cs', native: 'Čeština' },
  { code: 'hu', key: 'language.name.hu', native: 'Magyar' },
  { code: 'ro', key: 'language.name.ro', native: 'Română' },
  { code: 'el', key: 'language.name.el', native: 'Ελληνικά' },
  { code: 'tr', key: 'language.name.tr', native: 'Türkçe' },
  { code: 'ar', key: 'language.name.ar', native: 'العربية' },
  { code: 'he', key: 'language.name.he', native: 'עברית' },
  { code: 'hi', key: 'language.name.hi', native: 'हिन्दी' },
  { code: 'bn', key: 'language.name.bn', native: 'বাংলা' },
  { code: 'th', key: 'language.name.th', native: 'ไทย' },
  { code: 'vi', key: 'language.name.vi', native: 'Tiếng Việt' },
  { code: 'id', key: 'language.name.id', native: 'Bahasa Indonesia' },
  { code: 'ms', key: 'language.name.ms', native: 'Bahasa Melayu' },
  { code: 'tl', key: 'language.name.tl', native: 'Filipino' },
  { code: 'ja', key: 'language.name.ja', native: '日本語' },
  { code: 'ko', key: 'language.name.ko', native: '한국어' },
  { code: 'zh', key: 'language.name.zh', native: '中文' },
  { code: 'sv', key: 'language.name.sv', native: 'Svenska' },
  { code: 'da', key: 'language.name.da', native: 'Dansk' },
  { code: 'no', key: 'language.name.no', native: 'Norsk' },
  { code: 'fi', key: 'language.name.fi', native: 'Suomi' },
];

function createLanguageStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: MealMindSpace.md,
      paddingBottom: MealMindSpace.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: `${colors.outlineVariant}44`,
      backgroundColor: colors.surface,
    },
    backBtn: { padding: 4 },
    headerTitle: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 18,
      color: colors.primary,
      letterSpacing: headlineTracking,
    },
    body: { padding: 20, gap: 10 },
    sub: {
      fontFamily: MealMindFonts.body,
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderRadius: MealMindRadii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.outlineVariant}66`,
      backgroundColor: colors.surfaceContainerLowest,
      gap: 12,
    },
    rowOn: { borderColor: colors.primary, borderWidth: 2 },
    rowLabel: { flex: 1, fontFamily: MealMindFonts.bodyMedium, fontSize: 17, color: colors.onSurface },
    rowLabelOn: { color: colors.primary },
    rowMeta: { fontFamily: MealMindFonts.labelSemibold, fontSize: 12, color: colors.outline },
    pressed: { opacity: 0.9 },
  });
}

export default function ProfileLanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, locale, setLocale } = useI18n();
  const colors = useMealMindColors();
  const styles = useMemo(() => createLanguageStyles(colors), [colors]);
  const [code, setCode] = useState<AppLocale>('en');

  useEffect(() => {
    void getAppLanguage().then((c) => setCode(c as AppLocale));
  }, []);

  const pick = useCallback(
    async (c: AppLocale) => {
      setCode(c);
      await setLocale(c);
      showSuccessToast(t('language.picked', { name: languageLabel(c, locale) }));
    },
    [setLocale, t, locale],
  );

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('language.title')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.sub}>{t('language.sub')}</Text>
        {LOCALES.map((l) => {
          const on = code === l.code;
          return (
            <Pressable
              key={l.code}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => void pick(l.code)}
              style={({ pressed }) => [styles.row, on && styles.rowOn, pressed && styles.pressed]}>
              <Text style={[styles.rowLabel, on && styles.rowLabelOn]}>{l.native}</Text>
              <Text style={styles.rowMeta}>{l.code.toUpperCase()}</Text>
              {on ? <MaterialIcons name="check" size={22} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </MealMindScreen>
  );
}
