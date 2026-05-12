import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace, mealMindAmbientShadow } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useI18n } from '@/contexts/i18n-context';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';
import type { StoredProfile } from '@/lib/profile-storage';
import { getProfile } from '@/lib/profile-storage';

function TasteRow({
  kicker,
  value,
  icon,
  onPress,
  colors,
}: {
  kicker: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  colors: MealMindPalette;
}) {
  const styles = useMemo(() => createTasteStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.rowCard, pressed && styles.pressed]}>
      <View style={styles.rowLeft}>
        <View style={styles.iconBox}>
          <MaterialIcons name={icon} size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={styles.value} numberOfLines={2}>
            {value}
          </Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={colors.outlineVariant} />
    </Pressable>
  );
}

export default function ProfileTasteProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const colors = useMealMindColors();
  const styles = useMemo(() => createTasteStyles(colors), [colors]);
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
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('taste.title')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialIcons name="restaurant-menu" size={40} color={colors.onSecondaryContainer} />
          </View>
          <Text style={styles.heroTitle}>{t('taste.heroTitle')}</Text>
          <Text style={styles.heroSub}>{t('taste.heroSub')}</Text>
        </View>

        <View style={{ gap: 12 }}>
          <TasteRow
            kicker={t('taste.wellnessGoal')}
            value={WELLNESS_GOAL_LABELS[profile.wellnessGoal]}
            icon="track-changes"
            onPress={goWizard}
            colors={colors}
          />
          <TasteRow
            kicker={t('taste.diet')}
            value={DIETARY_PREFERENCE_LABELS[profile.dietaryPreference]}
            icon="eco"
            onPress={goWizard}
            colors={colors}
          />
          <Pressable onPress={goWizard} style={({ pressed }) => [styles.tagCard, pressed && styles.pressed]}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <MaterialIcons name="public" size={22} color={colors.primary} />
              </View>
              <Text style={styles.kicker}>{t('taste.cuisines')}</Text>
            </View>
            <View style={styles.tagWrap}>
              {profile.cuisines.length === 0 ? (
                <Text style={styles.emptyTags}>{t('taste.addCuisines')}</Text>
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
            kicker={t('taste.cookingExperience')}
            value={COOKING_EXPERIENCE_LABELS[profile.cookingExperience]}
            icon="school"
            onPress={goWizard}
            colors={colors}
          />
          <TasteRow
            kicker={t('taste.spiceLevel')}
            value={spicyLevelLabel(profile.spicyLevel)}
            icon="whatshot"
            onPress={goWizard}
            colors={colors}
          />
          <TasteRow
            kicker={t('taste.calories')}
            value={calorieFocusLabel(profile.calorieFocus)}
            icon="monitor-heart"
            onPress={goWizard}
            colors={colors}
          />
        </View>

        <Text style={styles.note}>{t('taste.note')}</Text>
      </ScrollView>
    </MealMindScreen>
  );
}

function createTasteStyles(colors: MealMindPalette) {
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
    scroll: { padding: 20, maxWidth: 672, width: '100%', alignSelf: 'center' },
    hero: { alignItems: 'center', marginBottom: 28 },
    heroIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.secondaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      ...mealMindAmbientShadow(colors),
    },
    heroTitle: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 26,
      color: colors.onSurface,
      marginBottom: 8,
      textAlign: 'center',
    },
    heroSub: {
      fontFamily: MealMindFonts.body,
      fontSize: 15,
      lineHeight: 22,
      color: colors.onSurfaceVariant,
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
      borderColor: `${colors.outlineVariant}44`,
      backgroundColor: colors.surfaceContainerLowest,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: MealMindRadii.md,
      backgroundColor: colors.surfaceContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    kicker: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 11,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: colors.onSurfaceVariant,
    },
    value: { fontFamily: MealMindFonts.bodyMedium, fontSize: 16, color: colors.onSurface, marginTop: 2 },
    tagCard: {
      padding: 16,
      borderRadius: MealMindRadii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.outlineVariant}44`,
      backgroundColor: colors.surfaceContainerLowest,
      gap: 12,
    },
    tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: 54 },
    tag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: MealMindRadii.full,
      backgroundColor: colors.secondaryContainer,
    },
    tagText: { fontFamily: MealMindFonts.labelSemibold, fontSize: 13, color: colors.onSecondaryContainer },
    emptyTags: { fontFamily: MealMindFonts.body, fontSize: 14, color: colors.outline },
    note: {
      marginTop: 20,
      fontFamily: MealMindFonts.body,
      fontSize: 13,
      color: colors.outline,
      textAlign: 'center',
    },
    pressed: { opacity: 0.92 },
  });
}
