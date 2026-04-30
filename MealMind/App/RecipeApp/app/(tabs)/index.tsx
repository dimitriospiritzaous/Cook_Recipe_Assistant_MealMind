import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ChipRow, GlowButton, MealMindScreen, ProfileMenuButton } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { exploreSlugFromRaw, homeFiltersFromExploreSlug } from '@/lib/explore-category-home';
import {
  COOKING_STYLE_CHIPS,
  COOKING_TIME_CHIPS,
  MEAL_TYPE_CHIPS,
} from '@/lib/meal-taxonomy';
import { showErrorToast } from '@/lib/mealmind-toast';
import { pickScanImage } from '@/lib/pick-scan-image';
import { fetchRecentIngredients, type RecentIngredient } from '@/lib/recent-ingredients-api';
import { setPendingRecipeSearch } from '@/lib/recipe-generation-session';
import { takePendingScanIngredients } from '@/lib/scan-session';

/** ~Tailwind `max-w-2xl` from home mock. */
const CONTENT_MAX = 672;

/** GlowButton gradient uses `paddingVertical: MealMindSpace.md + 4` + ~18px label line height. */
const FIND_MEAL_CTA_HEIGHT = MealMindSpace.md + 4 + MealMindSpace.md + 4 + 18;

const RECENT_INITIAL_COUNT = 4;
const RECENT_REVEAL_STEP = 3;

/** Fresh produce flat-lay — already in `RELIABLE_GENERIC_FOOD_BACKDROPS`, reused so we don't add a new image dep. */
const HEALTH_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=85&auto=format&fit=crop';

function firstRouteParam(raw: string | string[] | undefined): string | undefined {
  if (raw == null) {
    return undefined;
  }
  return Array.isArray(raw) ? raw[0] : raw;
}

function formatLastUsed(iso: string): string {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) {
    return 'Recently';
  }
  const diffMs = Date.now() - at;
  const dayMs = 24 * 60 * 60 * 1000;
  if (diffMs < dayMs) {
    return 'Today';
  }
  if (diffMs < dayMs * 2) {
    return 'Yesterday';
  }
  const days = Math.floor(diffMs / dayMs);
  if (days < 7) {
    return `${days} days ago`;
  }
  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return weeks === 1 ? 'Last week' : `${weeks} weeks ago`;
  }
  return 'A while ago';
}

