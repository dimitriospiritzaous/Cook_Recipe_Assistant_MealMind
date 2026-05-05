import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FallbackRecipeImage } from '@/components/FallbackRecipeImage';
import { MealMindMainTabFooter, MealMindScreen, ProfileMenuButton } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { generateRecipesFromContext } from '@/lib/ai-recipe-generate';
import { canGenerateAiRecipes } from '@/lib/free-generation-limit';
import { EXPLORE_CATEGORY_CHIPS, type ExploreHomePresetSlug } from '@/lib/explore-category-home';
import { showErrorToast } from '@/lib/mealmind-toast';
import type { MockRecipe } from '@/lib/mealmind-recipe-mocks';
import { RESULTS_FEATURED, RESULTS_SECONDARY } from '@/lib/mealmind-recipe-mocks';
import { getProfile } from '@/lib/profile-storage';
import {
  getLastGeneratedSession,
  setLastGeneratedRecipes,
  type LastGeneratedSession,
} from '@/lib/recipe-generation-session';

const MAX_W = 1152;
const OUTLINE_15 = `${MealMindColors.outlineVariant}24`;
const MAX_AI_RECIPES = 12;

function dedupeNewIds(existing: MockRecipe[], batch: MockRecipe[]): MockRecipe[] {
  const taken = new Set(existing.map((r) => r.id));
  return batch.map((r) => {
    if (!taken.has(r.id)) {
      taken.add(r.id);
      return r;
    }
    const nid = `${r.id}-more-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    taken.add(nid);
    return { ...r, id: nid };
  });
}

/**
 * Shared image-overlay card for every result row — same fixed image height everywhere.
 */
function RecipeOverlayCard({
  imageUri,
  useNeutralFallbacks,
  stableKey,
  title,
  time,
  kcal,
  detail,
  onPress,
}: {
  imageUri: string | undefined;
  useNeutralFallbacks?: boolean;
  stableKey: string;
  title: string;
  time: string;
  kcal?: string;
  detail?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}>
      <View style={styles.heroImageWrap}>
        <FallbackRecipeImage
          uri={imageUri}
          style={styles.heroImage}
          contentFit="cover"
          useNeutralFallbacks={useNeutralFallbacks}
          stableKey={stableKey}
        />
        <View style={styles.heroBottomScrim} pointerEvents="none">
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.72)']}
            locations={[0, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>
        <View style={styles.heroOverlay}>
          <Text style={styles.heroOverlayTitle}>{title}</Text>
          <View style={styles.heroOverlayBottomRow}>
            <View style={styles.heroOverlayBottomLeft}>
              {detail && detail !== '—' ? (
                <Text style={styles.heroOverlayDetailText} numberOfLines={1}>
                  {detail}
                </Text>
              ) : null}
            </View>
            <View style={styles.heroOverlayTimeWrap}>
              <Text style={styles.heroOverlayTime}>{time}</Text>
              {kcal ? (
                <View style={styles.heroOverlayMetaItem}>
                  <MaterialIcons
                    name="local-fire-department"
                    size={16}
                    color="rgba(255,255,255,0.92)"
                  />
                  <Text style={styles.heroOverlayKcalText}>{kcal}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const EXTRA_RESULTS = [
  {
    id: 'rustic-basil-pesto',
    title: 'Rustic Basil Pesto',
    time: '12m',
    badge: 'Fast Food',
    note: '3 Ingredients',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDfj4UoJ1eA8V6-cDxL37r1SSbsUqKD9Yov1FDdCAa9AIecvOxALEI7U7tzheSAhBjGFxDM2Oj-0VSowkJunbGSHzhwwAUwsap_tZpml9ll9oSTNeUPjF-qMLP9Mp0V84uLdVbBtfUjRwksoo3kulQj_i9HfpcioYvBKQh5X_CwbMRoRRRdn9uVLVgADXIsBodj79Cz5XWMSwwbU61XXucsWnbwgYpB5VoUKHIorS6zkmhqXaPGevt8hYV7nLUiIEqHjCSWCxxaFCg',
  },
  {
    id: 'artisan-thin-crust',
    title: 'Artisan Thin Crust',
    time: '45m',
    badge: 'Snacks',
    note: 'Weekend Special',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCckoldbZ4qg3y0p3KL-CqqxiW6l68cJqXbu1f4izoqoZ_htO_Fxt-F5ToZPUFJUiKN4vBFMUWNFpMK-0qz5XaxG-hwR1ou4Q95FPwGRAIoaKr5pUGLw6CuCDMceC_5eTBjKpZCG1vVnnFb6hTtn0rl2yeWAHUvRb7bAU_nxp85MSj5HPZ41Mqb83kztZ55pnpiqmVHhdcKLfBJB11360bD-GLlRC2nri0gPRLK8KR1b6QXZZiAP-Ade1XIgEEniJNj7GL-17dU2C8',
  },
] as const;

function shortTime(label: string): string {
  const noAngles = label.replace(/[<>]/g, '').trim();
  return noAngles.replace(/\s*mins?\s*$/i, 'm').replace(/\s+min\s*$/i, 'm');
}

export default function ResultsScreen() {
  const router = useRouter();
  const [session, setSession] = useState<LastGeneratedSession | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  /** Explore chips that are visually selected — each tap toggles independently (multi-select). */
  const [selectedExploreSlugs, setSelectedExploreSlugs] = useState<ExploreHomePresetSlug[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void getLastGeneratedSession().then((s) => {
        if (!alive) {
          return;
        }
        if (s != null && s.recipes.length > 0) {
          setSession(s);
        } else {
          setSession(null);
        }
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const aiRecipes = session?.recipes;
  const featured = aiRecipes?.[0];
  const restAi = aiRecipes != null && aiRecipes.length > 1 ? aiRecipes.slice(1) : [];
  const canLoadMore =
    Boolean(featured && session?.searchContext && (session.recipes.length ?? 0) < MAX_AI_RECIPES);

  const toggleExploreCategory = useCallback((slug: ExploreHomePresetSlug) => {
    setSelectedExploreSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const onLoadMore = () => {
    if (loadingMore || session == null) {
      return;
    }
    if (!session.searchContext) {
      showErrorToast('Recipes', 'Run Find My Meal on Home first, then you can load more ideas here.');
      return;
    }
    if ((session.recipes?.length ?? 0) >= MAX_AI_RECIPES) {
      showErrorToast('Recipes', 'List is full. Start a new search from Home.');
      return;
    }
    void (async () => {
      if (!(await canGenerateAiRecipes())) {
        showErrorToast(
          'Free recipe used',
          'More AI recipes require MealMind Pro. Upgrade for unlimited generations.',
        );
        router.push('/(tabs)/profile/subscription');
        return;
      }
      setLoadingMore(true);
      try {
        const profile = await getProfile();
        const more = await generateRecipesFromContext(session.searchContext!, profile, {
          excludeRecipeTitles: session.recipes.map((r) => r.title),
        });
        if (more.length === 0) {
          showErrorToast('Recipes', 'Could not generate more. Check API keys or try again.');
          return;
        }
        const added = dedupeNewIds(session.recipes, more);
        const merged = [...session.recipes, ...added].slice(0, MAX_AI_RECIPES);
        await setLastGeneratedRecipes(merged, {
          mealTypeLabel: session.mealTypeLabel,
          cookingTimeLabel: session.cookingTimeLabel,
          cookingStyleLabel: session.cookingStyleLabel,
          searchContext: session.searchContext,
        });
        for (const r of added) {
          const u = r.heroImage?.trim();
          if (u?.startsWith('http')) {
            void Image.prefetch(u);
          }
        }
        const next = await getLastGeneratedSession();
        if (next != null) {
          setSession(next);
        }
      } catch (e) {
        showErrorToast('Recipes', e instanceof Error ? e.message : 'Could not load more.');
      } finally {
        setLoadingMore(false);
      }
    })();
  };

  return (
    <MealMindScreen scroll={false} contentBottomInset={24} footer={<MealMindMainTabFooter />}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.inner}>
          <View style={styles.topBar}>
            <View style={styles.topBarTitleCol}>
              <Text style={styles.topBarKicker}>Cooking Assistant</Text>
              <Text style={styles.topBarTitle}>MealMind</Text>
            </View>
            <ProfileMenuButton />
          </View>

          <View style={styles.pageHeader}>
            <Text style={styles.headline}>Best Picks for You</Text>
            <Text style={styles.lead}>
              {featured
                ? 'Generated from your profile, filters, and ingredients'
                : 'Curated based on your seasonal preferences'}
            </Text>
          </View>

          {featured ? (
            <RecipeOverlayCard
              imageUri={featured.heroImage}
              useNeutralFallbacks
              stableKey={`${featured.id}-hero`}
              title={featured.title}
              time={shortTime(featured.timeLabel)}
              kcal={featured.kcalLabel}
              detail={session?.cookingStyleLabel?.trim() || '—'}
              onPress={() => router.push(`/recipe/${featured.id}`)}
            />
          ) : (
            <RecipeOverlayCard
              imageUri={RESULTS_FEATURED.image}
              stableKey={`${RESULTS_FEATURED.id}-hero`}
              title={RESULTS_FEATURED.title}
              time={RESULTS_FEATURED.time.replace(' mins', 'm')}
              kcal="420 kcal"
              detail="—"
              onPress={() => router.push(`/recipe/${RESULTS_FEATURED.id}`)}
            />
          )}

          {restAi.length > 0
            ? restAi.map((recipe) => (
                <RecipeOverlayCard
                  key={recipe.id}
                  imageUri={recipe.heroImage}
                  useNeutralFallbacks
                  stableKey={`${recipe.id}-card`}
                  title={recipe.title}
                  time={shortTime(recipe.timeLabel)}
                  kcal={recipe.kcalLabel}
                  detail={session?.cookingStyleLabel?.trim() || '—'}
                  onPress={() => router.push(`/recipe/${recipe.id}`)}
                />
              ))
            : (
                <>
                  <RecipeOverlayCard
                    key="mock-a"
                    imageUri={RESULTS_SECONDARY[0].image}
                    stableKey={`${RESULTS_SECONDARY[0].id}-card`}
                    title={RESULTS_SECONDARY[0].title}
                    time={RESULTS_SECONDARY[0].time.replace(' mins', 'm')}
                    kcal="320 kcal"
                    detail="—"
                    onPress={() => router.push(`/recipe/${RESULTS_SECONDARY[0].id}`)}
                  />
                  <RecipeOverlayCard
                    key="mock-b"
                    imageUri={RESULTS_SECONDARY[1].image}
                    stableKey={`${RESULTS_SECONDARY[1].id}-card`}
                    title={RESULTS_SECONDARY[1].title}
                    time={RESULTS_SECONDARY[1].time.replace(' mins', 'm')}
                    kcal="280 kcal"
                    detail="—"
                    onPress={() => router.push(`/recipe/${RESULTS_SECONDARY[1].id}`)}
                  />
                </>
              )}

          {!featured &&
            EXTRA_RESULTS.map((item) => (
              <RecipeOverlayCard
                key={item.id}
                imageUri={item.image}
                stableKey={`${item.id}-extra`}
                title={item.title}
                time={item.time}
                detail={item.note}
                onPress={() => {}}
              />
            ))}

          <View style={styles.loadMoreSection}>
            <Text style={styles.categoryTitle}>Explore More Categories</Text>
            <View style={styles.categoryWrap}>
              {EXPLORE_CATEGORY_CHIPS.map(({ label, slug }) => {
                const selected = selectedExploreSlugs.includes(slug);
                return (
                  <Pressable
                    key={slug}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    accessibilityHint="Tap to toggle; several categories can stay selected"
                    accessibilityState={{ selected }}
                    hitSlop={6}
                    onPress={() => toggleExploreCategory(slug)}
                    style={({ pressed }) => [
                      styles.categoryChip,
                      selected && styles.categoryChipSelected,
                      pressed && styles.categoryChipPressed,
                    ]}>
                    <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Load more recipe ideas"
              disabled={!canLoadMore || loadingMore}
              onPress={onLoadMore}
              style={({ pressed }) => [
                styles.loadMoreBtn,
                pressed && styles.pressed,
                (!canLoadMore || loadingMore) && styles.loadMoreBtnDisabled,
              ]}>
              {loadingMore ? (
                <ActivityIndicator color={MealMindColors.onPrimary} />
              ) : (
                <>
                  <Text style={styles.loadMoreLabel}>Load More</Text>
                  <MaterialIcons name="expand-more" size={20} color={MealMindColors.onPrimary} />
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.bottomPad} />
        </View>
      </ScrollView>
    </MealMindScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: MealMindSpace.xl,
  },
  inner: {
    maxWidth: MAX_W,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: MealMindSpace.lg,
    paddingTop: MealMindSpace.lg,
    gap: MealMindSpace.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: MealMindSpace.sm,
  },
  topBarTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  topBarKicker: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: MealMindColors.onSurfaceVariant,
    marginBottom: 2,
  },
  topBarTitle: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 22,
    letterSpacing: headlineTracking,
    color: MealMindColors.primary,
  },
  pageHeader: {
    gap: 4,
  },
  headline: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: headlineTracking,
    color: MealMindColors.onSurface,
  },
  lead: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
  },
  pressed: {
    opacity: 0.94,
  },
  heroCard: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    ...MealMindShadow.ambient,
    position: 'relative',
  },
  heroImageWrap: {
    height: 240,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '58%',
  },
  heroOverlay: {
    position: 'absolute',
    left: MealMindSpace.lg,
    right: MealMindSpace.lg,
    bottom: MealMindSpace.lg,
    gap: 6,
  },
  heroOverlayBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.sm,
  },
  heroOverlayBottomLeft: {
    flex: 1,
    minWidth: 0,
  },
  heroOverlayTimeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.sm,
    flexShrink: 0,
  },
  heroOverlayTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 22,
    lineHeight: 28,
    color: '#ffffff',
  },
  heroOverlayTime: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    color: MealMindColors.primaryContainer,
  },
  heroOverlayMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroOverlayKcalText: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 17,
    color: 'rgba(255,255,255,0.96)',
  },
  heroOverlayDetailText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.88)',
    flexShrink: 1,
  },
  loadMoreSection: {
    alignItems: 'center',
    paddingVertical: MealMindSpace.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: OUTLINE_15,
    gap: MealMindSpace.lg,
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: MealMindSpace.md,
    paddingHorizontal: MealMindSpace.xl,
    borderRadius: MealMindRadii.md,
    backgroundColor: MealMindColors.primary,
    minHeight: 48,
  },
  loadMoreBtnDisabled: {
    opacity: 0.45,
  },
  loadMoreLabel: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 16,
    color: MealMindColors.onPrimary,
  },
  categoryTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 20,
    color: MealMindColors.onSurface,
  },
  categoryWrap: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: MealMindSpace.sm,
  },
  categoryChip: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: MealMindSpace.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}55`,
  },
  categoryChipSelected: {
    backgroundColor: MealMindColors.primary,
    borderColor: MealMindColors.primary,
  },
  categoryChipPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  categoryChipText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.onSurface,
  },
  categoryChipTextSelected: {
    color: MealMindColors.onPrimary,
  },
  bottomPad: {
    height: MealMindSpace.xl,
  },
});
