import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlowButton, MealMindScreen } from '@/components/mealmind';
import { KITCHEN_COMFORT_LABELS, SKILL_LABELS } from '@/constants/onboarding-options';
import { useI18n } from '@/contexts/i18n-context';
import type { MealMindPalette } from '@/constants/mealmind-colors';
import { mealMindAmbientShadow, MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';
import { getCountryPickerItems, getCountryLabel } from '@/lib/country-picker-data';
import type { KitchenComfort, SkillLevel, StoredProfile } from '@/lib/profile-storage';
import { getProfile, setProfile } from '@/lib/profile-storage';
import { showErrorToast, showSuccessToast } from '@/lib/mealmind-toast';
import { upsertMealMindProfile } from '@/lib/supabase-profile';

const COMFORT_IDS = Object.keys(KITCHEN_COMFORT_LABELS) as KitchenComfort[];
const SKILL_IDS = Object.keys(SKILL_LABELS) as SkillLevel[];

const COMFORT_ICONS: Record<KitchenComfort, keyof typeof MaterialIcons.glyphMap> = {
  quick_simple: 'flash-on',
  balanced: 'balance',
  ambitious: 'emoji-events',
};

const COMFORT_LABEL_KEYS: Record<KitchenComfort, string> = {
  quick_simple: 'kitchenRegion.comfortQuick',
  balanced: 'kitchenRegion.comfortBalanced',
  ambitious: 'kitchenRegion.comfortAmbitious',
};

const COMFORT_DESC_KEYS: Record<KitchenComfort, string> = {
  quick_simple: 'kitchenRegion.comfortQuickDesc',
  balanced: 'kitchenRegion.comfortBalancedDesc',
  ambitious: 'kitchenRegion.comfortAmbitiousDesc',
};

const SKILL_ICONS: Record<SkillLevel, keyof typeof MaterialIcons.glyphMap> = {
  beginner: 'school',
  intermediate: 'restaurant',
  advanced: 'workspace-premium',
};

const SKILL_LABEL_KEYS: Record<SkillLevel, string> = {
  beginner: 'kitchenRegion.skillBeginner',
  intermediate: 'kitchenRegion.skillIntermediate',
  advanced: 'kitchenRegion.skillAdvanced',
};

const SKILL_DESC_KEYS: Record<SkillLevel, string> = {
  beginner: 'kitchenRegion.skillBeginnerDesc',
  intermediate: 'kitchenRegion.skillIntermediateDesc',
  advanced: 'kitchenRegion.skillAdvancedDesc',
};

function createStyles(colors: MealMindPalette) {
  const amb = mealMindAmbientShadow(colors);
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
    body: { padding: 20, gap: 8 },
    label: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 12,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.outline,
      marginTop: 16,
      marginBottom: 6,
    },
    countryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderRadius: MealMindRadii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.outlineVariant}66`,
      backgroundColor: colors.surfaceContainerLowest,
      ...amb,
    },
    countryRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      flex: 1,
      minWidth: 0,
    },
    countryName: {
      fontFamily: MealMindFonts.bodyMedium,
      fontSize: 17,
      color: colors.onSurface,
      flex: 1,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: MealMindRadii.md,
      borderWidth: 1.5,
      borderColor: `${colors.outlineVariant}55`,
      backgroundColor: colors.surfaceContainerLowest,
      marginBottom: 10,
    },
    optionCardOn: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: `${colors.primaryContainer}22`,
    },
    optionIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.secondaryContainer}60`,
    },
    optionIconWrapOn: {
      backgroundColor: `${colors.primaryContainer}80`,
    },
    optionTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    optionLabel: {
      fontFamily: MealMindFonts.bodyMedium,
      fontSize: 16,
      color: colors.onSurface,
    },
    optionLabelOn: {
      color: colors.primary,
      fontFamily: MealMindFonts.headlineBold,
    },
    optionDesc: {
      fontFamily: MealMindFonts.body,
      fontSize: 13,
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
    checkMark: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingTop: MealMindSpace.sm,
      backgroundColor: colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: `${colors.outlineVariant}44`,
    },
    pressed: { opacity: 0.9 },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      ...amb,
    },
    modalHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.outlineVariant,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 6,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    modalTitle: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 20,
      color: colors.onSurface,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginHorizontal: 20,
      marginBottom: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: MealMindRadii.md,
      backgroundColor: colors.surfaceContainerHigh,
    },
    searchInput: {
      flex: 1,
      fontFamily: MealMindFonts.body,
      fontSize: 15,
      color: colors.onSurface,
      paddingVertical: 4,
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: `${colors.outlineVariant}22`,
    },
    countryItemOn: {
      backgroundColor: `${colors.primaryContainer}18`,
    },
    countryItemLabel: {
      fontFamily: MealMindFonts.body,
      fontSize: 16,
      color: colors.onSurface,
      flex: 1,
    },
    countryItemLabelOn: {
      fontFamily: MealMindFonts.bodyMedium,
      color: colors.primary,
    },
  });
}

