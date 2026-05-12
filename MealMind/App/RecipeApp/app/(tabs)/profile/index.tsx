import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindScreen } from '@/components/mealmind';
import {
  DIETARY_PREFERENCE_LABELS,
  spicyLevelLabel,
  WELLNESS_GOAL_LABELS,
} from '@/constants/profile-display-labels';
import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindRadii, mealMindAmbientShadow } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useI18n } from '@/contexts/i18n-context';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';
import {
  getAppLanguage,
  getThemePreference,
  languageLabel,
  type ThemePreference,
} from '@/lib/app-preferences';
import { getCountryLabel } from '@/lib/country-picker-data';
import { fetchMealMindProfile } from '@/lib/supabase-profile';
import type { StoredProfile } from '@/lib/profile-storage';
import { getProfile, hydrateLocalFlagsFromRemoteProfile } from '@/lib/profile-storage';
import { getSupabaseSession, signOutMealMind } from '@/lib/supabase-auth';
import { KITCHEN_COMFORT_LABELS, SKILL_LABELS } from '@/constants/onboarding-options';

const AVATAR_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA0zHYZ1KMYdNMuCqbj-rlDL0YRmMYWcJDJK9xfzllW-tINn26vOx-w7JsJ_HE-aLTtxabcNGKVfsym7LuZ_ig9Sfx6eymNrP_EtDULrmo_czukh_iYhf2nW42P6suZKEce9NUSLKlvke9I16dempmjLx7BbzcLjgTkLuRAIVruDUBdaNZtgT4RGW3xhy6bAz-mJIp7VK9gfgryu8rilaV510YPEKHMI4QmZNtT9-AQhgqeT3GSK4Q91giFwP9aaXrB5o4Y3pbTUcI';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const SUPPORT_URL = 'https://mealmind.app';
const PRIVACY_URL = 'https://mealmind.app/privacy';
const TERMS_URL = 'https://mealmind.app/terms';

function defaultProfile(): StoredProfile {
  return {
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
  };
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  trailing = 'chevron',
  colors,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  trailing?: 'chevron' | 'launch';
  colors: MealMindPalette;
}) {
  const styles = useMemo(() => createProfileStyles(colors), [colors]);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.settingsRow, pressed && styles.pressed]}>
      <View style={styles.settingsRowLeft}>
        <MaterialIcons name={icon} size={22} color={colors.outline} />
        <Text style={styles.settingsRowLabel}>{label}</Text>
      </View>
      <View style={styles.settingsRowRight}>
        {value ? (
          <Text style={styles.settingsRowValue} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        <MaterialIcons
          name={trailing === 'launch' ? 'open-in-new' : 'chevron-right'}
          size={20}
          color={colors.outlineVariant}
        />
      </View>
    </Pressable>
  );
}

