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
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
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

const STEPS: { id: WizardStepId; title: string; subtitle: string }[] = [
  {
    id: 'goal',
    title: 'What is your main goal?',
    subtitle: 'Choose the option that best describes what you want to achieve.',
  },
  {
    id: 'diet',
    title: 'Do you follow a specific diet?',
    subtitle: 'We’ll tailor your recipe feed to match your nutritional needs and lifestyle.',
  },
  {
    id: 'cuisines',
    title: 'What cuisines do you usually enjoy?',
    subtitle: 'Select your favorites to customize your recipe feed.',
  },
  {
    id: 'avoidFoods',
    title: 'Foods to avoid',
    subtitle: 'Add ingredients you prefer not to see in recommendations.',
  },
  {
    id: 'dislikes',
    title: 'Dislikes',
    subtitle: 'Tell us what you and your family don’t enjoy.',
  },
  {
    id: 'cookingExperience',
    title: 'Cooking experience',
    subtitle: 'This helps us match recipes to your comfort level.',
  },
  {
    id: 'schedule',
    title: 'Cooking schedule',
    subtitle: 'When do you usually cook at home?',
  },
  {
    id: 'flavor',
    title: 'Flavor profile',
    subtitle: 'Pick flavors you want more of in your feed.',
  },
  {
    id: 'spicy',
    title: 'Spice level',
    subtitle: 'How spicy should recipes be by default?',
  },
  {
    id: 'calories',
    title: 'Calories',
    subtitle: 'Choose how you want to think about calories.',
  },
];

const FINALIZE_MS = 1800;
const FINALIZE_LINES: { label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { label: 'Saving your taste profile', icon: 'restaurant-menu' },
  { label: 'Balancing flavors & goals', icon: 'tune' },
  { label: 'Personalizing your first recipes', icon: 'auto-awesome' },
];

const FORM_MAX_WIDTH = 576;
const OUTLINE_BORDER = `${MealMindColors.outlineVariant}26`;

const GOALS: { id: WellnessGoal; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'eat_healthier', label: 'Eat healthier', icon: 'spa' },
  { id: 'save_time', label: 'Save time', icon: 'timer' },
  { id: 'lose_weight', label: 'Lose weight', icon: 'monitor-weight' },
  { id: 'gain_muscle', label: 'Gain muscle', icon: 'fitness-center' },
  { id: 'maintain_weight', label: 'Maintain weight', icon: 'balance' },
  { id: 'reduce_waste', label: 'Reduce food waste', icon: 'recycling' },
  { id: 'budget', label: 'Eat on a budget', icon: 'payments' },
  { id: 'unsure', label: 'Not sure yet', icon: 'help-outline' },
];

const DIETS: { id: DietaryPreference; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'none', label: 'No preference', icon: 'restaurant' },
  { id: 'vegetarian', label: 'Vegetarian', icon: 'eco' },
  { id: 'vegan', label: 'Vegan', icon: 'nature' },
  { id: 'keto', label: 'Keto', icon: 'bolt' },
  { id: 'low_carb', label: 'Low carb', icon: 'keyboard-double-arrow-down' },
  { id: 'high_protein', label: 'High protein', icon: 'fitness-center' },
  { id: 'gluten_free', label: 'Gluten free', icon: 'no-meals' },
  { id: 'dairy_free', label: 'Dairy free', icon: 'opacity' },
  { id: 'other', label: 'Other', icon: 'more-horiz' },
];

const CUISINES = [
  'American',
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Korean',
  'Thai',
  'Indian',
  'Mediterranean',
  'French',
  'Middle Eastern',
  'Vietnamese',
];

const FLAVORS = ['savory', 'healthy', 'sweet', 'tangy', 'mild', 'spicy'];

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

function TagPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <View style={styles.tagPill}>
      <Text style={styles.tagText}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${label}`} hitSlop={8} onPress={onRemove} style={styles.tagRemove}>
        <MaterialIcons name="close" size={16} color={MealMindColors.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}

function ChoiceCard({
  label,
  iconName,
  selected,
  onPress,
}: {
  label: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceCard,
        selected ? styles.choiceCardOn : styles.choiceCardOff,
        selected && MealMindShadow.ambient,
        pressed && styles.pressed,
      ]}>
      <View style={styles.choiceCardLeft}>
        <MaterialIcons
          name={iconName}
          size={22}
          color={selected ? MealMindColors.onPrimary : MealMindColors.outline}
        />
        <Text style={[styles.choiceCardLabel, selected && styles.choiceCardLabelOn]}>{label}</Text>
      </View>
      <MaterialIcons
        name={selected ? 'check-circle' : 'radio-button-unchecked'}
        size={22}
        color={selected ? MealMindColors.onPrimary : MealMindColors.outlineVariant}
      />
    </Pressable>
  );
}

export default function IntroWizardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    // Keep them on the intro so they can retest immediately.
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
        <MealMindFlowHeader title="Onboarding" showBottomDivider />
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
                <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
              </Pressable>
            )}
            <Text style={styles.topTitle} numberOfLines={1}>
              Personalize
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Skip onboarding" hitSlop={12} onPress={() => void skipAll()} style={styles.iconBtn}>
              <MaterialIcons name="close" size={24} color={MealMindColors.primary} />
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
                Step {stepIdx + 1} of {STEPS.length}
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
                  <Text style={styles.heroTitle}>{step.title}</Text>
                  <Text style={styles.heroSub}>{step.subtitle}</Text>
                </View>

                {step.id === 'goal' ? (
                  <View style={styles.stack}>
                    {GOALS.map((g) => (
                      <ChoiceCard
                        key={g.id}
                        label={g.label}
                        iconName={g.icon}
                        selected={draft.wellnessGoal === g.id}
                        onPress={() => setDraft((d) => ({ ...d, wellnessGoal: g.id }))}
                      />
                    ))}
                    <Pressable onPress={() => void skipAll()} style={styles.ghostAction}>
                      <Text style={styles.ghostActionLabel}>I’ll set my goals later</Text>
                    </Pressable>
                  </View>
                ) : null}

                {step.id === 'diet' ? (
                  <View style={styles.stack}>
                    {DIETS.map((d) => (
                      <ChoiceCard
                        key={d.id}
                        label={d.label}
                        iconName={d.icon}
                        selected={draft.dietaryPreference === d.id}
                        onPress={() => setDraft((x) => ({ ...x, dietaryPreference: d.id }))}
                      />
                    ))}
                  </View>
                ) : null}

                {step.id === 'cuisines' ? (
                  <View style={styles.cuisineList}>
                    {CUISINES.map((c) => {
                      const on = draft.cuisines.includes(c);
                      return (
                        <Pressable
                          key={c}
                          accessibilityRole="button"
                          accessibilityState={{ selected: on }}
                          onPress={() => toggleListValue('cuisines', c)}
                          style={({ pressed }) => [
                            styles.cuisineButton,
                            on ? styles.cuisineButtonOn : styles.cuisineButtonOff,
                            on && MealMindShadow.ambient,
                            pressed && styles.pressed,
                          ]}>
                          <Text style={[styles.cuisineLabel, on && styles.cuisineLabelOn]}>{c}</Text>
                          {on ? (
                            <MaterialIcons name="check-circle" size={20} color={MealMindColors.onPrimaryContainer} />
                          ) : (
                            <MaterialIcons name="add" size={20} color={MealMindColors.outline} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}

                {step.id === 'avoidFoods' ? (
                  <TagEditor
                    placeholder="Type a food to avoid (e.g., mushrooms) then tap Add"
                    tags={draft.avoidFoods}
                    onChange={(next) => setTagList('avoidFoods', next)}
                  />
                ) : null}

                {step.id === 'dislikes' ? (
                  <TagEditor
                    placeholder="Type a dislike (e.g., cilantro) then tap Add"
                    tags={draft.dislikes}
                    onChange={(next) => setTagList('dislikes', next)}
                  />
                ) : null}

                {step.id === 'cookingExperience' ? (
                  <View style={styles.stack}>
                    <ChoiceCard
                      label="New to cooking"
                      iconName="emoji-people"
                      selected={draft.cookingExperience === 'new'}
                      onPress={() => setDraft((d) => ({ ...d, cookingExperience: 'new' as CookingExperience }))}
                    />
                    <ChoiceCard
                      label="Home cook"
                      iconName="home"
                      selected={draft.cookingExperience === 'home_cook'}
                      onPress={() => setDraft((d) => ({ ...d, cookingExperience: 'home_cook' as CookingExperience }))}
                    />
                    <ChoiceCard
                      label="Confident"
                      iconName="local-fire-department"
                      selected={draft.cookingExperience === 'confident'}
                      onPress={() => setDraft((d) => ({ ...d, cookingExperience: 'confident' as CookingExperience }))}
                    />
                    <ChoiceCard
                      label="Pro / enthusiast"
                      iconName="stars"
                      selected={draft.cookingExperience === 'pro'}
                      onPress={() => setDraft((d) => ({ ...d, cookingExperience: 'pro' as CookingExperience }))}
                    />
                  </View>
                ) : null}

                {step.id === 'schedule' ? (
                  <View style={styles.stack}>
                    <ChoiceCard
                      label="Weeknights"
                      iconName="nights-stay"
                      selected={draft.cookingSchedule === 'weeknights'}
                      onPress={() => setDraft((d) => ({ ...d, cookingSchedule: 'weeknights' }))}
                    />
                    <ChoiceCard
                      label="Weekends"
                      iconName="weekend"
                      selected={draft.cookingSchedule === 'weekends'}
                      onPress={() => setDraft((d) => ({ ...d, cookingSchedule: 'weekends' }))}
                    />
                    <ChoiceCard
                      label="Most days"
                      iconName="calendar-today"
                      selected={draft.cookingSchedule === 'most_days'}
                      onPress={() => setDraft((d) => ({ ...d, cookingSchedule: 'most_days' }))}
                    />
                    <ChoiceCard
                      label="Flexible"
                      iconName="tune"
                      selected={draft.cookingSchedule === 'flexible'}
                      onPress={() => setDraft((d) => ({ ...d, cookingSchedule: 'flexible' }))}
                    />
                  </View>
                ) : null}

                {step.id === 'flavor' ? (
                  <View style={styles.pillsWrap}>
                    {FLAVORS.map((f) => {
                      const on = draft.flavorProfile.includes(f);
                      return (
                        <Pressable
                          key={f}
                          onPress={() => toggleListValue('flavorProfile', f)}
                          style={[
                            styles.pill,
                            styles.pillCap,
                            on ? styles.pillOn : styles.pillOff,
                            on && MealMindShadow.ambient,
                          ]}>
                          <Text style={[styles.pillText, on && styles.pillTextOn]}>{f}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}

                {step.id === 'spicy' ? (
                  <View style={styles.stack}>
                    <ChoiceCard
                      label="Mild"
                      iconName="sentiment-satisfied"
                      selected={draft.spicyLevel === 'mild'}
                      onPress={() => setDraft((d) => ({ ...d, spicyLevel: 'mild' }))}
                    />
                    <ChoiceCard
                      label="Medium"
                      iconName="local-fire-department"
                      selected={draft.spicyLevel === 'medium'}
                      onPress={() => setDraft((d) => ({ ...d, spicyLevel: 'medium' }))}
                    />
                    <ChoiceCard
                      label="Hot"
                      iconName="whatshot"
                      selected={draft.spicyLevel === 'hot'}
                      onPress={() => setDraft((d) => ({ ...d, spicyLevel: 'hot' }))}
                    />
                  </View>
                ) : null}

                {step.id === 'calories' ? (
                  <View style={styles.stack}>
                    <ChoiceCard
                      label="No preference"
                      iconName="restaurant-menu"
                      selected={draft.calorieFocus === 'no_preference'}
                      onPress={() => setDraft((d) => ({ ...d, calorieFocus: 'no_preference' }))}
                    />
                    <ChoiceCard
                      label="Lower calories"
                      iconName="trending-down"
                      selected={draft.calorieFocus === 'lower'}
                      onPress={() => setDraft((d) => ({ ...d, calorieFocus: 'lower' }))}
                    />
                    <ChoiceCard
                      label="Balanced"
                      iconName="tune"
                      selected={draft.calorieFocus === 'balanced'}
                      onPress={() => setDraft((d) => ({ ...d, calorieFocus: 'balanced' }))}
                    />
                    <ChoiceCard
                      label="Higher calories"
                      iconName="trending-up"
                      selected={draft.calorieFocus === 'higher'}
                      onPress={() => setDraft((d) => ({ ...d, calorieFocus: 'higher' }))}
                    />
                  </View>
                ) : null}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <View style={[styles.stickyBottom, { paddingBottom: stickyBottomPad }]}>
            <View style={styles.stickyInner}>
              <Text style={styles.footerCaption}>You can change these later in Profile.</Text>
              <GlowButton
                label={stepIdx === STEPS.length - 1 ? 'Finish' : 'Continue'}
                trailing={<MaterialIcons name="arrow-forward" size={22} color={MealMindColors.onPrimary} />}
                onPress={() => void goNext()}
              />
            </View>
          </View>
        </View>
      </View>
    </MealMindScreen>
  );
}

function FinalizingScreen() {
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
      <View style={finalizeStyles.root}>
        <View style={finalizeStyles.column}>
          <View style={finalizeStyles.iconWell}>
            <MaterialIcons name="auto-awesome" size={44} color={MealMindColors.onPrimary} />
          </View>
          <Text style={finalizeStyles.title}>Setting things up for you</Text>
          <Text style={finalizeStyles.sub}>
            We’re tuning your recipe feed to match your taste, schedule, and goals.
          </Text>

          <View style={finalizeStyles.track}>
            <Animated.View style={[finalizeStyles.fill, { width: fillWidth }]} />
          </View>
          <Text style={finalizeStyles.pct}>{pct}%</Text>

          <View style={finalizeStyles.steps}>
            {FINALIZE_LINES.map((line, idx) => {
              const active = pct >= Math.round(((idx + 0.6) / FINALIZE_LINES.length) * 100);
              return (
                <View key={line.label} style={finalizeStyles.stepRow}>
                  <MaterialIcons
                    name={active ? 'check-circle' : line.icon}
                    size={20}
                    color={active ? MealMindColors.primary : MealMindColors.outline}
                  />
                  <Text style={[finalizeStyles.stepText, active && finalizeStyles.stepTextOn]}>
                    {line.label}
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

function TagEditor({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');

  const add = useCallback(() => {
    const t = normalizeTag(draft);
    if (t.length === 0) return;
    onChange(tags.includes(t) ? tags : [...tags, t]);
    setDraft('');
  }, [draft, onChange, tags]);

  const remove = useCallback(
    (t: string) => {
      onChange(tags.filter((x) => x !== t));
    },
    [onChange, tags],
  );

  return (
    <View style={styles.tagCard}>
      <Text style={styles.tagLead}>Added:</Text>
      <View style={styles.tagWrap}>
        {tags.map((t) => (
          <TagPill key={t} label={t} onRemove={() => remove(t)} />
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={add}
          style={styles.addPill}
          disabled={normalizeTag(draft).length === 0}>
          <MaterialIcons
            name="add"
            size={16}
            color={MealMindColors.onSurface}
            style={{ opacity: normalizeTag(draft).length === 0 ? 0.4 : 1 }}
          />
          <Text style={[styles.addPillText, normalizeTag(draft).length === 0 && styles.addPillTextDisabled]}>
            Add
          </Text>
        </Pressable>
      </View>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={add}
        placeholder={placeholder}
        placeholderTextColor={`${MealMindColors.onSurfaceVariant}99`}
        style={styles.tagField}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: MealMindColors.surface, overflow: 'hidden' },
  decor: { ...StyleSheet.absoluteFillObject },
  blobPrimary: {
    position: 'absolute',
    top: -96,
    right: -96,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${MealMindColors.primaryContainer}1A`,
  },
  blobSecondary: {
    position: 'absolute',
    top: '45%',
    left: -128,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: `${MealMindColors.secondaryContainer}1A`,
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
    backgroundColor: `${MealMindColors.surface}CC`,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${MealMindColors.outlineVariant}26`,
  },
  iconBtn: { padding: 4 },
  iconBtnSpacer: { padding: 4, width: 28, height: 28 },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 18,
    letterSpacing: headlineTracking,
    color: MealMindColors.primary,
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
    color: MealMindColors.secondary,
  },
  stepPct: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: MealMindColors.outline,
  },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: MealMindColors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: MealMindColors.primary,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: MealMindSpace.lg, paddingTop: MealMindSpace.lg, flexGrow: 1 },
  inner: { maxWidth: FORM_MAX_WIDTH, width: '100%', alignSelf: 'center' },
  hero: { marginBottom: 28, alignItems: 'center' },
  heroTitle: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 30,
    letterSpacing: -0.4,
    color: MealMindColors.onSurface,
    textAlign: 'center',
    marginBottom: MealMindSpace.md,
    paddingHorizontal: 8,
  },
  heroSub: {
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: MealMindColors.onSurfaceVariant,
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
  choiceCardOff: { backgroundColor: MealMindColors.surfaceContainerLow, borderColor: 'transparent' },
  choiceCardOn: { backgroundColor: MealMindColors.primary, borderColor: 'transparent' },
  choiceCardLeft: { flexDirection: 'row', alignItems: 'center', gap: MealMindSpace.md, flex: 1, minWidth: 0 },
  choiceCardLabel: {
    flex: 1,
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 17,
    color: MealMindColors.onSurface,
  },
  choiceCardLabelOn: { color: MealMindColors.onPrimary },
  ghostAction: { alignSelf: 'center', paddingVertical: MealMindSpace.sm },
  ghostActionLabel: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: MealMindColors.outline,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: MealMindSpace.md, justifyContent: 'space-between' },
  gridCard: {
    width: '48%',
    minHeight: 74,
    borderRadius: MealMindRadii.lg,
    padding: MealMindSpace.lg,
    backgroundColor: MealMindColors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
  },
  gridCardOff: { borderColor: `${MealMindColors.outlineVariant}1A` },
  gridCardOn: { backgroundColor: MealMindColors.primaryFixed, borderColor: 'transparent' },
  gridCardLabel: {
    flex: 1,
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 16,
    color: MealMindColors.onSurface,
    marginRight: MealMindSpace.sm,
  },
  gridCardLabelOn: { color: MealMindColors.onPrimaryContainer },
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
    backgroundColor: MealMindColors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cuisineButtonOff: {
    borderColor: `${MealMindColors.outlineVariant}1A`,
  },
  cuisineButtonOn: {
    backgroundColor: MealMindColors.primaryFixed,
    borderColor: 'transparent',
  },
  cuisineLabel: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 17,
    color: MealMindColors.onSurface,
  },
  cuisineLabelOn: {
    color: MealMindColors.onPrimaryContainer,
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
  pillOff: { backgroundColor: MealMindColors.surfaceContainerLowest, borderColor: OUTLINE_BORDER },
  pillOn: { backgroundColor: MealMindColors.primaryContainer, borderColor: 'transparent' },
  pillText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 15,
    color: MealMindColors.onSurface,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  pillTextOn: { fontFamily: MealMindFonts.labelSemibold, color: MealMindColors.onPrimaryContainer },
  tagCard: {
    backgroundColor: MealMindColors.surfaceContainerLow,
    borderRadius: MealMindRadii.lg,
    padding: MealMindSpace.lg,
  },
  tagLead: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
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
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE_BORDER,
  },
  tagText: { fontFamily: MealMindFonts.body, fontSize: 14, color: MealMindColors.onSurface },
  tagRemove: { padding: 2 },
  addPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: 8,
    borderRadius: MealMindRadii.full,
    backgroundColor: `${MealMindColors.outline}1A`,
  },
  addPillText: { fontFamily: MealMindFonts.labelSemibold, fontSize: 14, color: MealMindColors.onSurface },
  addPillTextDisabled: { opacity: 0.45 },
  tagField: {
    marginTop: MealMindSpace.md,
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    color: MealMindColors.onSurface,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE_BORDER,
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
    backgroundColor: `${MealMindColors.surface}F2`,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${MealMindColors.outlineVariant}1A`,
  },
  stickyInner: { maxWidth: FORM_MAX_WIDTH, width: '100%', alignSelf: 'center', gap: MealMindSpace.md },
  footerCaption: {
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: MealMindColors.onSurfaceVariant,
    textAlign: 'center',
  },
  devReset: {
    marginHorizontal: MealMindSpace.lg,
    marginTop: MealMindSpace.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: 8,
    borderRadius: MealMindRadii.full,
    backgroundColor: `${MealMindColors.outlineVariant}14`,
  },
  devResetText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 13,
    color: MealMindColors.primary,
    letterSpacing: headlineTracking,
  },
});

const finalizeStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MealMindColors.surface,
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
    backgroundColor: MealMindColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: MealMindSpace.md,
    ...MealMindShadow.glowCta,
  },
  title: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 26,
    textAlign: 'center',
    color: MealMindColors.onSurface,
  },
  sub: {
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: MealMindColors.onSurfaceVariant,
    marginBottom: MealMindSpace.md,
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: MealMindColors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: MealMindColors.primary,
  },
  pct: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 13,
    letterSpacing: 1.2,
    color: MealMindColors.onSurfaceVariant,
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
    color: MealMindColors.onSurfaceVariant,
  },
  stepTextOn: {
    color: MealMindColors.onSurface,
  },
});

