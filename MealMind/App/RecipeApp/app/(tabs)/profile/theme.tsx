import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import {
  getThemePreference,
  setThemePreference,
  type ThemePreference,
} from '@/lib/app-preferences';
import { showSuccessToast } from '@/lib/mealmind-toast';

const OPTIONS: { id: ThemePreference; label: string; desc: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'light', label: 'Light', desc: 'Always use light appearance.', icon: 'light-mode' },
  { id: 'dark', label: 'Dark', desc: 'Always use dark appearance.', icon: 'dark-mode' },
  { id: 'system', label: 'System', desc: 'Match your device setting.', icon: 'brightness-auto' },
];

export default function ProfileThemeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<ThemePreference>('system');

  useEffect(() => {
    void getThemePreference().then(setCurrent);
  }, []);

  const pick = useCallback(
    async (id: ThemePreference) => {
      setCurrent(id);
      await setThemePreference(id);
      showSuccessToast('Theme updated');
    },
    [],
  );

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Theme</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.sub}>Choose how MealMind looks on this device.</Text>
        {OPTIONS.map((o) => {
          const on = current === o.id;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => void pick(o.id)}
              style={({ pressed }) => [
                styles.option,
                on && styles.optionOn,
                pressed && styles.pressed,
              ]}>
              <View style={[styles.iconWell, on && styles.iconWellOn]}>
                <MaterialIcons name={o.icon} size={26} color={on ? MealMindColors.onPrimary : MealMindColors.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.optTitle, on && styles.optTitleOn]}>{o.label}</Text>
                <Text style={styles.optDesc}>{o.desc}</Text>
              </View>
              {on ? <MaterialIcons name="check-circle" size={24} color={MealMindColors.primary} /> : null}
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
  body: { padding: 20, gap: 12 },
  sub: {
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    color: MealMindColors.onSurfaceVariant,
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: MealMindRadii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}66`,
    backgroundColor: MealMindColors.surfaceContainerLowest,
  },
  optionOn: {
    borderColor: MealMindColors.primary,
    borderWidth: 2,
    ...MealMindShadow.ambient,
  },
  iconWell: {
    width: 48,
    height: 48,
    borderRadius: MealMindRadii.md,
    backgroundColor: MealMindColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWellOn: { backgroundColor: MealMindColors.primary },
  optTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 17,
    color: MealMindColors.onSurface,
  },
  optTitleOn: { color: MealMindColors.primary },
  optDesc: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
    marginTop: 4,
  },
  pressed: { opacity: 0.9 },
});
