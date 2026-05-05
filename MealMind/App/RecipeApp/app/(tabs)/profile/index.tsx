import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
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
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
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
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  trailing?: 'chevron' | 'launch';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.settingsRow, pressed && styles.pressed]}>
      <View style={styles.settingsRowLeft}>
        <MaterialIcons name={icon} size={22} color={MealMindColors.outline} />
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
          color={MealMindColors.outlineVariant}
        />
      </View>
    </Pressable>
  );
}

export default function ProfileHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const planLabel = 'Free Plan';
  const themeRowLabel =
    themePref === 'system' ? 'System' : themePref === 'dark' ? 'Dark' : 'Light';

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
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      </MealMindScreen>
    );
  }

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={styles.shell}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Preferences"
          hitSlop={14}
          onPress={() => router.push('/(tabs)/profile/preferences')}
          style={({ pressed }) => [
            styles.settingsFloating,
            { top: insets.top + 6 },
            pressed && styles.pressed,
          ]}>
          <MaterialIcons name="settings" size={24} color={MealMindColors.primary} />
        </Pressable>

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
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>
              <Text style={styles.displayName}>{displayName}</Text>
              {sessionEmail ? (
                <Text style={styles.emailText} numberOfLines={1}>
                  {sessionEmail}
                </Text>
              ) : (
                <Text style={styles.emailText}>Not signed in</Text>
              )}
              <View style={styles.planChip}>
                <Text style={styles.planChipText}>{planLabel}</Text>
              </View>
            </View>

            {/* Subscription teaser */}
            <View style={styles.subCard}>
              <LinearGradient
                colors={[MealMindColors.primaryContainer, `${MealMindColors.primary}CC`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.subBlob1} />
              <View style={styles.subBlob2} />
              <View style={styles.subContent}>
                <Text style={styles.subTitle}>Current Plan: Free</Text>
                <Text style={styles.subBody}>
                  Unlock personalized AI recipes and nutrition tracking.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/(tabs)/profile/subscription')}
                  style={({ pressed }) => [styles.subCta, pressed && styles.pressed]}>
                  <Text style={styles.subCtaText}>Upgrade to Pro</Text>
                </Pressable>
              </View>
            </View>

            {/* Taste profile summary */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Taste Profile</Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/profile/taste-profile')}
                  style={({ pressed }) => [pressed && styles.pressed]}>
                  <Text style={styles.linkText}>Edit Taste Profile</Text>
                </Pressable>
              </View>
              <View style={styles.tasteGrid}>
                <View style={styles.tasteCell}>
                  <MaterialIcons name="restaurant" size={24} color={MealMindColors.primary} />
                  <Text style={styles.tasteKicker}>Goal</Text>
                  <Text style={styles.tasteValue} numberOfLines={2}>
                    {goalLabel}
                  </Text>
                </View>
                <View style={styles.tasteCell}>
                  <MaterialIcons name="eco" size={24} color={MealMindColors.primary} />
                  <Text style={styles.tasteKicker}>Diet</Text>
                  <Text style={styles.tasteValue} numberOfLines={2}>
                    {dietLabel}
                  </Text>
                </View>
                <View style={styles.tasteCell}>
                  <MaterialIcons name="local-fire-department" size={24} color={MealMindColors.primary} />
                  <Text style={styles.tasteKicker}>Spice</Text>
                  <Text style={styles.tasteValue}>{spiceLabel}</Text>
                </View>
              </View>
            </View>

            {/* Kitchen & Region */}
            <Text style={styles.sectionKicker}>Kitchen & Region</Text>
            <View style={styles.groupCard}>
              <SettingsRow
                icon="public"
                label="Country"
                value={getCountryLabel(p.countryCode)}
                onPress={() => router.push('/(tabs)/profile/kitchen-region')}
              />
              <View style={styles.hairline} />
              <SettingsRow
                icon="balance"
                label="Kitchen Comfort"
                value={KITCHEN_COMFORT_LABELS[p.kitchenComfort]}
                onPress={() => router.push('/(tabs)/profile/kitchen-region')}
              />
              <View style={styles.hairline} />
              <SettingsRow
                icon="restaurant-menu"
                label="Skill Level"
                value={SKILL_LABELS[p.skillLevel]}
                onPress={() => router.push('/(tabs)/profile/kitchen-region')}
              />
            </View>

            {/* App settings */}
            <Text style={styles.sectionKicker}>App Settings</Text>
            <View style={styles.groupCard}>
              <SettingsRow
                icon="language"
                label="Language"
                value={languageLabel(langCode)}
                onPress={() => router.push('/(tabs)/profile/language')}
              />
              <View style={styles.hairline} />
              <SettingsRow
                icon="dark-mode"
                label="Theme"
                value={themeRowLabel}
                onPress={() => router.push('/(tabs)/profile/theme')}
              />
            </View>

            {/* Support */}
            <Text style={styles.sectionKicker}>Support</Text>
            <View style={styles.groupCard}>
              <SettingsRow
                icon="help-center"
                label="Help & FAQ"
                onPress={() => void Linking.openURL(SUPPORT_URL)}
                trailing="launch"
              />
              <View style={styles.hairline} />
              <SettingsRow
                icon="rate-review"
                label="Feedback"
                value="Email us"
                onPress={() => void Linking.openURL('mailto:support@mealmind.app?subject=MealMind%20feedback')}
              />
              <View style={styles.hairline} />
              <SettingsRow
                icon="shield"
                label="Privacy"
                onPress={() => void Linking.openURL(PRIVACY_URL)}
              />
              <View style={styles.hairline} />
              <SettingsRow
                icon="gavel"
                label="Terms"
                onPress={() => void Linking.openURL(TERMS_URL)}
              />
            </View>

            {/* Danger */}
            <View style={styles.dangerBlock}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign out"
                onPress={onSignOut}
                style={({ pressed }) => [styles.signOutOutline, pressed && styles.pressed]}>
                <MaterialIcons name="logout" size={20} color={MealMindColors.error} />
                <Text style={styles.signOutOutlineText}>Sign Out</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/(tabs)/profile/delete-account')}
                style={({ pressed }) => [styles.deleteLink, pressed && styles.pressed]}>
                <Text style={styles.deleteLinkText}>Delete Account</Text>
              </Pressable>
            </View>

            <Text style={styles.footerVer}>MealMind · v{APP_VERSION}</Text>
          </View>
        </ScrollView>
      </View>
    </MealMindScreen>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: MealMindColors.surface,
  },
  loadingText: {
    textAlign: 'center',
    fontFamily: MealMindFonts.body,
    color: MealMindColors.onSurfaceVariant,
  },
  settingsFloating: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${MealMindColors.surfaceContainerLowest}E6`,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}44`,
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
    borderColor: MealMindColors.surfaceContainerLowest,
    backgroundColor: MealMindColors.surfaceContainer,
    ...MealMindShadow.ambient,
  },
  heroAvatarImg: {
    width: '100%',
    height: '100%',
  },
  proBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: MealMindColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: MealMindRadii.full,
    ...MealMindShadow.ambient,
  },
  proBadgeText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    color: MealMindColors.onPrimary,
    letterSpacing: 0.5,
  },
  displayName: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 28,
    letterSpacing: -0.56,
    color: MealMindColors.onSurface,
    marginTop: 8,
  },
  emailText: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    color: MealMindColors.outline,
    maxWidth: '100%',
  },
  planChip: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: MealMindRadii.full,
    backgroundColor: MealMindColors.surfaceContainerHigh,
  },
  planChipText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: MealMindColors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  subCard: {
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    minHeight: 160,
    ...MealMindShadow.ambient,
  },
  subBlob1: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: MealMindColors.secondary,
    opacity: 0.2,
  },
  subBlob2: {
    position: 'absolute',
    bottom: -32,
    left: -32,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: MealMindColors.primary,
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
    color: MealMindColors.onPrimary,
  },
  subBody: {
    fontFamily: MealMindFonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: MealMindColors.onPrimary,
    opacity: 0.92,
  },
  subCta: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    paddingVertical: 14,
    borderRadius: MealMindRadii.md,
    alignItems: 'center',
    ...MealMindShadow.ambient,
  },
  subCtaText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 15,
    color: MealMindColors.primary,
  },
  card: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    padding: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}40`,
    ...MealMindShadow.ambient,
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
    color: MealMindColors.onSurface,
  },
  linkText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 14,
    color: MealMindColors.primary,
  },
  tasteGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  tasteCell: {
    flex: 1,
    backgroundColor: MealMindColors.surfaceContainerLow,
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
    color: MealMindColors.outline,
  },
  tasteValue: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
    color: MealMindColors.onSurface,
    textAlign: 'center',
  },
  sectionKicker: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: MealMindColors.outline,
    paddingHorizontal: 4,
    marginBottom: -12,
  },
  groupCard: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}40`,
    overflow: 'hidden',
    ...MealMindShadow.ambient,
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
    color: MealMindColors.onSurface,
  },
  settingsRowValue: {
    fontFamily: MealMindFonts.body,
    fontSize: 16,
    color: MealMindColors.outline,
    flexShrink: 1,
    textAlign: 'right',
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: `${MealMindColors.outlineVariant}55`,
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
    borderColor: MealMindColors.error,
  },
  signOutOutlineText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 15,
    color: MealMindColors.error,
  },
  deleteLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteLinkText: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    color: MealMindColors.error,
    textDecorationLine: 'underline',
  },
  footerVer: {
    textAlign: 'center',
    fontFamily: MealMindFonts.body,
    fontSize: 12,
    color: MealMindColors.outlineVariant,
    marginTop: 8,
    letterSpacing: headlineTracking,
  },
  pressed: {
    opacity: 0.92,
  },
});
