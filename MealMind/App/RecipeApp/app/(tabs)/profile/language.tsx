import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { getAppLanguage, languageLabel, setAppLanguage } from '@/lib/app-preferences';
import { showSuccessToast } from '@/lib/mealmind-toast';

const LOCALES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
];

export default function ProfileLanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('en');

  useEffect(() => {
    void getAppLanguage().then(setCode);
  }, []);

  const pick = useCallback(async (c: string) => {
    setCode(c);
    await setAppLanguage(c);
    showSuccessToast(`Language: ${languageLabel(c)}`);
  }, []);

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.sub}>Translations apply when available. English is always complete.</Text>
        {LOCALES.map((l) => {
          const on = code === l.code;
          return (
            <Pressable
              key={l.code}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => void pick(l.code)}
              style={({ pressed }) => [styles.row, on && styles.rowOn, pressed && styles.pressed]}>
              <Text style={[styles.rowLabel, on && styles.rowLabelOn]}>{l.label}</Text>
              <Text style={styles.rowMeta}>{l.code.toUpperCase()}</Text>
              {on ? <MaterialIcons name="check" size={22} color={MealMindColors.primary} /> : null}
            </Pressable>
          );
        })}
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
  body: { padding: 20, gap: 10 },
  sub: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: MealMindRadii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}66`,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    gap: 12,
  },
  rowOn: { borderColor: MealMindColors.primary, borderWidth: 2 },
  rowLabel: { flex: 1, fontFamily: MealMindFonts.bodyMedium, fontSize: 17, color: MealMindColors.onSurface },
  rowLabelOn: { color: MealMindColors.primary },
  rowMeta: { fontFamily: MealMindFonts.labelSemibold, fontSize: 12, color: MealMindColors.outline },
  pressed: { opacity: 0.9 },
});
