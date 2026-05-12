import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlowButton, MealMindFlowHeader, MealMindScreen } from '@/components/mealmind';
import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindRadii, mealMindAmbientShadow, mealMindGlowCtaShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useI18n } from '@/contexts/i18n-context';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';
import type { CookingExperience, DietaryPreference, StoredProfile, WellnessGoal } from '@/lib/profile-storage';
import { resetAppForDev } from '@/lib/dev-reset';
import {
  getProfile,
  setGetStartedSeen,
  setIntroSeen,
  setOnboardingComplete,
  setProfile,
} from '@/lib/profile-storage';
import { markIntroCompleteInSupabaseUserMetadata } from '@/lib/supabase-auth';
import { upsertMealMindProfile } from '@/lib/supabase-profile';

type WizardStepId =
  | 'goal'
  | 'diet'
  | 'cuisines'
  | 'avoidFoods'
  | 'dislikes'
  | 'cookingExperience'
  | 'schedule'
  | 'flavor'
  | 'spicy'
  | 'calories';

const STEPS: { id: WizardStepId; titleKey: string; subtitleKey: string }[] = [
  { id: 'goal', titleKey: 'intro.step.goal.title', subtitleKey: 'intro.step.goal.sub' },
  { id: 'diet', titleKey: 'intro.step.diet.title', subtitleKey: 'intro.step.diet.sub' },
  { id: 'cuisines', titleKey: 'intro.step.cuisines.title', subtitleKey: 'intro.step.cuisines.sub' },
  { id: 'avoidFoods', titleKey: 'intro.step.avoidFoods.title', subtitleKey: 'intro.step.avoidFoods.sub' },
  { id: 'dislikes', titleKey: 'intro.step.dislikes.title', subtitleKey: 'intro.step.dislikes.sub' },
  { id: 'cookingExperience', titleKey: 'intro.step.cookingExperience.title', subtitleKey: 'intro.step.cookingExperience.sub' },
  { id: 'schedule', titleKey: 'intro.step.schedule.title', subtitleKey: 'intro.step.schedule.sub' },
  { id: 'flavor', titleKey: 'intro.step.flavor.title', subtitleKey: 'intro.step.flavor.sub' },
  { id: 'spicy', titleKey: 'intro.step.spicy.title', subtitleKey: 'intro.step.spicy.sub' },
  { id: 'calories', titleKey: 'intro.step.calories.title', subtitleKey: 'intro.step.calories.sub' },
];

const FINALIZE_MS = 1800;
const FINALIZE_LINES: { labelKey: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { labelKey: 'intro.finalize.line1', icon: 'restaurant-menu' },
  { labelKey: 'intro.finalize.line2', icon: 'tune' },
  { labelKey: 'intro.finalize.line3', icon: 'auto-awesome' },
];

const FORM_MAX_WIDTH = 576;

const GOALS: { id: WellnessGoal; labelKey: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'eat_healthier', labelKey: 'intro.goal.eat_healthier', icon: 'spa' },
  { id: 'save_time', labelKey: 'intro.goal.save_time', icon: 'timer' },
  { id: 'lose_weight', labelKey: 'intro.goal.lose_weight', icon: 'monitor-weight' },
  { id: 'gain_muscle', labelKey: 'intro.goal.gain_muscle', icon: 'fitness-center' },
  { id: 'maintain_weight', labelKey: 'intro.goal.maintain_weight', icon: 'balance' },
  { id: 'reduce_waste', labelKey: 'intro.goal.reduce_waste', icon: 'recycling' },
  { id: 'budget', labelKey: 'intro.goal.budget', icon: 'payments' },
  { id: 'unsure', labelKey: 'intro.goal.unsure', icon: 'help-outline' },
];

const DIETS: { id: DietaryPreference; labelKey: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'none', labelKey: 'intro.diet.none', icon: 'restaurant' },
  { id: 'vegetarian', labelKey: 'intro.diet.vegetarian', icon: 'eco' },
  { id: 'vegan', labelKey: 'intro.diet.vegan', icon: 'nature' },
  { id: 'keto', labelKey: 'intro.diet.keto', icon: 'bolt' },
  { id: 'low_carb', labelKey: 'intro.diet.low_carb', icon: 'keyboard-double-arrow-down' },
  { id: 'high_protein', labelKey: 'intro.diet.high_protein', icon: 'fitness-center' },
  { id: 'gluten_free', labelKey: 'intro.diet.gluten_free', icon: 'no-meals' },
  { id: 'dairy_free', labelKey: 'intro.diet.dairy_free', icon: 'opacity' },
  { id: 'other', labelKey: 'intro.diet.other', icon: 'more-horiz' },
];

