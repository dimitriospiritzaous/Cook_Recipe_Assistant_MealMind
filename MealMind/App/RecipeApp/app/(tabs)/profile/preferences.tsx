import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import {
  getAppLanguage,
  getThemePreference,
  languageLabel,
  type ThemePreference,
} from '@/lib/app-preferences';
import { useCallback, useEffect, useState } from 'react';

export default function ProfilePreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState<ThemePreference>('system');

  const load = useCallback(() => {
    void (async () => {
      setLang(await getAppLanguage());
      setTheme(await getThemePreference());
    })();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const themeLabel = theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light';

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.sectionLabel}>App</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => router.push('/(tabs)/profile/language')}>
            <MaterialIcons name="language" size={22} color={MealMindColors.outline} />
            <Text style={styles.rowLabel}>Language</Text>
            <Text style={styles.rowValue}>{languageLabel(lang)}</Text>
            <MaterialIcons name="chevron-right" size={20} color={MealMindColors.outlineVariant} />
          </Pressable>
          <View style={styles.hairline} />
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => router.push('/(tabs)/profile/theme')}>
            <MaterialIcons name="dark-mode" size={22} color={MealMindColors.outline} />
            <Text style={styles.rowLabel}>Theme</Text>
            <Text style={styles.rowValue}>{themeLabel}</Text>
            <MaterialIcons name="chevron-right" size={20} color={MealMindColors.outlineVariant} />
          </Pressable>
        </View>
      </ScrollView>
    </MealMindScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MealMindSpace.md,
    paddingBottom: MealMindSpace.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${MealMindColors.outlineVariant}44`,
    backgroundColor: MealMindColors.surface,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    color: MealMindColors.primary,
    letterSpacing: headlineTracking,
  },
  body: { padding: 20, gap: 16 },
  sectionLabel: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: MealMindColors.outline,
    marginLeft: 4,
  },
  card: {
    borderRadius: MealMindRadii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}44`,
    backgroundColor: MealMindColors.surfaceContainerLowest,
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
  rowLabel: { flex: 1, fontFamily: MealMindFonts.body, fontSize: 16, color: MealMindColors.onSurface },
  rowValue: {
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    color: MealMindColors.outline,
    marginRight: 4,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: `${MealMindColors.outlineVariant}55`,
    marginLeft: 52,
  },
  pressed: { opacity: 0.9 },
});
