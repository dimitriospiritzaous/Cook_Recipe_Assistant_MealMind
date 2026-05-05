import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import { showErrorToast, showSuccessToast } from '@/lib/mealmind-toast';
import {
  fetchRevenueCatStorePrices,
  getRevenueCatStatusMessage,
  initRevenueCat,
  purchaseRevenueCatPlan,
} from '@/lib/revenuecat';
import type { RevenueCatPlanId } from '@/lib/revenuecat-types';

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBC1pkt9S9ATCQsB7DEoAcSXXq7PzGHti6lf9Ccyb20kS3tbqLqGuIcMUmmmTvh9Q3osS8F2eG43v01g_xJwu-wykQKWqlZIM1_CdbYisWgcgWVJDSONJOAPWLWdHXCRquP1jB80_qxclyJDwC1lgZ6i8_a1rq7KlBabVGyDDSlKAf3Of_rEnkb_NaP5CR7PcOugH7FqTegykalvwdkFhjISSsHqEO3qWkmiqavrF6q-N7Py6anrW3MYtrEPPjl0PDJj-UnFVCntHI';

const PRO_FEATURES: { title: string; sub: string }[] = [
  { title: 'Unlimited AI recipes', sub: 'Custom creations for any craving' },
  { title: 'Personalized nutrition', sub: '' },
  { title: 'Offline access', sub: '' },
  { title: 'Smart grocery lists', sub: '' },
  { title: 'Premium support', sub: '' },
];

const PAID_PLANS: {
  id: RevenueCatPlanId;
  name: string;
  price: string;
  unitLabel: string;
  caption: string;
  recommended: boolean;
}[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$20.00',
    unitLabel: '/month',
    caption: 'Billed every month',
    recommended: false,
  },
  {
    id: 'three_month',
    name: '3 months',
    price: '$50.00',
    unitLabel: '/3 mo',
    caption: '~$16.67/mo · Save vs monthly',
    recommended: false,
  },
  {
    id: 'six_month',
    name: '6 months',
    price: '$100.00',
    unitLabel: '/6 mo',
    caption: '~$16.67/mo · Best value',
    recommended: true,
  },
];

/** Space so scroll content clears the floating CTA (height ≈ pill + minimal footer padding). */
const SCROLL_CLEAR_BELOW_PLANS = 80;

