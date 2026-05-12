import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import type { MealMindPalette } from '@/constants/mealmind-colors';
import { mealMindAmbientShadow, MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useI18n } from '@/contexts/i18n-context';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';
import { exploreSlugFromRaw, homeFiltersFromExploreSlug } from '@/lib/explore-category-home';
import { canGenerateAiRecipes } from '@/lib/free-generation-limit';
import { useTranslatedTaxonomy } from '@/lib/i18n/use-translated-taxonomy';
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

const HEALTH_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=85&auto=format&fit=crop';

function firstRouteParam(raw: string | string[] | undefined): string | undefined {
  if (raw == null) {
    return undefined;
  }
  return Array.isArray(raw) ? raw[0] : raw;
}

function formatLastUsed(
  iso: string,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) {
    return t('time.recently');
  }
  const diffMs = Date.now() - at;
  const dayMs = 24 * 60 * 60 * 1000;
  if (diffMs < dayMs) {
    return t('time.today');
  }
  if (diffMs < dayMs * 2) {
    return t('time.yesterday');
  }
  const days = Math.floor(diffMs / dayMs);
  if (days < 7) {
    return t('time.daysAgo', { n: days });
  }
  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return weeks === 1 ? t('time.lastWeek') : t('time.weeksAgo', { n: weeks });
  }
  return t('time.whileAgo');
}

function createHomeStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    shell: {
      flex: 1,
      backgroundColor: colors.surface,
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
      backgroundColor: `${colors.surface}CC`,
      ...mealMindAmbientShadow(colors),
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
      color: colors.onSurfaceVariant,
      marginBottom: 2,
    },
    topBarTitle: {
      fontFamily: MealMindFonts.headlineExtraBold,
      fontSize: 22,
      letterSpacing: headlineTracking,
      color: colors.primary,
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
      color: colors.onSurface,
      textAlign: 'center',
    },
    subhead: {
      fontFamily: MealMindFonts.bodyMedium,
      fontSize: 15,
      color: colors.onSurfaceVariant,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: MealMindSpace.sm,
      backgroundColor: colors.surfaceContainerHigh,
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
      color: colors.onSurface,
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
      backgroundColor: `${colors.secondaryContainer}80`,
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
      color: colors.onSurface,
    },
    historySub: {
      marginTop: 2,
      fontFamily: MealMindFonts.body,
      fontSize: 13,
      color: colors.onSurfaceVariant,
    },
    clearAll: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 13,
      color: colors.primary,
    },
    recentList: {
      backgroundColor: colors.surfaceContainerLow,
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
      borderBottomColor: `${colors.outlineVariant}26`,
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
      backgroundColor: colors.secondaryContainer,
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
      color: colors.onSurface,
    },
    recentDate: {
      marginTop: 2,
      fontFamily: MealMindFonts.body,
      fontSize: 12,
      color: colors.onSurfaceVariant,
    },
    addBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primaryContainer}33`,
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
      borderColor: `${colors.outlineVariant}66`,
      backgroundColor: colors.surfaceContainerLow,
    },
    viewMoreText: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 14,
      color: colors.primary,
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
    recommendBottomScrim: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '52%',
    },
    recommendContent: {
      position: 'absolute',
      left: MealMindSpace.lg,
      right: MealMindSpace.lg,
      bottom: MealMindSpace.md,
    },
    recommendBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.primary,
      color: colors.onPrimary,
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
      backgroundColor: colors.surface,
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
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const colors = useMealMindColors();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);
  const { mealTypes, cookingStyles, cookingTimes } = useTranslatedTaxonomy();

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
      setRecentVisible((prev) =>
        Math.min(Math.max(RECENT_INITIAL_COUNT, prev), Math.max(RECENT_INITIAL_COUNT, list.length)),
      );
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

  const runScanPick = useCallback(
    async (source: 'camera' | 'library') => {
      const { uri, message } = await pickScanImage(source);
      if (uri) {
        if (source === 'library') {
          router.push({ pathname: '/scan-review', params: { imageUri: encodeURIComponent(uri) } });
        } else {
          router.push({ pathname: '/scan', params: { imageUri: encodeURIComponent(uri) } });
        }
        return;
      }
      if (message) {
        showErrorToast(
          source === 'camera' ? t('common.camera') : t('common.photoLibrary'),
          message,
        );
      }
    },
    [router, t],
  );

  const openIngredientScan = useCallback(() => {
    const startCamera = () => {
      void runScanPick('camera');
    };
    const startLibrary = () => {
      void runScanPick('library');
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('home.cancel'), t('home.takePhoto'), t('home.photoLibrary')],
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

    Alert.alert(t('home.scanTitle'), t('home.scanMessage'), [
      { text: t('home.takePhoto'), onPress: startCamera },
      { text: t('home.photoLibrary'), onPress: startLibrary },
      { text: t('home.cancel'), style: 'cancel' },
    ]);
  }, [runScanPick, t]);

  const onFindMyMeal = () => {
    void (async () => {
      if (!(await canGenerateAiRecipes())) {
        showErrorToast(t('home.freeLimitTitle'), t('home.freeLimitBody'));
        router.push('/(tabs)/profile/subscription');
        return;
      }
      const ingredients = ingredientsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const mealTypeLabel = mealTypes.find((c) => c.id === mealTypeId)?.label ?? '';
      const cookingTimeLabel = cookingTimes.find((c) => c.id === timeId)?.label ?? '';
      const cookingStyleLabel = cookingStyles.find((c) => c.id === cookingStyleId)?.label ?? '';
      await setPendingRecipeSearch({
        ingredients,
        mealTypeLabel,
        cookingTimeLabel,
        cookingStyleLabel,
      });
      router.push('/loading');
    })();
  };

  const scrollBottomPad =
    FIND_MEAL_CTA_HEIGHT + MealMindSpace.sm + MealMindSpace.sm + MealMindSpace.md;

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View style={styles.topBarTitleCol}>
            <Text style={styles.topBarKicker}>{t('home.kicker')}</Text>
            <Text style={styles.topBarTitle}>{t('home.title')}</Text>
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
                <Text style={styles.headline}>{t('home.headline')}</Text>
                <Text style={styles.subhead}>{t('home.subhead')}</Text>
              </View>

              <View style={styles.searchRow}>
                <MaterialIcons name="search" size={22} color={colors.outline} />
                <TextInput
                  value={ingredientsInput}
                  onChangeText={setIngredientsInput}
                  placeholder={t('home.ingredientsPlaceholder')}
                  placeholderTextColor={colors.outlineVariant}
                  style={styles.searchInput}
                />
                <View style={styles.inputActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('home.addFromPhoto')}
                    onPress={openIngredientScan}
                    style={({ pressed }) => [styles.iconRound, pressed && styles.pressed]}>
                    <MaterialIcons name="photo-camera" size={20} color={colors.primary} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.filters}>
                <ChipRow
                  sectionLabel={t('home.mealType')}
                  chips={mealTypes}
                  selectedId={mealTypeId}
                  onSelect={setMealTypeId}
                  edgeBleed
                />
                <ChipRow
                  sectionLabel={t('home.cookingStyle')}
                  chips={cookingStyles}
                  selectedId={cookingStyleId}
                  onSelect={(id) => setCookingStyleId((prev) => (prev === id ? null : id))}
                  edgeBleed
                />
                <ChipRow
                  sectionLabel={t('home.cookingTime')}
                  chips={cookingTimes}
                  selectedId={timeId}
                  onSelect={setTimeId}
                  edgeBleed
                />
              </View>

              <View style={styles.historySection}>
                <View style={styles.historyHeader}>
                  <View>
                    <Text style={styles.historyTitle}>{t('home.recentTitle')}</Text>
                    <Text style={styles.historySub}>{t('home.recentSub')}</Text>
                  </View>
                </View>

                <View style={styles.recentList}>
                  {visibleRecent.map((item, idx) => (
                    <View
                      key={item.name}
                      style={[styles.recentRow, idx === visibleRecent.length - 1 && styles.recentRowLast]}>
                      <View style={styles.recentRowLeft}>
                        <View style={styles.recentBullet}>
                          <MaterialIcons name="restaurant" size={16} color={colors.onSecondaryContainer} />
                        </View>
                        <View style={styles.recentTextWrap}>
                          <Text style={styles.recentName}>{item.name}</Text>
                          <Text style={styles.recentDate}>{formatLastUsed(item.lastUsedAt, t)}</Text>
                        </View>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('home.addIngredient', { name: item.name })}
                        onPress={() => appendIngredient(item.name)}
                        hitSlop={8}
                        style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}>
                        <MaterialIcons name="add" size={20} color={colors.primary} />
                      </Pressable>
                    </View>
                  ))}
                </View>

                {canShowMoreRecent ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('home.viewMoreRecent')}
                    onPress={showMoreRecent}
                    style={({ pressed }) => [styles.viewMoreCard, pressed && styles.pressed]}>
                    <MaterialIcons name="expand-more" size={20} color={colors.primary} />
                    <Text style={styles.viewMoreText}>{t('home.viewMoreRecent')}</Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.recommendWrap}>
                <Image
                  source={{ uri: HEALTH_BANNER_IMAGE }}
                  style={styles.recommendImage}
                  contentFit="cover"
                  accessibilityLabel={t('home.recommendTitle')}
                />
                <View style={styles.recommendBottomScrim} pointerEvents="none">
                  <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.52)']}
                    locations={[0, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
                <View style={styles.recommendContent}>
                  <Text style={styles.recommendBadge}>{t('home.recommendBadge')}</Text>
                  <Text style={styles.recommendTitle}>{t('home.recommendTitle')}</Text>
                  <Text style={styles.recommendBody}>{t('home.recommendBody')}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.ctaBar}>
            <View style={styles.ctaInner}>
              <GlowButton
                label={t('home.findMyMeal')}
                trailing={<MaterialIcons name="restaurant-menu" size={22} color={colors.onPrimary} />}
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
