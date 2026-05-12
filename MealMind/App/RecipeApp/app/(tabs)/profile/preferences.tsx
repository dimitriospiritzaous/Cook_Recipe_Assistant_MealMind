import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindScreen } from '@/components/mealmind';
import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useI18n } from '@/contexts/i18n-context';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';
import {
  getAppLanguage,
  getThemePreference,
  languageLabel,
  type ThemePreference,
} from '@/lib/app-preferences';

function createPreferencesStyles(colors: MealMindPalette) {
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
    body: { padding: 20, gap: 16 },
    sectionLabel: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 12,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.outline,
      marginLeft: 4,
    },
    card: {
      borderRadius: MealMindRadii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.outlineVariant}44`,
      backgroundColor: colors.surfaceContainerLowest,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 16,
      paddingHorizontal: 16,
      minHeight: 52,
    },
    rowLabel: { flex: 1, fontFamily: MealMindFonts.body, fontSize: 16, color: colors.onSurface },
    rowValue: {
      fontFamily: MealMindFonts.body,
      fontSize: 15,
      color: colors.outline,
      marginRight: 4,
    },
    hairline: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: `${colors.outlineVariant}55`,
      marginLeft: 52,
    },
    pressed: { opacity: 0.9 },
  });
}

export default function ProfilePreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, locale } = useI18n();
  const colors = useMealMindColors();
  const styles = useMemo(() => createPreferencesStyles(colors), [colors]);
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState<ThemePreference>('system');

  const load = useCallback(() => {
    void (async () => {
      setLang(await getAppLanguage());
      setTheme(await getThemePreference());
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const themeLabel =
    theme === 'system' ? t('profile.themeSystem') : theme === 'dark' ? t('profile.themeDark') : t('profile.themeLight');

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('preferences.title')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.sectionLabel}>{t('preferences.sectionApp')}</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => router.push('/(tabs)/profile/language')}>
            <MaterialIcons name="language" size={22} color={colors.outline} />
            <Text style={styles.rowLabel}>{t('preferences.language')}</Text>
            <Text style={styles.rowValue}>{languageLabel(lang, locale)}</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
          </Pressable>
          <View style={styles.hairline} />
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => router.push('/(tabs)/profile/theme')}>
            <MaterialIcons name="dark-mode" size={22} color={colors.outline} />
            <Text style={styles.rowLabel}>{t('preferences.theme')}</Text>
            <Text style={styles.rowValue}>{themeLabel}</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
          </Pressable>
        </View>
      </ScrollView>
    </MealMindScreen>
  );
}
