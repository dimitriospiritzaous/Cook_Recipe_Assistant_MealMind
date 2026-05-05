import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindScreen } from '@/components/mealmind';
import {
  COOKING_EXPERIENCE_LABELS,
  DIETARY_PREFERENCE_LABELS,
  calorieFocusLabel,
  spicyLevelLabel,
  WELLNESS_GOAL_LABELS,
} from '@/constants/profile-display-labels';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import type { StoredProfile } from '@/lib/profile-storage';
import { getProfile } from '@/lib/profile-storage';

function TasteRow({
  kicker,
  value,
  icon,
  onPress,
}: {
  kicker: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.rowCard, pressed && styles.pressed]}>
      <View style={styles.rowLeft}>
        <View style={styles.iconBox}>
          <MaterialIcons name={icon} size={22} color={MealMindColors.primary} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={styles.value} numberOfLines={2}>
            {value}
          </Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={MealMindColors.outlineVariant} />
    </Pressable>
  );
}

export default function ProfileTasteProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [p, setP] = useState<StoredProfile | null>(null);

  const load = useCallback(() => {
    void getProfile().then(setP);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const goWizard = useCallback(() => {
    router.push('/intro');
  }, [router]);

  const profile =
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

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Taste Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialIcons name="restaurant-menu" size={40} color={MealMindColors.onSecondaryContainer} />
          </View>
          <Text style={styles.heroTitle}>Refine Your Palate</Text>
          <Text style={styles.heroSub}>
            Update your preferences so MealMind can match recipes to how you cook and eat. Tap any row to open the
            personalization wizard.
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <TasteRow
            kicker="Wellness Goal"
            value={WELLNESS_GOAL_LABELS[profile.wellnessGoal]}
            icon="track-changes"
            onPress={goWizard}
          />
          <TasteRow
            kicker="Diet"
            value={DIETARY_PREFERENCE_LABELS[profile.dietaryPreference]}
            icon="eco"
            onPress={goWizard}
          />
          <Pressable onPress={goWizard} style={({ pressed }) => [styles.tagCard, pressed && styles.pressed]}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <MaterialIcons name="public" size={22} color={MealMindColors.primary} />
              </View>
              <Text style={styles.kicker}>Cuisines</Text>
            </View>
            <View style={styles.tagWrap}>
              {profile.cuisines.length === 0 ? (
                <Text style={styles.emptyTags}>Tap to add cuisines</Text>
              ) : (
                profile.cuisines.map((c) => (
                  <View key={c} style={styles.tag}>
                    <Text style={styles.tagText}>{c}</Text>
                  </View>
                ))
              )}
            </View>
          </Pressable>
          <TasteRow
            kicker="Cooking experience"
            value={COOKING_EXPERIENCE_LABELS[profile.cookingExperience]}
            icon="school"
            onPress={goWizard}
          />
          <TasteRow
            kicker="Spice level"
            value={spicyLevelLabel(profile.spicyLevel)}
            icon="whatshot"
            onPress={goWizard}
          />
          <TasteRow
            kicker="Calories"
            value={calorieFocusLabel(profile.calorieFocus)}
            icon="monitor-heart"
            onPress={goWizard}
          />
        </View>

        <Text style={styles.note}>Full tag editing for foods to avoid and dislikes is in the wizard.</Text>
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
  scroll: { padding: 20, maxWidth: 672, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', marginBottom: 28 },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MealMindColors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...MealMindShadow.ambient,
  },
  heroTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 26,
    color: MealMindColors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: MealMindColors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 400,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: MealMindRadii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}44`,
    backgroundColor: MealMindColors.surfaceContainerLowest,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: MealMindRadii.md,
    backgroundColor: MealMindColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: MealMindColors.onSurfaceVariant,
  },
  value: { fontFamily: MealMindFonts.bodyMedium, fontSize: 16, color: MealMindColors.onSurface, marginTop: 2 },
  tagCard: {
    padding: 16,
    borderRadius: MealMindRadii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}44`,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    gap: 12,
  },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: 54 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: MealMindRadii.full,
    backgroundColor: MealMindColors.secondaryContainer,
  },
  tagText: { fontFamily: MealMindFonts.labelSemibold, fontSize: 13, color: MealMindColors.onSecondaryContainer },
  emptyTags: { fontFamily: MealMindFonts.body, fontSize: 14, color: MealMindColors.outline },
  note: {
    marginTop: 20,
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    color: MealMindColors.outline,
    textAlign: 'center',
  },
  pressed: { opacity: 0.92 },
});
