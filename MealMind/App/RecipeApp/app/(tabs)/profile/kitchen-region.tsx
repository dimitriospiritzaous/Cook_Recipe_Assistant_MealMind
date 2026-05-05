import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlowButton, MealMindScreen } from '@/components/mealmind';
import { KITCHEN_COMFORT_LABELS, SKILL_LABELS } from '@/constants/onboarding-options';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { getCountryPickerItems } from '@/lib/country-picker-data';
import type { KitchenComfort, SkillLevel, StoredProfile } from '@/lib/profile-storage';
import { getProfile, setProfile } from '@/lib/profile-storage';
import { showErrorToast, showSuccessToast } from '@/lib/mealmind-toast';
import { upsertMealMindProfile } from '@/lib/supabase-profile';

const COMFORT_IDS = Object.keys(KITCHEN_COMFORT_LABELS) as KitchenComfort[];
const SKILL_IDS = Object.keys(SKILL_LABELS) as SkillLevel[];

export default function ProfileKitchenRegionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const countryItems = getCountryPickerItems();
  const [base, setBase] = useState<StoredProfile | null>(null);
  const [countryCode, setCountryCode] = useState('WORLDWIDE');
  const [kitchenComfort, setKitchenComfort] = useState<KitchenComfort>('balanced');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');

  useEffect(() => {
    void getProfile().then((p) => {
      const next =
        p ??
        ({
          countryCode: 'WORLDWIDE',
          skillLevel: 'beginner',
          kitchenComfort: 'balanced',
          preferences: [],
          dislikes: [],
          vegetarianFocus: false,
          pescetarianFriendly: false,
          wellnessGoal: 'unsure',
          dietaryPreference: 'none',
          cuisines: [],
          allergies: [],
          avoidFoods: [],
          cookingExperience: 'home_cook',
          kitchenEquipment: [],
          cookingSchedule: 'flexible',
          flavorProfile: [],
          spicyLevel: 'medium',
          calorieFocus: 'no_preference',
        } satisfies StoredProfile);
      setBase(next);
      setCountryCode(next.countryCode);
      setKitchenComfort(next.kitchenComfort);
      setSkillLevel(next.skillLevel);
    });
  }, []);

  const save = useCallback(async () => {
    if (!base) return;
    try {
      const next: StoredProfile = { ...base, countryCode, kitchenComfort, skillLevel };
      await setProfile(next);
      const { ok, error } = await upsertMealMindProfile(next);
      if (!ok) throw new Error(error ?? 'Sync failed');
      showSuccessToast('Kitchen & region saved');
      router.back();
    } catch (e) {
      showErrorToast('Profile', e instanceof Error ? e.message : 'Could not save.');
    }
  }, [base, countryCode, kitchenComfort, skillLevel, router]);

  if (!base) {
    return (
      <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
        <View style={{ paddingTop: insets.top + 40, alignItems: 'center' }}>
          <Text style={{ color: MealMindColors.onSurfaceVariant }}>Loading…</Text>
        </View>
      </MealMindScreen>
    );
  }

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Kitchen & Region</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 120 }]}>
        <Text style={styles.label}>Country / region</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={countryCode} onValueChange={(v) => setCountryCode(String(v))}>
            {countryItems.map((row) => (
              <Picker.Item key={row.value} label={row.label} value={row.value} color={MealMindColors.onSurface} />
            ))}
          </Picker>
        </View>
        <Text style={styles.label}>Kitchen comfort</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={kitchenComfort}
            onValueChange={(v) => setKitchenComfort(v as KitchenComfort)}>
            {COMFORT_IDS.map((id) => (
              <Picker.Item key={id} label={KITCHEN_COMFORT_LABELS[id]} value={id} color={MealMindColors.onSurface} />
            ))}
          </Picker>
        </View>
        <Text style={styles.label}>Cooking skill</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={skillLevel} onValueChange={(v) => setSkillLevel(v as SkillLevel)}>
            {SKILL_IDS.map((id) => (
              <Picker.Item key={id} label={SKILL_LABELS[id]} value={id} color={MealMindColors.onSurface} />
            ))}
          </Picker>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + MealMindSpace.md }]}>
        <GlowButton label="Save changes" onPress={() => void save()} />
      </View>
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
  body: { padding: 20, gap: 8 },
  label: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: MealMindColors.outline,
    marginTop: 12,
    marginBottom: 4,
  },
  pickerWrap: {
    borderRadius: MealMindRadii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}66`,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    overflow: 'hidden',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: MealMindSpace.sm,
    backgroundColor: MealMindColors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${MealMindColors.outlineVariant}44`,
  },
  pressed: { opacity: 0.9 },
});