const CUISINES: { id: string; labelKey: string }[] = [
  { id: 'American', labelKey: 'intro.cuisine.american' },
  { id: 'Italian', labelKey: 'intro.cuisine.italian' },
  { id: 'Mexican', labelKey: 'intro.cuisine.mexican' },
  { id: 'Chinese', labelKey: 'intro.cuisine.chinese' },
  { id: 'Japanese', labelKey: 'intro.cuisine.japanese' },
  { id: 'Korean', labelKey: 'intro.cuisine.korean' },
  { id: 'Thai', labelKey: 'intro.cuisine.thai' },
  { id: 'Indian', labelKey: 'intro.cuisine.indian' },
  { id: 'Mediterranean', labelKey: 'intro.cuisine.mediterranean' },
  { id: 'French', labelKey: 'intro.cuisine.french' },
  { id: 'Middle Eastern', labelKey: 'intro.cuisine.middleEastern' },
  { id: 'Vietnamese', labelKey: 'intro.cuisine.vietnamese' },
];

const FLAVORS: { id: string; labelKey: string }[] = [
  { id: 'savory', labelKey: 'intro.flavor.savory' },
  { id: 'healthy', labelKey: 'intro.flavor.healthy' },
  { id: 'sweet', labelKey: 'intro.flavor.sweet' },
  { id: 'tangy', labelKey: 'intro.flavor.tangy' },
  { id: 'mild', labelKey: 'intro.flavor.mild' },
  { id: 'spicy', labelKey: 'intro.flavor.spicy' },
];

type IntroDraft = Pick<
  StoredProfile,
  | 'wellnessGoal'
  | 'dietaryPreference'
  | 'cuisines'
  | 'allergies'
  | 'avoidFoods'
  | 'dislikes'
  | 'cookingExperience'
  | 'kitchenEquipment'
  | 'cookingSchedule'
  | 'flavorProfile'
  | 'spicyLevel'
  | 'calorieFocus'
>;

function normalizeTag(raw: string): string {
  return raw.trim().toLowerCase();
}

function defaultDraft(): IntroDraft {
  return {
    wellnessGoal: 'unsure',
    dietaryPreference: 'none',
    cuisines: [],
    allergies: [],
    avoidFoods: [],
    dislikes: [],
    cookingExperience: 'home_cook',
    kitchenEquipment: [],
    cookingSchedule: 'flexible',
    flavorProfile: [],
    spicyLevel: 'medium',
    calorieFocus: 'no_preference',
  };
}

/* ── Style factories ──────────────────────────────────────────────── */