export default function ProfileHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useMealMindColors();
  const { t } = useI18n();
  const styles = useMemo(() => createProfileStyles(colors), [colors]);
  const [profile, setProfileState] = useState<StoredProfile | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [langCode, setLangCode] = useState('en');
  const [themePref, setThemePref] = useState<ThemePreference>('system');
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    void (async () => {
      try {
        const remote = await fetchMealMindProfile();
        if (remote) {
          await hydrateLocalFlagsFromRemoteProfile(remote);
          setProfileState(remote);
        } else {
          const local = await getProfile();
          setProfileState(local);
        }
        const [lang, theme] = await Promise.all([getAppLanguage(), getThemePreference()]);
        setLangCode(lang);
        setThemePref(theme);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    reload();
    void getSupabaseSession().then((s) => setSessionEmail(s?.user?.email ?? null));
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      reload();
      void getSupabaseSession().then((s) => setSessionEmail(s?.user?.email ?? null));
    }, [reload]),
  );

  const displayName =
    sessionEmail?.split('@')[0]?.replace(/\./g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Guest';
  const planLabel = t('profileHub.freePlan');
  const themeRowLabel =
    themePref === 'system' ? t('profile.themeSystem') : themePref === 'dark' ? t('profile.themeDark') : t('profile.themeLight');

  const onSignOut = useCallback(() => {
    void signOutMealMind().then(() => router.replace('/signin'));
  }, [router]);

  const p = profile ?? defaultProfile();
  const goalLabel = WELLNESS_GOAL_LABELS[p.wellnessGoal];
  const dietLabel = DIETARY_PREFERENCE_LABELS[p.dietaryPreference];
  const spiceLabel = spicyLevelLabel(p.spicyLevel);

  if (!loaded) {
    return (
      <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
        <View style={[styles.shell, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.loadingText}>{t('profileHub.loading')}</Text>
        </View>
      </MealMindScreen>
    );
  }

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={styles.shell}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + 52,
              paddingBottom: insets.bottom + 32,
            },
          ]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.maxInner}>
            {/* Account header */}
            <View style={styles.accountBlock}>
              <View style={styles.heroAvatarWrap}>
                <View style={styles.heroAvatar}>
                  <Image source={{ uri: AVATAR_URI }} style={styles.heroAvatarImg} contentFit="cover" />
                </View>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>{t('profileHub.proBadge')}</Text>
                </View>
              </View>
              <Text style={styles.displayName}>{displayName}</Text>
              {sessionEmail ? (
                <Text style={styles.emailText} numberOfLines={1}>
                  {sessionEmail}
                </Text>
              ) : (
                <Text style={styles.emailText}>{t('profileHub.notSignedIn')}</Text>
              )}
              <View style={styles.planChip}>
                <Text style={styles.planChipText}>{planLabel}</Text>
              </View>
            </View>

            {/* Subscription teaser */}
            <View style={styles.subCard}>
              <LinearGradient
                colors={[colors.primaryContainer, `${colors.primary}CC`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.subBlob1} />
              <View style={styles.subBlob2} />
              <View style={styles.subContent}>
                <Text style={styles.subTitle}>{t('profileHub.subCardTitle')}</Text>
                <Text style={styles.subBody}>
                  {t('profileHub.subCardBody')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/(tabs)/profile/subscription')}
                  style={({ pressed }) => [styles.subCta, pressed && styles.pressed]}>
                  <Text style={styles.subCtaText}>{t('profileHub.subCardCta')}</Text>
                </Pressable>
              </View>
            </View>

            {/* Taste profile summary */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>{t('profileHub.tasteTitle')}</Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/profile/taste-profile')}
                  style={({ pressed }) => [pressed && styles.pressed]}>
                  <Text style={styles.linkText}>{t('profileHub.tasteEdit')}</Text>
                </Pressable>
              </View>
              <View style={styles.tasteGrid}>
                <View style={styles.tasteCell}>
                  <MaterialIcons name="restaurant" size={24} color={colors.primary} />
                  <Text style={styles.tasteKicker}>{t('profileHub.tasteGoal')}</Text>
                  <Text style={styles.tasteValue} numberOfLines={2}>
                    {goalLabel}
                  </Text>
                </View>
                <View style={styles.tasteCell}>
                  <MaterialIcons name="eco" size={24} color={colors.primary} />
                  <Text style={styles.tasteKicker}>{t('profileHub.tasteDiet')}</Text>
                  <Text style={styles.tasteValue} numberOfLines={2}>
                    {dietLabel}
                  </Text>
                </View>
                <View style={styles.tasteCell}>
                  <MaterialIcons name="local-fire-department" size={24} color={colors.primary} />
                  <Text style={styles.tasteKicker}>{t('profileHub.tasteSpice')}</Text>
                  <Text style={styles.tasteValue}>{spiceLabel}</Text>
                </View>
              </View>
            </View>

            {/* Kitchen & Region */}
            <Text style={styles.sectionKicker}>{t('profileHub.sectionKitchen')}</Text>
            <View style={styles.groupCard}>
              <SettingsRow
                icon="public"
                label={t('profileHub.country')}
                value={getCountryLabel(p.countryCode)}
                onPress={() => router.push('/(tabs)/profile/kitchen-region')}
                colors={colors}
              />
              <View style={styles.hairline} />
              <SettingsRow
                icon="balance"
                label={t('profileHub.kitchenComfort')}
                value={KITCHEN_COMFORT_LABELS[p.kitchenComfort]}
                onPress={() => router.push('/(tabs)/profile/kitchen-region')}
                colors={colors}
              />
              <View style={styles.hairline} />
              <SettingsRow
                icon="restaurant-menu"
                label={t('profileHub.skillLevel')}
                value={SKILL_LABELS[p.skillLevel]}
                onPress={() => router.push('/(tabs)/profile/kitchen-region')}
                colors={colors}
              />
            </View>

            {/* App settings */}
            <Text style={styles.sectionKicker}>{t('profileHub.sectionApp')}</Text>
            <View style={styles.groupCard}>
              <SettingsRow
                icon="language"
                label={t('profileHub.language')}
                value={languageLabel(langCode)}
                onPress={() => router.push('/(tabs)/profile/language')}
                colors={colors}
              />
              <View style={styles.hairline} />
              <SettingsRow
                icon="dark-mode"
                label={t('profileHub.theme')}
                value={themeRowLabel}
                onPress={() => router.push('/(tabs)/profile/theme')}
                colors={colors}
              />
            </View>

            {/* Support */}
            <Text style={styles.sectionKicker}>{t('profileHub.sectionSupport')}</Text>
            <View style={styles.groupCard}>
              <SettingsRow
                icon="help-center"
                label={t('profileHub.helpFaq')}
                onPress={() => void Linking.openURL(SUPPORT_URL)}
                trailing="launch"
                colors={colors}
              />
              <View style={styles.hairline} />
              <SettingsRow
                icon="rate-review"
                label={t('profileHub.feedback')}
                value={t('profileHub.emailUs')}
                onPress={async () => {
                  const url = 'mailto:support@mealmind.app?subject=MealMind%20feedback';
                  const supported = await Linking.canOpenURL(url);
                  if (supported) {
                    await Linking.openURL(url);
                  } else {
                    Alert.alert('Feedback', 'Send us an email at:\nsupport@mealmind.app');
                  }
                }}
                colors={colors}
              />
              <View style={styles.hairline} />
              <SettingsRow
                icon="shield"
                label={t('profileHub.privacy')}
                onPress={() => void Linking.openURL(PRIVACY_URL)}
                colors={colors}
              />
              <View style={styles.hairline} />
              <SettingsRow
                icon="gavel"
                label={t('profileHub.terms')}
                onPress={() => void Linking.openURL(TERMS_URL)}
                colors={colors}
              />
            </View>

            {/* Danger */}
            <View style={styles.dangerBlock}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign out"
                onPress={onSignOut}
                style={({ pressed }) => [styles.signOutOutline, pressed && styles.pressed]}>
                <MaterialIcons name="logout" size={20} color={colors.error} />
                <Text style={styles.signOutOutlineText}>{t('profileHub.signOut')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/(tabs)/profile/delete-account')}
                style={({ pressed }) => [styles.deleteLink, pressed && styles.pressed]}>
                <Text style={styles.deleteLinkText}>{t('profileHub.deleteAccount')}</Text>
              </Pressable>
            </View>

            <Text style={styles.footerVer}>MealMind · v{APP_VERSION}</Text>
          </View>
        </ScrollView>
      </View>
    </MealMindScreen>
  );
}

function createProfileStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    shell: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    loadingText: {
      textAlign: 'center',
      fontFamily: MealMindFonts.body,
      color: colors.onSurfaceVariant,
    },
    scroll: {
      paddingTop: 8,
    },
    maxInner: {
      maxWidth: 672,
      width: '100%',
      alignSelf: 'center',
      paddingHorizontal: 20,
      gap: 24,
    },
    accountBlock: {
      alignItems: 'center',
      gap: 8,
    },
    heroAvatarWrap: {
      position: 'relative',
    },
    heroAvatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      overflow: 'hidden',
      borderWidth: 4,
      borderColor: colors.surfaceContainerLowest,
      backgroundColor: colors.surfaceContainer,
      ...mealMindAmbientShadow(colors),
    },
    heroAvatarImg: {
      width: '100%',
      height: '100%',
    },
    proBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: MealMindRadii.full,
      ...mealMindAmbientShadow(colors),
    },
    proBadgeText: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 10,
      color: colors.onPrimary,
      letterSpacing: 0.5,
    },
    displayName: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 28,
      letterSpacing: -0.56,
      color: colors.onSurface,
      marginTop: 8,
    },
    emailText: {
      fontFamily: MealMindFonts.body,
      fontSize: 14,
      color: colors.outline,
      maxWidth: '100%',
    },
    planChip: {
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: MealMindRadii.full,
      backgroundColor: colors.surfaceContainerHigh,
    },
    planChipText: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 12,
      letterSpacing: 0.6,
      color: colors.onSurfaceVariant,
      textTransform: 'uppercase',
    },
    subCard: {
      borderRadius: MealMindRadii.md,
      overflow: 'hidden',
      minHeight: 160,
      ...mealMindAmbientShadow(colors),
    },
    subBlob1: {
      position: 'absolute',
      top: -48,
      right: -48,
      width: 128,
      height: 128,
      borderRadius: 64,
      backgroundColor: colors.secondary,
      opacity: 0.2,
    },
    subBlob2: {
      position: 'absolute',
      bottom: -32,
      left: -32,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: colors.primary,
      opacity: 0.25,
    },
    subContent: {
      padding: 24,
      gap: 16,
      zIndex: 2,
    },
    subTitle: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 22,
      color: colors.onPrimary,
    },
    subBody: {
      fontFamily: MealMindFonts.body,
      fontSize: 16,
      lineHeight: 24,
      color: colors.onPrimary,
      opacity: 0.92,
    },
    subCta: {
      backgroundColor: colors.surfaceContainerLowest,
      paddingVertical: 14,
      borderRadius: MealMindRadii.md,
      alignItems: 'center',
      ...mealMindAmbientShadow(colors),
    },
    subCtaText: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 15,
      color: colors.primary,
    },
    card: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: MealMindRadii.md,
      padding: 24,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.outlineVariant}40`,
      ...mealMindAmbientShadow(colors),
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    cardTitle: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 22,
      color: colors.onSurface,
    },
    linkText: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 14,
      color: colors.primary,
    },
    tasteGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    tasteCell: {
      flex: 1,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: MealMindRadii.md,
      padding: 14,
      alignItems: 'center',
      gap: 8,
      minWidth: 0,
    },
    tasteKicker: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 11,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: colors.outline,
    },
    tasteValue: {
      fontFamily: MealMindFonts.bodyMedium,
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurface,
      textAlign: 'center',
    },
    sectionKicker: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 14,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.outline,
      paddingHorizontal: 4,
      marginBottom: -12,
    },
    groupCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: MealMindRadii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.outlineVariant}40`,
      overflow: 'hidden',
      ...mealMindAmbientShadow(colors),
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      minHeight: 52,
    },
    settingsRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      flexShrink: 0,
    },
    settingsRowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      justifyContent: 'flex-end',
      minWidth: 0,
    },
    settingsRowLabel: {
      fontFamily: MealMindFonts.body,
      fontSize: 16,
      color: colors.onSurface,
    },
    settingsRowValue: {
      fontFamily: MealMindFonts.body,
      fontSize: 16,
      color: colors.outline,
      flexShrink: 1,
      textAlign: 'right',
    },
    hairline: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: `${colors.outlineVariant}55`,
      marginLeft: 54,
    },
    dangerBlock: {
      gap: 12,
      paddingTop: 8,
    },
    signOutOutline: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: 48,
      borderRadius: MealMindRadii.md,
      borderWidth: 2,
      borderColor: colors.error,
    },
    signOutOutlineText: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 15,
      color: colors.error,
    },
    deleteLink: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    deleteLinkText: {
      fontFamily: MealMindFonts.body,
      fontSize: 14,
      color: colors.error,
      textDecorationLine: 'underline',
    },
    footerVer: {
      textAlign: 'center',
      fontFamily: MealMindFonts.body,
      fontSize: 12,
      color: colors.outlineVariant,
      marginTop: 8,
      letterSpacing: headlineTracking,
    },
    pressed: {
      opacity: 0.92,
    },
  });
}