export default function ProfileKitchenRegionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useMealMindColors();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const countryItems = getCountryPickerItems();
  const [base, setBase] = useState<StoredProfile | null>(null);
  const [countryCode, setCountryCode] = useState('WORLDWIDE');
  const [kitchenComfort, setKitchenComfort] = useState<KitchenComfort>('balanced');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

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

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return countryItems;
    const q = countrySearch.toLowerCase();
    return countryItems.filter((c) => c.label.toLowerCase().includes(q));
  }, [countryItems, countrySearch]);

  const pickCountry = useCallback((code: string) => {
    setCountryCode(code);
    setShowCountryModal(false);
    setCountrySearch('');
  }, []);

  const save = useCallback(async () => {
    if (!base) return;
    try {
      const next: StoredProfile = { ...base, countryCode, kitchenComfort, skillLevel };
      await setProfile(next);
      const { ok, error } = await upsertMealMindProfile(next);
      if (!ok) throw new Error(error ?? 'Sync failed');
      showSuccessToast(t('kitchenRegion.saved'));
      router.back();
    } catch (e) {
      showErrorToast(t('profile.title'), e instanceof Error ? e.message : t('kitchenRegion.saveFail'));
    }
  }, [base, countryCode, kitchenComfort, skillLevel, router, t]);

  if (!base) {
    return (
      <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
        <View style={{ paddingTop: insets.top + 40, alignItems: 'center' }}>
          <Text style={{ color: colors.onSurfaceVariant, fontFamily: MealMindFonts.body }}>
            {t('kitchenRegion.loading')}
          </Text>
        </View>
      </MealMindScreen>
    );
  }

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('kitchenRegion.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 120 }]}>
        {/* Country / Region */}
        <Text style={styles.label}>{t('kitchenRegion.countryLabel')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowCountryModal(true)}
          style={({ pressed }) => [styles.countryRow, pressed && styles.pressed]}>
          <View style={styles.countryRowLeft}>
            <MaterialIcons name="public" size={22} color={colors.primary} />
            <Text style={styles.countryName}>{getCountryLabel(countryCode)}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.outlineVariant} />
        </Pressable>

        {/* Kitchen Comfort */}
        <Text style={styles.label}>{t('kitchenRegion.comfortLabel')}</Text>
        {COMFORT_IDS.map((id) => {
          const on = kitchenComfort === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setKitchenComfort(id)}
              style={({ pressed }) => [
                styles.optionCard,
                on && styles.optionCardOn,
                pressed && styles.pressed,
              ]}>
              <View style={[styles.optionIconWrap, on && styles.optionIconWrapOn]}>
                <MaterialIcons
                  name={COMFORT_ICONS[id]}
                  size={22}
                  color={on ? colors.primary : colors.onSurfaceVariant}
                />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={[styles.optionLabel, on && styles.optionLabelOn]}>
                  {t(COMFORT_LABEL_KEYS[id])}
                </Text>
                <Text style={styles.optionDesc}>{t(COMFORT_DESC_KEYS[id])}</Text>
              </View>
              {on ? (
                <View style={styles.checkMark}>
                  <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                </View>
              ) : null}
            </Pressable>
          );
        })}

        {/* Cooking Skill */}
        <Text style={styles.label}>{t('kitchenRegion.skillLabel')}</Text>
        {SKILL_IDS.map((id) => {
          const on = skillLevel === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setSkillLevel(id)}
              style={({ pressed }) => [
                styles.optionCard,
                on && styles.optionCardOn,
                pressed && styles.pressed,
              ]}>
              <View style={[styles.optionIconWrap, on && styles.optionIconWrapOn]}>
                <MaterialIcons
                  name={SKILL_ICONS[id]}
                  size={22}
                  color={on ? colors.primary : colors.onSurfaceVariant}
                />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={[styles.optionLabel, on && styles.optionLabelOn]}>
                  {t(SKILL_LABEL_KEYS[id])}
                </Text>
                <Text style={styles.optionDesc}>{t(SKILL_DESC_KEYS[id])}</Text>
              </View>
              {on ? (
                <View style={styles.checkMark}>
                  <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + MealMindSpace.md }]}>
        <GlowButton label={t('kitchenRegion.saveBtn')} onPress={() => void save()} />
      </View>

      {/* Country search modal */}
      <Modal visible={showCountryModal} animationType="slide" transparent>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setShowCountryModal(false);
            setCountrySearch('');
          }}>
          <Pressable style={[styles.modalSheet, { paddingBottom: insets.bottom }]} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('kitchenRegion.selectCountry')}</Text>
              <Pressable
                hitSlop={12}
                onPress={() => {
                  setShowCountryModal(false);
                  setCountrySearch('');
                }}>
                <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
            <View style={styles.searchWrap}>
              <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('kitchenRegion.searchCountries')}
                placeholderTextColor={colors.outlineVariant}
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoFocus
                returnKeyType="search"
              />
              {countrySearch.length > 0 ? (
                <Pressable hitSlop={8} onPress={() => setCountrySearch('')}>
                  <MaterialIcons name="clear" size={20} color={colors.onSurfaceVariant} />
                </Pressable>
              ) : null}
            </View>
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const on = countryCode === item.value;
                return (
                  <Pressable
                    onPress={() => pickCountry(item.value)}
                    style={[styles.countryItem, on && styles.countryItemOn]}>
                    <Text style={[styles.countryItemLabel, on && styles.countryItemLabelOn]}>
                      {item.label}
                    </Text>
                    {on ? (
                      <MaterialIcons name="check" size={22} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </MealMindScreen>
  );
}