function createIntroStyles(colors: MealMindPalette) {
  const outlineBorder = `${colors.outlineVariant}26`;
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.surface, overflow: 'hidden' },
    decor: { ...StyleSheet.absoluteFillObject },
    blobPrimary: {
      position: 'absolute',
      top: -96,
      right: -96,
      width: 256,
      height: 256,
      borderRadius: 128,
      backgroundColor: `${colors.primaryContainer}1A`,
    },
    blobSecondary: {
      position: 'absolute',
      top: '45%',
      left: -128,
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: `${colors.secondaryContainer}1A`,
    },
    column: { flex: 1, zIndex: 1 },
    hydrate: { flex: 1 },
    fillFlex: { flex: 1 },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: MealMindSpace.lg,
      paddingVertical: MealMindSpace.md,
      backgroundColor: `${colors.surface}CC`,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: `${colors.outlineVariant}26`,
    },
    iconBtn: { padding: 4 },
    iconBtnSpacer: { padding: 4, width: 28, height: 28 },
    topTitle: {
      flex: 1,
      textAlign: 'center',
      fontFamily: MealMindFonts.headlineExtraBold,
      fontSize: 18,
      letterSpacing: headlineTracking,
      color: colors.primary,
    },
    progressWrap: {
      paddingHorizontal: MealMindSpace.lg,
      paddingTop: MealMindSpace.sm,
      paddingBottom: MealMindSpace.lg,
    },
    progressMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
    stepLabel: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.secondary,
    },
    stepPct: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.outline,
    },
    track: {
      height: 6,
      borderRadius: 999,
      backgroundColor: colors.surfaceContainerHigh,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: colors.primary,
    },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: MealMindSpace.lg, paddingTop: MealMindSpace.lg, flexGrow: 1 },
    inner: { maxWidth: FORM_MAX_WIDTH, width: '100%', alignSelf: 'center' },
    hero: { marginBottom: 28, alignItems: 'center' },
    heroTitle: {
      fontFamily: MealMindFonts.headlineExtraBold,
      fontSize: 30,
      letterSpacing: -0.4,
      color: colors.onSurface,
      textAlign: 'center',
      marginBottom: MealMindSpace.md,
      paddingHorizontal: 8,
    },
    heroSub: {
      fontFamily: MealMindFonts.body,
      fontSize: 15,
      lineHeight: 22,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      maxWidth: 420,
    },
    stack: { gap: MealMindSpace.md },
    pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
    choiceCard: {
      minHeight: 60,
      borderRadius: MealMindRadii.xl,
      paddingVertical: MealMindSpace.md,
      paddingHorizontal: 18,
      borderWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    choiceCardOff: { backgroundColor: colors.surfaceContainerLow, borderColor: 'transparent' },
    choiceCardOn: { backgroundColor: colors.primary, borderColor: 'transparent' },
    choiceCardLeft: { flexDirection: 'row', alignItems: 'center', gap: MealMindSpace.md, flex: 1, minWidth: 0 },
    choiceCardLabel: {
      flex: 1,
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 17,
      color: colors.onSurface,
    },
    choiceCardLabelOn: { color: colors.onPrimary },
    ghostAction: { alignSelf: 'center', paddingVertical: MealMindSpace.sm },
    ghostActionLabel: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.outline,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: MealMindSpace.md, justifyContent: 'space-between' },
    gridCard: {
      width: '48%',
      minHeight: 74,
      borderRadius: MealMindRadii.lg,
      padding: MealMindSpace.lg,
      backgroundColor: colors.surfaceContainerLow,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: StyleSheet.hairlineWidth,
    },
    gridCardOff: { borderColor: `${colors.outlineVariant}1A` },
    gridCardOn: { backgroundColor: colors.primaryFixed, borderColor: 'transparent' },
    gridCardLabel: {
      flex: 1,
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 16,
      color: colors.onSurface,
      marginRight: MealMindSpace.sm,
    },
    gridCardLabelOn: { color: colors.onPrimaryContainer },
    cuisineList: {
      gap: MealMindSpace.sm,
      width: '100%',
      alignItems: 'center',
      marginTop: MealMindSpace.md,
    },
    cuisineButton: {
      width: '100%',
      maxWidth: FORM_MAX_WIDTH,
      minHeight: 62,
      paddingVertical: MealMindSpace.md,
      paddingHorizontal: MealMindSpace.lg,
      borderRadius: MealMindRadii.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'transparent',
      backgroundColor: colors.surfaceContainerLow,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cuisineButtonOff: {
      borderColor: `${colors.outlineVariant}1A`,
    },
    cuisineButtonOn: {
      backgroundColor: colors.primaryFixed,
      borderColor: 'transparent',
    },
    cuisineLabel: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 17,
      color: colors.onSurface,
    },
    cuisineLabelOn: {
      color: colors.onPrimaryContainer,
    },
    pillsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: MealMindSpace.md,
    },
    pill: {
      paddingHorizontal: MealMindSpace.lg,
      paddingVertical: MealMindSpace.sm + 2,
      borderRadius: MealMindRadii.full,
      borderWidth: StyleSheet.hairlineWidth,
    },
    pillCap: { minWidth: 104, alignItems: 'center' },
    pillOff: { backgroundColor: colors.surfaceContainerLowest, borderColor: outlineBorder },
    pillOn: { backgroundColor: colors.primaryContainer, borderColor: 'transparent' },
    pillText: {
      fontFamily: MealMindFonts.bodyMedium,
      fontSize: 15,
      color: colors.onSurface,
      textTransform: 'capitalize',
      textAlign: 'center',
    },
    pillTextOn: { fontFamily: MealMindFonts.labelSemibold, color: colors.onPrimaryContainer },
    tagCard: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: MealMindRadii.lg,
      padding: MealMindSpace.lg,
    },
    tagLead: {
      fontFamily: MealMindFonts.bodyMedium,
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginBottom: MealMindSpace.md,
    },
    tagWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: MealMindSpace.sm,
      alignItems: 'center',
    },
    tagPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingLeft: MealMindSpace.md,
      paddingRight: MealMindSpace.sm,
      paddingVertical: 8,
      borderRadius: MealMindRadii.full,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: outlineBorder,
    },
    tagText: { fontFamily: MealMindFonts.body, fontSize: 14, color: colors.onSurface },
    tagRemove: { padding: 2 },
    addPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: MealMindSpace.md,
      paddingVertical: 8,
      borderRadius: MealMindRadii.full,
      backgroundColor: `${colors.outline}1A`,
    },
    addPillText: { fontFamily: MealMindFonts.labelSemibold, fontSize: 14, color: colors.onSurface },
    addPillTextDisabled: { opacity: 0.45 },
    tagField: {
      marginTop: MealMindSpace.md,
      fontFamily: MealMindFonts.body,
      fontSize: 15,
      color: colors.onSurface,
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: MealMindRadii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: outlineBorder,
      paddingHorizontal: MealMindSpace.md,
      paddingVertical: MealMindSpace.sm,
    },
    stickyBottom: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: MealMindSpace.lg,
      paddingTop: MealMindSpace.md,
      backgroundColor: `${colors.surface}F2`,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: `${colors.outlineVariant}1A`,
    },
    stickyInner: { maxWidth: FORM_MAX_WIDTH, width: '100%', alignSelf: 'center', gap: MealMindSpace.md },
    footerCaption: {
      fontFamily: MealMindFonts.body,
      fontSize: 13,
      lineHeight: 18,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    devReset: {
      marginHorizontal: MealMindSpace.lg,
      marginTop: MealMindSpace.sm,
      alignSelf: 'flex-start',
      paddingHorizontal: MealMindSpace.md,
      paddingVertical: 8,
      borderRadius: MealMindRadii.full,
      backgroundColor: `${colors.outlineVariant}14`,
    },
    devResetText: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 13,
      color: colors.primary,
      letterSpacing: headlineTracking,
    },
  });
}

function createFinalizeStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: MealMindSpace.lg,
    },
    column: {
      maxWidth: 420,
      width: '100%',
      alignItems: 'center',
      gap: MealMindSpace.md,
    },
    iconWell: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: MealMindSpace.md,
      ...mealMindGlowCtaShadow(colors.primary),
    },
    title: {
      fontFamily: MealMindFonts.headlineExtraBold,
      fontSize: 26,
      textAlign: 'center',
      color: colors.onSurface,
    },
    sub: {
      fontFamily: MealMindFonts.body,
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      color: colors.onSurfaceVariant,
      marginBottom: MealMindSpace.md,
    },
    track: {
      width: '100%',
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.surfaceContainerHigh,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    pct: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 13,
      letterSpacing: 1.2,
      color: colors.onSurfaceVariant,
    },
    steps: {
      marginTop: MealMindSpace.lg,
      width: '100%',
      gap: MealMindSpace.sm,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: MealMindSpace.md,
    },
    stepText: {
      fontFamily: MealMindFonts.bodyMedium,
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    stepTextOn: {
      color: colors.onSurface,
    },
  });
}

type IntroStyleSheet = ReturnType<typeof createIntroStyles>;

/* ── Sub-components ───────────────────────────────────────────────── */

function TagPill({
  label,
  onRemove,
  colors,
  styles,
}: {
  label: string;
  onRemove: () => void;
  colors: MealMindPalette;
  styles: IntroStyleSheet;
}) {
  return (
    <View style={styles.tagPill}>
      <Text style={styles.tagText}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${label}`} hitSlop={8} onPress={onRemove} style={styles.tagRemove}>
        <MaterialIcons name="close" size={16} color={colors.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}

function ChoiceCard({
  label,
  iconName,
  selected,
  onPress,
  colors,
  styles,
}: {
  label: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  selected: boolean;
  onPress: () => void;
  colors: MealMindPalette;
  styles: IntroStyleSheet;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceCard,
        selected ? styles.choiceCardOn : styles.choiceCardOff,
        selected && mealMindAmbientShadow(colors),
        pressed && styles.pressed,
      ]}>
      <View style={styles.choiceCardLeft}>
        <MaterialIcons
          name={iconName}
          size={22}
          color={selected ? colors.onPrimary : colors.outline}
        />
        <Text style={[styles.choiceCardLabel, selected && styles.choiceCardLabelOn]}>{label}</Text>
      </View>
      <MaterialIcons
        name={selected ? 'check-circle' : 'radio-button-unchecked'}
        size={22}
        color={selected ? colors.onPrimary : colors.outlineVariant}
      />
    </Pressable>
  );
}

/* ── Main screen ──────────────────────────────────────────────────── */

export default function IntroWizardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const colors = useMealMindColors();
  const styles = useMemo(() => createIntroStyles(colors), [colors]);
  const [stepIdx, setStepIdx] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [draft, setDraft] = useState<IntroDraft>(() => defaultDraft());

  useEffect(() => {
    void getProfile().then((p) => {
      if (p != null) {
        setDraft({
          wellnessGoal: p.wellnessGoal,
          dietaryPreference: p.dietaryPreference,
          cuisines: p.cuisines,
          allergies: p.allergies,
          avoidFoods: p.avoidFoods,
          dislikes: p.dislikes,
          cookingExperience: p.cookingExperience,
          kitchenEquipment: p.kitchenEquipment,
          cookingSchedule: p.cookingSchedule,
          flavorProfile: p.flavorProfile,
          spicyLevel: p.spicyLevel,
          calorieFocus: p.calorieFocus,
        });
      }
      setHydrated(true);
    });
  }, []);

  const step = STEPS[stepIdx]!;
  const progress = useMemo(() => (stepIdx + 1) / STEPS.length, [stepIdx]);

  const goNext = useCallback(async () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((i) => i + 1);
      return;
    }

    setFinalizing(true);

    const prev = await getProfile();
    const merged: StoredProfile = {
      countryCode: prev?.countryCode ?? 'WORLDWIDE',
      skillLevel: prev?.skillLevel ?? 'beginner',
      kitchenComfort: prev?.kitchenComfort ?? 'balanced',
      preferences: prev?.preferences ?? [],
      dislikes: draft.dislikes,
      vegetarianFocus: prev?.vegetarianFocus ?? false,
      pescetarianFriendly: prev?.pescetarianFriendly ?? false,
      wellnessGoal: draft.wellnessGoal,
      dietaryPreference: draft.dietaryPreference,
      cuisines: draft.cuisines,
      allergies: draft.allergies,
      avoidFoods: draft.avoidFoods,
      cookingExperience: draft.cookingExperience,
      kitchenEquipment: draft.kitchenEquipment,
      cookingSchedule: draft.cookingSchedule,
      flavorProfile: draft.flavorProfile,
      spicyLevel: draft.spicyLevel,
      calorieFocus: draft.calorieFocus,
      introWizardComplete: true,
      flowOnboardingDone: true,
    };
    const started = Date.now();
    await setProfile(merged);
    await upsertMealMindProfile(merged);
    await setIntroSeen();
    await setGetStartedSeen();
    await setOnboardingComplete();
    await markIntroCompleteInSupabaseUserMetadata();
    const waited = Date.now() - started;
    const remaining = Math.max(0, FINALIZE_MS - waited);
    await new Promise<void>((resolve) => setTimeout(resolve, remaining));
    router.replace('/');
  }, [draft, router, stepIdx]);

  const skipAll = useCallback(async () => {
    await setIntroSeen();
    await setGetStartedSeen();
    await setOnboardingComplete();
    await markIntroCompleteInSupabaseUserMetadata();
    router.replace('/');
  }, [router]);

  const goBack = useCallback(() => {
    if (stepIdx === 0) {
      void skipAll();
      return;
    }
    setStepIdx((i) => Math.max(0, i - 1));
  }, [skipAll, stepIdx]);

  const resetDev = useCallback(async () => {
    await resetAppForDev();
    setDraft(defaultDraft());
    setStepIdx(0);
  }, []);

  const setTagList = useCallback((key: 'avoidFoods' | 'dislikes', next: string[]) => {
    setDraft((d) => ({ ...d, [key]: next }));
  }, []);

  const toggleListValue = useCallback((key: 'cuisines' | 'flavorProfile', value: string) => {
    setDraft((d) => {
      const prev = d[key];
      return prev.includes(value) ? { ...d, [key]: prev.filter((v) => v !== value) } : { ...d, [key]: [...prev, value] };
    });
  }, []);

  const stickyBottomPad = insets.bottom + MealMindSpace.lg;

  if (!hydrated) {
    return (
      <MealMindScreen scroll={false} showFooter={false}>
        <MealMindFlowHeader title={t('intro.header')} showBottomDivider />
        <View style={styles.hydrate} />
      </MealMindScreen>
    );
  }

  if (finalizing) {
    return <FinalizingScreen />;
  }

  return (
    <MealMindScreen scroll={false} showFooter={false} contentBottomInset={0}>
      <View style={styles.root}>
        <View style={styles.decor} pointerEvents="none">
          <View style={styles.blobPrimary} />
          <View style={styles.blobSecondary} />
        </View>

        <View style={styles.column}>
          <View style={styles.topBar}>
            {stepIdx === 0 ? (
              <View style={styles.iconBtnSpacer} />
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={12}
                onPress={goBack}
                style={styles.iconBtn}>
                <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
              </Pressable>
            )}
            <Text style={styles.topTitle} numberOfLines={1}>
              {t('intro.personalize')}
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Skip onboarding" hitSlop={12} onPress={() => void skipAll()} style={styles.iconBtn}>
              <MaterialIcons name="close" size={24} color={colors.primary} />
            </Pressable>
          </View>

          {__DEV__ ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Reset onboarding (dev)" onPress={() => void resetDev()} style={styles.devReset}>
              <Text style={styles.devResetText}>Reset onboarding (dev)</Text>
            </Pressable>
          ) : null}

          <View style={styles.progressWrap}>
            <View style={styles.progressMeta}>
              <Text style={styles.stepLabel}>
                {t('intro.stepOf', { current: stepIdx + 1, total: STEPS.length })}
              </Text>
              <Text style={styles.stepPct}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(2, Math.round(progress * 100))}%` }]} />
            </View>
          </View>

          <KeyboardAvoidingView
            style={styles.fillFlex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: stickyBottomPad + 140 }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.inner}>
                <View style={styles.hero}>
                  <Text style={styles.heroTitle}>{t(step.titleKey)}</Text>
                  <Text style={styles.heroSub}>{t(step.subtitleKey)}</Text>
                </View>

                {step.id === 'goal' ? (
                  <View style={styles.stack}>
                    {GOALS.map((g) => (
                      <ChoiceCard
                        key={g.id}
                        label={t(g.labelKey)}
                        iconName={g.icon}
                        selected={draft.wellnessGoal === g.id}
                        onPress={() => setDraft((d) => ({ ...d, wellnessGoal: g.id }))}
                        colors={colors}
                        styles={styles}
                      />
                    ))}
                    <Pressable onPress={() => void skipAll()} style={styles.ghostAction}>
                      <Text style={styles.ghostActionLabel}>{t('intro.skipLater')}</Text>
                    </Pressable>
                  </View>
                ) : null}

                {step.id === 'diet' ? (
                  <View style={styles.stack}>
                    {DIETS.map((d) => (
                      <ChoiceCard
                        key={d.id}
                        label={t(d.labelKey)}
                        iconName={d.icon}
                        selected={draft.dietaryPreference === d.id}
                        onPress={() => setDraft((x) => ({ ...x, dietaryPreference: d.id }))}
                        colors={colors}
                        styles={styles}
                      />
                    ))}
                  </View>
                ) : null}

                {step.id === 'cuisines' ? (
                  <View style={styles.cuisineList}>
                    {CUISINES.map((c) => {
                      const on = draft.cuisines.includes(c.id);
                      return (
                        <Pressable
                          key={c.id}
                          accessibilityRole="button"
                          accessibilityState={{ selected: on }}
                          onPress={() => toggleListValue('cuisines', c.id)}
                          style={({ pressed }) => [
                            styles.cuisineButton,
                            on ? styles.cuisineButtonOn : styles.cuisineButtonOff,
                            on && mealMindAmbientShadow(colors),
                            pressed && styles.pressed,
                          ]}>
                          <Text style={[styles.cuisineLabel, on && styles.cuisineLabelOn]}>{t(c.labelKey)}</Text>
                          {on ? (
                            <MaterialIcons name="check-circle" size={20} color={colors.onPrimaryContainer} />
                          ) : (
                            <MaterialIcons name="add" size={20} color={colors.outline} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}

                {step.id === 'avoidFoods' ? (
                  <TagEditor
                    placeholder={t('intro.avoidPlaceholder')}
                    tags={draft.avoidFoods}
                    onChange={(next) => setTagList('avoidFoods', next)}
                    colors={colors}
                    styles={styles}
                    t={t}
                  />
                ) : null}

                {step.id === 'dislikes' ? (
                  <TagEditor
                    placeholder={t('intro.dislikePlaceholder')}
                    tags={draft.dislikes}
                    onChange={(next) => setTagList('dislikes', next)}
                    colors={colors}
                    styles={styles}
                    t={t}
                  />
                ) : null}

                {step.id === 'cookingExperience' ? (
                  <View style={styles.stack}>
                    <ChoiceCard
                      label={t('intro.exp.new')}
                      iconName="emoji-people"
                      selected={draft.cookingExperience === 'new'}
                      onPress={() => setDraft((d) => ({ ...d, cookingExperience: 'new' as CookingExperience }))}
                      colors={colors}
                      styles={styles}
                    />
                    <ChoiceCard
                      label={t('intro.exp.home')}
                      iconName="home"
                      selected={draft.cookingExperience === 'home_cook'}
                      onPress={() => setDraft((d) => ({ ...d, cookingExperience: 'home_cook' as CookingExperience }))}
                      colors={colors}
                      styles={styles}
                    />
                    <ChoiceCard
                      label={t('intro.exp.confident')}
                      iconName="local-fire-department"
                      selected={draft.cookingExperience === 'confident'}
                      onPress={() => setDraft((d) => ({ ...d, cookingExperience: 'confident' as CookingExperience }))}
                      colors={colors}
                      styles={styles}
                    />
                    <ChoiceCard
                      label={t('intro.exp.pro')}
                      iconName="stars"
                      selected={draft.cookingExperience === 'pro'}
                      onPress={() => setDraft((d) => ({ ...d, cookingExperience: 'pro' as CookingExperience }))}
                      colors={colors}
                      styles={styles}
                    />
                  </View>
                ) : null}

                {step.id === 'schedule' ? (
                  <View style={styles.stack}>
                    <ChoiceCard
                      label={t('intro.sched.weeknights')}
                      iconName="nights-stay"
                      selected={draft.cookingSchedule === 'weeknights'}
                      onPress={() => setDraft((d) => ({ ...d, cookingSchedule: 'weeknights' }))}
                      colors={colors}
                      styles={styles}
                    />
                    <ChoiceCard
                      label={t('intro.sched.weekends')}
                      iconName="weekend"
                      selected={draft.cookingSchedule === 'weekends'}
                      onPress={() => setDraft((d) => ({ ...d, cookingSchedule: 'weekends' }))}
                      colors={colors}
                      styles={styles}
                    />
                    <ChoiceCard
                      label={t('intro.sched.mostDays')}
                      iconName="calendar-today"
                      selected={draft.cookingSchedule === 'most_days'}
                      onPress={() => setDraft((d) => ({ ...d, cookingSchedule: 'most_days' }))}
                      colors={colors}
                      styles={styles}
                    />
                    <ChoiceCard
                      label={t('intro.sched.flexible')}
                      iconName="tune"
                      selected={draft.cookingSchedule === 'flexible'}
                      onPress={() => setDraft((d) => ({ ...d, cookingSchedule: 'flexible' }))}
                      colors={colors}
                      styles={styles}
                    />
                  </View>
                ) : null}

                {step.id === 'flavor' ? (
                  <View style={styles.pillsWrap}>
                    {FLAVORS.map((f) => {
                      const on = draft.flavorProfile.includes(f.id);
                      return (
                        <Pressable
                          key={f.id}
                          onPress={() => toggleListValue('flavorProfile', f.id)}
                          style={[
                            styles.pill,
                            styles.pillCap,
                            on ? styles.pillOn : styles.pillOff,
                            on && mealMindAmbientShadow(colors),
                          ]}>
                          <Text style={[styles.pillText, on && styles.pillTextOn]}>{t(f.labelKey)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}

                {step.id === 'spicy' ? (
                  <View style={styles.stack}>
                    <ChoiceCard
                      label={t('intro.spice.mild')}
                      iconName="sentiment-satisfied"
                      selected={draft.spicyLevel === 'mild'}
                      onPress={() => setDraft((d) => ({ ...d, spicyLevel: 'mild' }))}
                      colors={colors}
                      styles={styles}
                    />
                    <ChoiceCard
                      label={t('intro.spice.medium')}
                      iconName="local-fire-department"
                      selected={draft.spicyLevel === 'medium'}
                      onPress={() => setDraft((d) => ({ ...d, spicyLevel: 'medium' }))}
                      colors={colors}
                      styles={styles}
                    />
                    <ChoiceCard
                      label={t('intro.spice.hot')}
                      iconName="whatshot"
                      selected={draft.spicyLevel === 'hot'}
                      onPress={() => setDraft((d) => ({ ...d, spicyLevel: 'hot' }))}
                      colors={colors}
                      styles={styles}
                    />
                  </View>
                ) : null}

                {step.id === 'calories' ? (
                  <View style={styles.stack}>
                    <ChoiceCard
                      label={t('intro.cal.no_pref')}
                      iconName="restaurant-menu"
                      selected={draft.calorieFocus === 'no_preference'}
                      onPress={() => setDraft((d) => ({ ...d, calorieFocus: 'no_preference' }))}
                      colors={colors}
                      styles={styles}
                    />
                    <ChoiceCard
                      label={t('intro.cal.lower')}
                      iconName="trending-down"
                      selected={draft.calorieFocus === 'lower'}
                      onPress={() => setDraft((d) => ({ ...d, calorieFocus: 'lower' }))}
                      colors={colors}
                      styles={styles}
                    />
                    <ChoiceCard
                      label={t('intro.cal.balanced')}
                      iconName="tune"
                      selected={draft.calorieFocus === 'balanced'}
                      onPress={() => setDraft((d) => ({ ...d, calorieFocus: 'balanced' }))}
                      colors={colors}
                      styles={styles}
                    />
                    <ChoiceCard
                      label={t('intro.cal.higher')}
                      iconName="trending-up"
                      selected={draft.calorieFocus === 'higher'}
                      onPress={() => setDraft((d) => ({ ...d, calorieFocus: 'higher' }))}
                      colors={colors}
                      styles={styles}
                    />
                  </View>
                ) : null}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <View style={[styles.stickyBottom, { paddingBottom: stickyBottomPad }]}>
            <View style={styles.stickyInner}>
              <Text style={styles.footerCaption}>{t('intro.footerHint')}</Text>
              <GlowButton
                label={stepIdx === STEPS.length - 1 ? t('common.finish') : t('common.continue')}
                trailing={<MaterialIcons name="arrow-forward" size={22} color={colors.onPrimary} />}
                onPress={() => void goNext()}
              />
            </View>
          </View>
        </View>
      </View>
    </MealMindScreen>
  );
}

/* ── Finalizing overlay ───────────────────────────────────────────── */

function FinalizingScreen() {
  const { t } = useI18n();
  const colors = useMealMindColors();
  const fStyles = useMemo(() => createFinalizeStyles(colors), [colors]);
  const progress = useRef(new Animated.Value(0)).current;
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const sub = progress.addListener(({ value }) => {
      setPct(Math.min(100, Math.round(value * 100)));
    });
    Animated.timing(progress, {
      toValue: 1,
      duration: FINALIZE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => {
      progress.removeListener(sub);
    };
  }, [progress]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <MealMindScreen scroll={false} showFooter={false} contentBottomInset={0}>
      <View style={fStyles.root}>
        <View style={fStyles.column}>
          <View style={fStyles.iconWell}>
            <MaterialIcons name="auto-awesome" size={44} color={colors.onPrimary} />
          </View>
          <Text style={fStyles.title}>{t('intro.finalize.title')}</Text>
          <Text style={fStyles.sub}>{t('intro.finalize.sub')}</Text>

          <View style={fStyles.track}>
            <Animated.View style={[fStyles.fill, { width: fillWidth }]} />
          </View>
          <Text style={fStyles.pct}>{pct}%</Text>

          <View style={fStyles.steps}>
            {FINALIZE_LINES.map((line, idx) => {
              const active = pct >= Math.round(((idx + 0.6) / FINALIZE_LINES.length) * 100);
              return (
                <View key={line.labelKey} style={fStyles.stepRow}>
                  <MaterialIcons
                    name={active ? 'check-circle' : line.icon}
                    size={20}
                    color={active ? colors.primary : colors.outline}
                  />
                  <Text style={[fStyles.stepText, active && fStyles.stepTextOn]}>
                    {t(line.labelKey)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </MealMindScreen>
  );
}

/* ── Tag editor ───────────────────────────────────────────────────── */

function TagEditor({
  tags,
  onChange,
  placeholder,
  colors,
  styles,
  t,
}: {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  colors: MealMindPalette;
  styles: IntroStyleSheet;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const [draft, setDraft] = useState('');

  const add = useCallback(() => {
    const tag = normalizeTag(draft);
    if (tag.length === 0) return;
    onChange(tags.includes(tag) ? tags : [...tags, tag]);
    setDraft('');
  }, [draft, onChange, tags]);

  const remove = useCallback(
    (tag: string) => {
      onChange(tags.filter((x) => x !== tag));
    },
    [onChange, tags],
  );

  return (
    <View style={styles.tagCard}>
      <Text style={styles.tagLead}>{t('intro.tagAdded')}</Text>
      <View style={styles.tagWrap}>
        {tags.map((tag) => (
          <TagPill key={tag} label={tag} onRemove={() => remove(tag)} colors={colors} styles={styles} />
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={add}
          style={styles.addPill}
          disabled={normalizeTag(draft).length === 0}>
          <MaterialIcons
            name="add"
            size={16}
            color={colors.onSurface}
            style={{ opacity: normalizeTag(draft).length === 0 ? 0.4 : 1 }}
          />
          <Text style={[styles.addPillText, normalizeTag(draft).length === 0 && styles.addPillTextDisabled]}>
            {t('common.add')}
          </Text>
        </Pressable>
      </View>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={add}
        placeholder={placeholder}
        placeholderTextColor={`${colors.onSurfaceVariant}99`}
        style={styles.tagField}
        returnKeyType="done"
      />
    </View>
  );
}
