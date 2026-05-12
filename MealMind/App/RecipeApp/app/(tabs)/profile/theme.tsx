import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindScreen } from '@/components/mealmind';
import type { MealMindPalette } from '@/constants/mealmind-colors';
import { mealMindAmbientShadow, MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useI18n } from '@/contexts/i18n-context';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';
import {
  getThemePreference,
  setThemePreference,
  type ThemePreference,
} from '@/lib/app-preferences';
import { showSuccessToast } from '@/lib/mealmind-toast';

function createThemeScreenStyles(colors: MealMindPalette) {
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
    body: { padding: 20, gap: 12 },
    sub: {
      fontFamily: MealMindFonts.body,
      fontSize: 15,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 18,
      borderRadius: MealMindRadii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.outlineVariant}66`,
      backgroundColor: colors.surfaceContainerLowest,
    },
    optionOn: {
      borderColor: colors.primary,
      borderWidth: 2,
      ...mealMindAmbientShadow(colors),
    },
    iconWell: {
      width: 48,
      height: 48,
      borderRadius: MealMindRadii.md,
      backgroundColor: colors.surfaceContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWellOn: { backgroundColor: colors.primary },
    optTitle: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 17,
      color: colors.onSurface,
    },
    optTitleOn: { color: colors.primary },
    optDesc: {
      fontFamily: MealMindFonts.body,
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginTop: 4,
    },
    pressed: { opacity: 0.9 },
  });
}

const OPTIONS: {
  id: ThemePreference;
  labelKey: string;
  descKey: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { id: 'light', labelKey: 'theme.light', descKey: 'theme.lightDesc', icon: 'light-mode' },
  { id: 'dark', labelKey: 'theme.dark', descKey: 'theme.darkDesc', icon: 'dark-mode' },
  { id: 'system', labelKey: 'theme.system', descKey: 'theme.systemDesc', icon: 'brightness-auto' },
];

export default function ProfileThemeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const colors = useMealMindColors();
  const styles = useMemo(() => createThemeScreenStyles(colors), [colors]);
  const [current, setCurrent] = useState<ThemePreference>('system');

  useEffect(() => {
    void getThemePreference().then(setCurrent);
  }, []);

  const pick = useCallback(
    async (id: ThemePreference) => {
      setCurrent(id);
      await setThemePreference(id);
      showSuccessToast(t('theme.updated'));
    },
    [t],
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
        <Text style={styles.headerTitle}>{t('theme.title')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.sub}>{t('theme.sub')}</Text>
        {OPTIONS.map((o) => {
          const on = current === o.id;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => void pick(o.id)}
              style={({ pressed }) => [styles.option, on && styles.optionOn, pressed && styles.pressed]}>
              <View style={[styles.iconWell, on && styles.iconWellOn]}>
                <MaterialIcons name={o.icon} size={26} color={on ? colors.onPrimary : colors.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.optTitle, on && styles.optTitleOn]}>{t(o.labelKey)}</Text>
                <Text style={styles.optDesc}>{t(o.descKey)}</Text>
              </View>
              {on ? <MaterialIcons name="check-circle" size={24} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </MealMindScreen>
  );
}