export default function HomeScreen() {
  const router = useRouter();
  const { explore } = useLocalSearchParams<{ explore?: string | string[] }>();
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [timeId, setTimeId] = useState<string | null>('15');
  const [mealTypeId, setMealTypeId] = useState<string | null>('breakfast');
  const [cookingStyleId, setCookingStyleId] = useState<string | null>(null);
  const [recentVisible, setRecentVisible] = useState<number>(RECENT_INITIAL_COUNT);
  const [recentIngredients, setRecentIngredients] = useState<RecentIngredient[]>([]);

  useEffect(() => {
    const slug = exploreSlugFromRaw(firstRouteParam(explore));
    if (slug == null) {
      return;
    }
    const patch = homeFiltersFromExploreSlug(slug);
    if (patch.mealTypeId !== undefined) {
      setMealTypeId(patch.mealTypeId);
    }
    if (patch.cookingStyleId !== undefined) {
      setCookingStyleId(patch.cookingStyleId);
    }
    router.setParams({ explore: undefined });
  }, [explore, router]);

  const loadRecentIngredients = useCallback(() => {
    let alive = true;
    void fetchRecentIngredients(50).then((list) => {
      if (!alive) {
        return;
      }
      setRecentIngredients(list);
      setRecentVisible((prev) => Math.min(Math.max(RECENT_INITIAL_COUNT, prev), Math.max(RECENT_INITIAL_COUNT, list.length)));
    });
    return () => {
      alive = false;
    };
  }, []);

  const appendIngredient = useCallback((name: string) => {
    setIngredientsInput((prev) => {
      const parts = prev
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.some((p) => p.toLowerCase() === name.toLowerCase())) {
        return prev;
      }
      return [...parts, name].join(', ');
    });
  }, []);

  const showMoreRecent = useCallback(() => {
    setRecentVisible((v) => Math.min(recentIngredients.length, v + RECENT_REVEAL_STEP));
  }, [recentIngredients.length]);

  const visibleRecent = recentIngredients.slice(0, recentVisible);
  const canShowMoreRecent = recentVisible < recentIngredients.length;

  useFocusEffect(
    useCallback(() => {
      const cleanupRecent = loadRecentIngredients();
      const names = takePendingScanIngredients();
      if (names.length === 0) {
        return cleanupRecent;
      }
      setIngredientsInput((prev) => {
        const parts = prev
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const merged = [...new Set([...parts, ...names])];
        return merged.join(', ');
      });
      return cleanupRecent;
    }, [loadRecentIngredients]),
  );

  const pushScanPreviewWithUri = (uri: string) => {
    router.push({ pathname: '/scan', params: { imageUri: encodeURIComponent(uri) } });
  };

  const pushScanReviewWithUri = (uri: string) => {
    router.push({ pathname: '/scan-review', params: { imageUri: encodeURIComponent(uri) } });
  };

  const runScanPick = async (source: 'camera' | 'library') => {
    const { uri, message } = await pickScanImage(source);
    if (uri) {
      if (source === 'library') {
        pushScanReviewWithUri(uri);
      } else {
        pushScanPreviewWithUri(uri);
      }
      return;
    }
    if (message) {
      showErrorToast(source === 'camera' ? 'Camera' : 'Photo Library', message);
    }
  };

  const openIngredientScan = () => {
    const startCamera = () => {
      void runScanPick('camera');
    };
    const startLibrary = () => {
      void runScanPick('library');
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Photo Library'],
          cancelButtonIndex: 0,
        },
        (i) => {
          if (i === 1) {
            startCamera();
          } else if (i === 2) {
            startLibrary();
          }
        },
      );
      return;
    }

    Alert.alert('Scan ingredients', 'Take a photo or pick from your library.', [
      { text: 'Take Photo', onPress: startCamera },
      { text: 'Photo Library', onPress: startLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const onFindMyMeal = () => {
    const ingredients = ingredientsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const mealTypeLabel = MEAL_TYPE_CHIPS.find((c) => c.id === mealTypeId)?.label ?? '';
    const cookingTimeLabel = COOKING_TIME_CHIPS.find((c) => c.id === timeId)?.label ?? '';
    const cookingStyleLabel = COOKING_STYLE_CHIPS.find((c) => c.id === cookingStyleId)?.label ?? '';
    void setPendingRecipeSearch({
      ingredients,
      mealTypeLabel,
      cookingTimeLabel,
      cookingStyleLabel,
    }).then(() => router.push('/loading'));
  };

  const scrollBottomPad =
    FIND_MEAL_CTA_HEIGHT + MealMindSpace.sm + MealMindSpace.sm + MealMindSpace.md;

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View style={styles.topBarTitleCol}>
            <Text style={styles.topBarKicker}>Cooking Assistant</Text>
            <Text style={styles.topBarTitle}>MealMind</Text>
          </View>
          <ProfileMenuButton />
        </View>

        <View style={styles.body}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPad }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.formMax}>
              <View style={styles.hero}>
                <Text style={styles.headline}>What should we cook today?</Text>
                <Text style={styles.subhead}>Add ingredients and we’ll pick meals your family will love.</Text>
              </View>

              <View style={styles.searchRow}>
                <MaterialIcons name="search" size={22} color={MealMindColors.outline} />
                <TextInput
                  value={ingredientsInput}
                  onChangeText={setIngredientsInput}
                  placeholder="Enter ingredients (e.g. Chicken, Spinach)"
                  placeholderTextColor={MealMindColors.outlineVariant}
                  style={styles.searchInput}
                />
                <View style={styles.inputActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add from photo"
                    onPress={openIngredientScan}
                    style={({ pressed }) => [styles.iconRound, pressed && styles.pressed]}>
                    <MaterialIcons name="photo-camera" size={20} color={MealMindColors.primary} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.filters}>
                <ChipRow
                  sectionLabel="Meal Type"
                  chips={MEAL_TYPE_CHIPS}
                  selectedId={mealTypeId}
                  onSelect={setMealTypeId}
                  edgeBleed
                />
                <ChipRow
                  sectionLabel="Cooking Style"
                  chips={COOKING_STYLE_CHIPS}
                  selectedId={cookingStyleId}
                  onSelect={(id) => setCookingStyleId((prev) => (prev === id ? null : id))}
                  edgeBleed
                />
                <ChipRow
                  sectionLabel="Cooking Time"
                  chips={COOKING_TIME_CHIPS}
                  selectedId={timeId}
                  onSelect={setTimeId}
                  edgeBleed
                />
              </View>

              <View style={styles.historySection}>
                <View style={styles.historyHeader}>
                  <View>
                    <Text style={styles.historyTitle}>Recent Ingredients</Text>
                    <Text style={styles.historySub}>Tap + to add to your list</Text>
                  </View>
                </View>

                <View style={styles.recentList}>
                  {visibleRecent.map((item, idx) => (
                    <View
                      key={item.name}
                      style={[styles.recentRow, idx === visibleRecent.length - 1 && styles.recentRowLast]}>
                      <View style={styles.recentRowLeft}>
                        <View style={styles.recentBullet}>
                          <MaterialIcons name="restaurant" size={16} color={MealMindColors.onSecondaryContainer} />
                        </View>
                        <View style={styles.recentTextWrap}>
                          <Text style={styles.recentName}>{item.name}</Text>
                          <Text style={styles.recentDate}>{formatLastUsed(item.lastUsedAt)}</Text>
                        </View>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Add ${item.name} to ingredients`}
                        onPress={() => appendIngredient(item.name)}
                        hitSlop={8}
                        style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}>
                        <MaterialIcons name="add" size={20} color={MealMindColors.primary} />
                      </Pressable>
                    </View>
                  ))}
                </View>

                {canShowMoreRecent ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="View more recent ingredients"
                    onPress={showMoreRecent}
                    style={({ pressed }) => [styles.viewMoreCard, pressed && styles.pressed]}>
                    <MaterialIcons name="expand-more" size={20} color={MealMindColors.primary} />
                    <Text style={styles.viewMoreText}>View Full History</Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.recommendWrap}>
                <Image
                  source={{ uri: HEALTH_BANNER_IMAGE }}
                  style={styles.recommendImage}
                  contentFit="cover"
                  accessibilityLabel="Healthy eating banner with fresh produce"
                />
                <View style={styles.recommendOverlay} pointerEvents="none" />
                <View style={styles.recommendContent}>
                  <Text style={styles.recommendBadge}>EAT WELL</Text>
                  <Text style={styles.recommendTitle}>Healthy meals, your way</Text>
                  <Text style={styles.recommendBody}>Cook clean, balanced dishes from what you have.</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.ctaBar}>
            <View style={styles.ctaInner}>
              <GlowButton
                label="Find My Meal"
                trailing={<MaterialIcons name="restaurant-menu" size={22} color={MealMindColors.onPrimary} />}
                style={styles.ctaButton}
                onPress={onFindMyMeal}
              />
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
  body: {
    flex: 1,
    minHeight: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.md + 2,
    backgroundColor: `${MealMindColors.surface}CC`,
    ...MealMindShadow.ambient,
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
  pressed: {
    opacity: 0.75,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingHorizontal: MealMindSpace.lg,
    paddingTop: MealMindSpace.lg,
    flexGrow: 1,
  },
  formMax: {
    maxWidth: CONTENT_MAX,
    width: '100%',
    alignSelf: 'center',
    gap: MealMindSpace.xl,
  },
  hero: {
    gap: 8,
  },
  headline: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: headlineTracking,
    color: MealMindColors.onSurface,
    textAlign: 'center',
  },
  subhead: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 15,
    color: MealMindColors.onSurfaceVariant,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.sm,
    backgroundColor: MealMindColors.surfaceContainerHigh,
    borderRadius: MealMindRadii.md,
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: 8,
    minHeight: 64,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    paddingVertical: 8,
    color: MealMindColors.onSurface,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    flexShrink: 0,
  },
  iconRound: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${MealMindColors.secondaryContainer}80`,
  },
  filters: {
    gap: MealMindSpace.xl,
  },
  historySection: {
    gap: MealMindSpace.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: MealMindSpace.md,
  },
  historyTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 28,
    color: MealMindColors.onSurface,
  },
  historySub: {
    marginTop: 2,
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    color: MealMindColors.onSurfaceVariant,
  },
  clearAll: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 13,
    color: MealMindColors.primary,
  },
  recentList: {
    backgroundColor: MealMindColors.surfaceContainerLow,
    borderRadius: MealMindRadii.md,
    paddingVertical: MealMindSpace.sm,
    paddingHorizontal: MealMindSpace.md,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: MealMindSpace.md,
    paddingVertical: MealMindSpace.sm + 2,
    paddingHorizontal: MealMindSpace.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${MealMindColors.outlineVariant}26`,
  },
  recentRowLast: {
    borderBottomWidth: 0,
  },
  recentRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    flex: 1,
    minWidth: 0,
  },
  recentBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MealMindColors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  recentName: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 15,
    color: MealMindColors.onSurface,
  },
  recentDate: {
    marginTop: 2,
    fontFamily: MealMindFonts.body,
    fontSize: 12,
    color: MealMindColors.onSurfaceVariant,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${MealMindColors.primaryContainer}33`,
  },
  viewMoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: MealMindSpace.md,
    borderRadius: MealMindRadii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: `${MealMindColors.outlineVariant}66`,
    backgroundColor: MealMindColors.surfaceContainerLow,
  },
  viewMoreText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 14,
    color: MealMindColors.primary,
  },
  recommendWrap: {
    height: 200,
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    position: 'relative',
  },
  recommendImage: {
    ...StyleSheet.absoluteFillObject,
  },
  recommendOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  recommendContent: {
    position: 'absolute',
    left: MealMindSpace.lg,
    right: MealMindSpace.lg,
    bottom: MealMindSpace.md,
  },
  recommendBadge: {
    alignSelf: 'flex-start',
    backgroundColor: MealMindColors.primary,
    color: MealMindColors.onPrimary,
    borderRadius: MealMindRadii.full,
    paddingHorizontal: MealMindSpace.sm + 2,
    paddingVertical: 5,
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 11,
    overflow: 'hidden',
  },
  recommendTitle: {
    marginTop: MealMindSpace.sm,
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 22,
    lineHeight: 26,
    color: '#FFFFFF',
  },
  recommendBody: {
    marginTop: 4,
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.85)',
  },
  ctaBar: {
    paddingTop: MealMindSpace.sm,
    paddingBottom: MealMindSpace.sm,
    paddingHorizontal: MealMindSpace.lg,
    backgroundColor: MealMindColors.surface,
    alignItems: 'center',
  },
  ctaInner: {
    width: '100%',
    maxWidth: CONTENT_MAX,
    alignItems: 'stretch',
  },
  ctaButton: {
    alignSelf: 'stretch',
  },
});