export default function ProfileSubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPaid, setSelectedPaid] = useState<RevenueCatPlanId>(
    PAID_PLANS.find((p) => p.recommended)?.id ?? 'monthly',
  );
  const [storePrices, setStorePrices] = useState<
    Partial<Record<RevenueCatPlanId, { price: string; period: string }>>
  >({});
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const selectedPlan = PAID_PLANS.find((p) => p.id === selectedPaid)!;
  const liveSelected = storePrices[selectedPaid];
  const ctaPriceLine = liveSelected
    ? [liveSelected.price, liveSelected.period].filter(Boolean).join(' ')
    : `${selectedPlan.price}${selectedPlan.unitLabel}`;

  const refreshStorePrices = useCallback(async () => {
    setLoadingPrices(true);
    await initRevenueCat();
    const next = await fetchRevenueCatStorePrices();
    setStorePrices(next);
    setLoadingPrices(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshStorePrices();
    }, [refreshStorePrices]),
  );

  const rcHint = getRevenueCatStatusMessage();
  const storeUnavailable = Platform.OS === 'web';

  useEffect(() => {
    if (!__DEV__ || storeUnavailable || !rcHint) return;
    console.warn('[RevenueCat] Paywall / store status (not shown in UI):', rcHint);
  }, [rcHint, storeUnavailable]);

  const onContinue = useCallback(async () => {
    if (storeUnavailable) {
      showErrorToast('Subscriptions', 'Use the MealMind app on iOS or Android to subscribe.');
      return;
    }
    setPurchasing(true);
    try {
      await initRevenueCat();
      const result = await purchaseRevenueCatPlan(selectedPaid);
      if (result.ok) {
        showSuccessToast('Welcome to Pro', 'Your subscription is active.');
        router.back();
        return;
      }
      if (result.cancelled) return;
      showErrorToast('Purchase', result.message);
    } finally {
      setPurchasing(false);
    }
  }, [router, selectedPaid, storeUnavailable]);

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: SCROLL_CLEAR_BELOW_PLANS }]}>
        <Text style={styles.headline}>Choose Your Path to Health</Text>
        <Text style={styles.lead}>
          Unlock advanced AI-powered tools and personalized nutrition plans designed for your unique lifestyle.
        </Text>

        <View style={styles.grid}>
          <Text style={styles.sectionLabel}>MealMind Pro</Text>
          <Text style={styles.sectionSub}>Pick a billing cycle. Same features on every plan.</Text>
          {storeUnavailable ? (
            <Text style={styles.rcHint}>Subscriptions are not available in the web preview.</Text>
          ) : rcHint ? (
            <Text style={styles.rcHint}>Upgrade is temporarily unavailable. Please try again later.</Text>
          ) : null}
          {loadingPrices && !storeUnavailable ? (
            <View style={styles.pricesLoading}>
              <ActivityIndicator color={MealMindColors.primary} />
              <Text style={styles.pricesLoadingText}>Loading store prices…</Text>
            </View>
          ) : null}

          <View style={styles.paidPlanStack}>
            {PAID_PLANS.map((plan) => {
              const on = selectedPaid === plan.id;
              const live = storePrices[plan.id];
              const priceStr = live?.price ?? plan.price;
              const unitStr = live?.period ?? plan.unitLabel;
              return (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPaid(plan.id)}
                  disabled={purchasing}
                  style={({ pressed }) => [
                    styles.planPaidCard,
                    on && styles.planPaidCardSelected,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${plan.name}, ${priceStr} ${unitStr}`}>
                  <View style={styles.planPaidTop}>
                    <View style={styles.planPaidTitleRow}>
                      <Text style={styles.planPaidName}>{plan.name}</Text>
                      {plan.recommended ? (
                        <View style={styles.recBadgeInline}>
                          <MaterialIcons name="star" size={12} color={MealMindColors.onPrimary} />
                          <Text style={styles.recBadgeInlineText}>RECOMMENDED</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.planPaidPriceRow}>
                      <Text style={styles.planPaidPrice}>{priceStr}</Text>
                      <Text style={styles.planPaidUnit}>{unitStr}</Text>
                    </View>
                    <Text style={styles.planPaidCaption}>{plan.caption}</Text>
                  </View>
                  {on ? <Text style={styles.selectedHintText}>Selected for checkout</Text> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.proFeaturesCard}>
            <Text style={styles.proFeaturesTitle}>Everything in Pro</Text>
            <View style={styles.bullets}>
              {PRO_FEATURES.map((item) => (
                <View key={item.title} style={styles.bulletRow}>
                  <View style={styles.bulletTextCol}>
                    <Text style={styles.bulletTitle}>{item.title}</Text>
                    {item.sub ? <Text style={styles.bulletSub}>{item.sub}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.heroImgWrap}>
              <Image source={{ uri: HERO_IMG }} style={styles.heroImg} contentFit="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.45)']}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.heroCaption}>
                <MaterialIcons name="verified" size={16} color="#fff" />
                <Text style={styles.heroCaptionText}>Join 50,000+ Pro Members</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, storeUnavailable ? { paddingBottom: insets.bottom } : null]}>
        <Pressable
          disabled={purchasing || storeUnavailable}
          style={({ pressed }) => [
            styles.ctaPrimary,
            (purchasing || storeUnavailable) && styles.ctaPrimaryDisabled,
            pressed && styles.pressed,
          ]}
          onPress={() => void onContinue()}>
          {purchasing ? (
            <ActivityIndicator color={MealMindColors.onPrimary} />
          ) : (
            <View style={styles.ctaPrimaryInner}>
              <Text style={styles.ctaPrimaryTitle}>Continue with Pro</Text>
              <Text style={styles.ctaPrimaryDetail}>
                {selectedPlan.name} · {ctaPriceLine}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </MealMindScreen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MealMindSpace.lg,
    paddingBottom: MealMindSpace.sm + 4,
    backgroundColor: 'transparent',
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    marginLeft: -4,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, maxWidth: 900, width: '100%', alignSelf: 'center' },
  headline: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 28,
    lineHeight: 34,
    color: MealMindColors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  lead: {
    fontFamily: MealMindFonts.body,
    fontSize: 17,
    lineHeight: 26,
    color: MealMindColors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    marginBottom: 28,
  },
  grid: { gap: 20 },
  sectionLabel: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 20,
    color: MealMindColors.primary,
  },
  sectionSub: {
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    color: MealMindColors.onSurfaceVariant,
    marginTop: 6,
    marginBottom: 4,
  },
  rcHint: {
    fontFamily: MealMindFonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: MealMindColors.onSurfaceVariant,
    marginBottom: 8,
    opacity: 0.92,
  },
  pricesLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  pricesLoadingText: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
  },
  paidPlanStack: { gap: 12 },
  planPaidCard: {
    borderRadius: MealMindRadii.md,
    padding: 18,
    backgroundColor: MealMindColors.surfaceContainerLow,
    borderWidth: 2,
    borderColor: `${MealMindColors.outlineVariant}44`,
  },
  planPaidCardSelected: {
    borderColor: MealMindColors.primary,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    ...MealMindShadow.ambient,
  },
  planPaidTop: { gap: 4 },
  planPaidTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  planPaidName: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    color: MealMindColors.onSurface,
  },
  recBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MealMindColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  recBadgeInlineText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 0.4,
    color: MealMindColors.onPrimary,
  },
  planPaidPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 8, gap: 6 },
  planPaidPrice: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 28,
    color: MealMindColors.primary,
  },
  planPaidUnit: {
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    color: MealMindColors.onSurfaceVariant,
  },
  planPaidCaption: {
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    color: MealMindColors.onSurfaceVariant,
    marginTop: 4,
  },
  selectedHintText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 12,
    color: MealMindColors.primary,
    marginTop: 12,
  },
  proFeaturesCard: {
    marginTop: 8,
    borderRadius: MealMindRadii.md,
    padding: 24,
    paddingTop: 20,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}55`,
  },
  proFeaturesTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 17,
    color: MealMindColors.onSurface,
    marginBottom: 4,
  },
  bullets: { gap: 0, marginBottom: 20 },
  bulletRow: {
    borderLeftWidth: 3,
    borderLeftColor: `${MealMindColors.primary}40`,
    paddingLeft: 14,
    paddingVertical: 10,
    marginBottom: 2,
  },
  bulletTextCol: { flex: 1 },
  bulletTitle: { fontFamily: MealMindFonts.bodyMedium, fontSize: 16, color: MealMindColors.onSurface },
  bulletSub: { fontFamily: MealMindFonts.body, fontSize: 13, color: MealMindColors.onSurfaceVariant, marginTop: 2 },
  heroImgWrap: {
    height: 128,
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    marginTop: 8,
    position: 'relative',
  },
  heroImg: { ...StyleSheet.absoluteFillObject },
  heroCaption: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroCaptionText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 0,
    backgroundColor: MealMindColors.surface,
  },
  ctaPrimary: {
    backgroundColor: MealMindColors.primary,
    borderRadius: MealMindRadii.full,
    paddingVertical: 14,
    paddingHorizontal: MealMindSpace.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...MealMindShadow.glowCta,
  },
  ctaPrimaryDisabled: { opacity: 0.55 },
  ctaPrimaryInner: {
    alignItems: 'center',
    gap: 2,
  },
  ctaPrimaryTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 17,
    letterSpacing: -0.2,
    color: MealMindColors.onPrimary,
  },
  ctaPrimaryDetail: {
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.88)',
  },
  pressed: { opacity: 0.92 },
});
