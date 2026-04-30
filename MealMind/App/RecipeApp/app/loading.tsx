import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { FallbackRecipeImage } from '@/components/FallbackRecipeImage';
import { MealMindFlowHeader, MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { generateRecipesFromContext, resolveLoadingHeroFromPendingSearch } from '@/lib/ai-recipe-generate';
import { showErrorToast } from '@/lib/mealmind-toast';
import { getProfile } from '@/lib/profile-storage';
import { recordRecentIngredients } from '@/lib/recent-ingredients-api';
import {
  clearLastGeneratedRecipes,
  setLastGeneratedRecipes,
  takePendingRecipeSearch,
} from '@/lib/recipe-generation-session';

const CONTENT_MAX = 440;
const MIN_SPIN_MS = 1200;
/** While recipes are still generating, the bar never passes this (avoids “100% but still loading”). */
const PROGRESS_CAP_UNTIL_DONE = 88;

const HERO_FRAME = 268;
const HERO_RING = 236;
const HERO_RING_INSET = (HERO_FRAME - HERO_RING) / 2;

const STATUS_ROTATION_MS = 3400;

const STATUS_LINES: readonly { headline: string; detail: string }[] = [
  { headline: 'Finding the best meals for you', detail: 'Matching recipes to your ingredients and time.' },
  { headline: 'Tuning flavors for you', detail: 'Weighing what works with what you have on hand.' },
  { headline: 'Almost there', detail: 'Good food takes a moment—thanks for your patience.' },
  { headline: 'Building your lineup', detail: 'Balancing taste, nutrition, and your cooking style.' },
];

export default function LoadingScreen() {
  const router = useRouter();
  const [heroUri, setHeroUri] = useState<string | null>(null);
  const [pct, setPct] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const workDoneRef = useRef(false);
  const floatY = useRef(new Animated.Value(0)).current;
  const heroFade = useRef(new Animated.Value(0)).current;
  const placeholderFade = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const heroRevealDone = useRef(false);

  useEffect(() => {
    workDoneRef.current = false;
    setPct(6);
    let cancelled = false;
    const run = async () => {
      const t0 = Date.now();
      const pending = await takePendingRecipeSearch();
      if (pending) {
        void resolveLoadingHeroFromPendingSearch(pending).then((hero) => {
          if (cancelled || workDoneRef.current) {
            return;
          }
          setHeroUri(hero);
          const u = hero.trim();
          if (u.startsWith('http')) {
            void Image.prefetch(u);
          }
        });
        try {
          const profile = await getProfile();
          const recipes = await generateRecipesFromContext(pending, profile);
          if (recipes.length > 0) {
            await setLastGeneratedRecipes(recipes, {
              mealTypeLabel: pending.mealTypeLabel,
              cookingTimeLabel: pending.cookingTimeLabel,
              cookingStyleLabel: pending.cookingStyleLabel,
              searchContext: pending,
            });
            try {
              await recordRecentIngredients(pending.ingredients);
            } catch {
              // Keep recipe flow resilient when backend history is unavailable.
            }
            for (const r of recipes) {
              const u = r.heroImage?.trim();
              if (u?.startsWith('http')) {
                void Image.prefetch(u);
              }
            }
          } else {
            await clearLastGeneratedRecipes();
          }
        } catch (e) {
          await clearLastGeneratedRecipes();
          showErrorToast('Recipes', e instanceof Error ? e.message : 'Could not generate recipes.');
        }
      }
      workDoneRef.current = true;
      setPct(100);
      const elapsed = Date.now() - t0;
      const wait = Math.max(0, MIN_SPIN_MS - elapsed);
      await new Promise<void>((resolve) => setTimeout(resolve, wait));
      if (!cancelled) {
        router.replace('/results');
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    const id = setInterval(() => {
      setPct((p) => {
        if (workDoneRef.current) {
          return 100;
        }
        if (p >= PROGRESS_CAP_UNTIL_DONE) {
          return PROGRESS_CAP_UNTIL_DONE;
        }
        const next = p + Math.max(0.35, (PROGRESS_CAP_UNTIL_DONE - p) * 0.052);
        return Math.min(PROGRESS_CAP_UNTIL_DONE, Math.round(next * 10) / 10);
      });
    }, 360);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setStatusIdx((i) => (i + 1) % STATUS_LINES.length);
    }, STATUS_ROTATION_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (heroUri == null) {
      return;
    }
    setPct((p) => (workDoneRef.current ? 100 : Math.max(p, 17)));
  }, [heroUri]);

  useLayoutEffect(() => {
    heroRevealDone.current = false;
    if (heroUri == null) {
      heroFade.setValue(0);
      placeholderFade.setValue(1);
      return;
    }
    heroFade.setValue(0);
    placeholderFade.setValue(1);
  }, [heroUri, heroFade, placeholderFade]);

  const onHeroImageLoad = useCallback(() => {
    setPct((p) => (workDoneRef.current ? 100 : Math.max(p, 36)));
    if (heroRevealDone.current) {
      return;
    }
    heroRevealDone.current = true;
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(placeholderFade, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroFade, placeholderFade]);

  useEffect(() => {
    const ring = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    ring.start();
    return () => ring.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, [floatY]);

  const translateY = floatY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const line = STATUS_LINES[statusIdx] ?? STATUS_LINES[0];
  const pctLabel = Math.min(100, Math.round(pct));
  const showCapHint = !workDoneRef.current && pct >= PROGRESS_CAP_UNTIL_DONE - 0.5;

  return (
    <MealMindScreen scroll={false} contentBottomInset={0}>
      <View style={styles.shell}>
        <MealMindFlowHeader title="Meal Planner" showBottomDivider />

        <View style={styles.main}>
          <View style={styles.column}>
            <Animated.View style={[styles.heroWrap, { transform: [{ translateY }] }]}>
              <View style={styles.heroFrame}>
                {heroUri ? (
                  <Animated.View style={[styles.heroImageLayer, { opacity: heroFade }]}>
                    <FallbackRecipeImage
                      uri={heroUri}
                      style={styles.heroImg}
                      contentFit="contain"
                      stableKey={`loading-hero|${heroUri.slice(-48)}`}
                      onLoad={onHeroImageLoad}
                    />
                  </Animated.View>
                ) : null}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.heroPlaceholder,
                    {
                      opacity: placeholderFade,
                    },
                  ]}>
                  <Animated.View
                    style={[
                      styles.heroRing,
                      {
                        opacity: ringOpacity,
                        transform: [{ scale: ringScale }],
                      },
                    ]}
                  />
                  <View style={styles.heroPlaceholderInner}>
                    <ActivityIndicator size="large" color={MealMindColors.primary} />
                    <Text style={styles.heroPlaceholderHint}>Crafting your preview</Text>
                  </View>
                </Animated.View>
              </View>
              <View style={[styles.heroBadge, styles.heroBadgeKcal]}>
                <MaterialIcons name="local-fire-department" size={18} color={MealMindColors.primary} />
              </View>
              <View style={[styles.heroBadge, styles.heroBadgeSpark]}>
                <MaterialIcons name="auto-awesome" size={16} color={MealMindColors.secondary} />
              </View>
            </Animated.View>

            <View style={styles.copyBlock}>
              <Text style={styles.title}>{line.headline}</Text>
              <Text style={styles.subtitle}>{line.detail}</Text>
            </View>

            <View style={styles.progressBlock}>
              <View style={styles.track}>
                <View style={[styles.fillOuter, { width: `${pctLabel}%` }]}>
                  <LinearGradient
                    colors={[MealMindColors.primary, MealMindColors.onPrimaryContainer]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.fillGradient}
                  />
                </View>
              </View>
              <View style={styles.progressMeta}>
                <View style={styles.statusLeft}>
                  <MaterialIcons name="auto-awesome" size={16} color={MealMindColors.primary} />
                  <View style={styles.statusTextCol}>
                    <Text style={styles.statusLabel}>
                      {showCapHint ? 'Still cooking up ideas…' : 'Curating your plate'}
                    </Text>
                    {showCapHint ? (
                      <Text style={styles.statusSub}>Recipes can take a little longer—hang tight.</Text>
                    ) : null}
                  </View>
                </View>
                <Text style={styles.percent}>{pctLabel}%</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </MealMindScreen>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: MealMindColors.surface,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: MealMindSpace.lg,
  },
  column: {
    maxWidth: CONTENT_MAX,
    width: '100%',
    alignItems: 'center',
    gap: MealMindSpace.md,
  },
  heroWrap: {
    width: HERO_FRAME + 24,
    height: HERO_FRAME + 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: MealMindSpace.sm,
  },
  heroFrame: {
    width: HERO_FRAME,
    height: HERO_FRAME,
    borderRadius: HERO_FRAME / 2,
    overflow: 'hidden',
    backgroundColor: MealMindColors.surfaceContainerHigh,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
    ...MealMindShadow.ambient,
    position: 'relative',
  },
  heroImageLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    backgroundColor: MealMindColors.surfaceContainerHigh,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MealMindColors.surfaceContainerHigh,
  },
  heroRing: {
    position: 'absolute',
    left: HERO_RING_INSET,
    top: HERO_RING_INSET,
    width: HERO_RING,
    height: HERO_RING,
    borderRadius: HERO_RING / 2,
    borderWidth: 3,
    borderColor: MealMindColors.primary,
  },
  heroPlaceholderInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: MealMindSpace.sm,
  },
  heroPlaceholderHint: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 13,
    letterSpacing: headlineTracking,
    color: MealMindColors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: MealMindSpace.md,
  },
  heroBadge: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...MealMindShadow.ambient,
  },
  heroBadgeKcal: {
    top: 10,
    right: 2,
  },
  heroBadgeSpark: {
    bottom: 14,
    left: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  copyBlock: {
    alignItems: 'center',
    gap: 6,
    minHeight: 72,
    paddingHorizontal: MealMindSpace.sm,
  },
  title: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: headlineTracking,
    textAlign: 'center',
    color: MealMindColors.onSurface,
  },
  subtitle: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: MealMindColors.onSurfaceVariant,
    maxWidth: 340,
  },
  progressBlock: {
    width: '100%',
    gap: MealMindSpace.sm,
    marginTop: MealMindSpace.sm,
  },
  track: {
    width: '100%',
    height: 10,
    borderRadius: MealMindRadii.full,
    backgroundColor: MealMindColors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  fillOuter: {
    height: '100%',
    borderRadius: MealMindRadii.full,
    overflow: 'hidden',
    minWidth: 0,
  },
  fillGradient: {
    flex: 1,
    width: '100%',
    minHeight: 10,
  },
  progressMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: MealMindSpace.md,
  },
  statusLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  statusTextCol: {
    flex: 1,
    gap: 2,
  },
  statusLabel: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 13,
    color: MealMindColors.primary,
  },
  statusSub: {
    fontFamily: MealMindFonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: MealMindColors.onSurfaceVariant,
  },
  percent: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 14,
    letterSpacing: 0.5,
    color: MealMindColors.onSurface,
    marginTop: 1,
  },
});
