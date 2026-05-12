import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { WebBrowserPresentationStyle } from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FallbackRecipeImage } from '@/components/FallbackRecipeImage';
import { GlowButton, MealMindMainTabFooter, MealMindScreen } from '@/components/mealmind';
import type { MealMindPalette } from '@/constants/mealmind-colors';
import {
  MealMindRadii,
  MealMindSpace,
  mealMindAmbientShadow,
  mealMindGlowCtaShadow,
} from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useI18n } from '@/contexts/i18n-context';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';
import { showErrorToast, showSuccessToast } from '@/lib/mealmind-toast';
import type { MockRecipe } from '@/lib/mealmind-recipe-mocks';
import { getMockRecipe } from '@/lib/mealmind-recipe-mocks';
import { isRecipeFavorited, toggleFavoriteRecipe } from '@/lib/favorites-storage';
import { resolveRecipeTutorialUrl } from '@/lib/recipe-tutorial-video';
import { getGeneratedRecipeById } from '@/lib/recipe-generation-session';

export default function RecipeDetailScreen() {
  const colors = useMealMindColors();
  const { t } = useI18n();
  const styles = useMemo(() => createRecipeDetailStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const rawId = id == null ? undefined : Array.isArray(id) ? id[0] : id;
  const [recipe, setRecipe] = useState<MockRecipe | null>(null);
  /** Generated recipes must not fall back to design-mock dish photos on load errors. */
  const [useNeutralImageFallbacks, setUseNeutralImageFallbacks] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [openingTutorial, setOpeningTutorial] = useState(false);
  const tutorialBusyRef = useRef(false);

  const openTutorialVideo = useCallback(async (r: MockRecipe) => {
    if (tutorialBusyRef.current) {
      return;
    }
    tutorialBusyRef.current = true;
    setOpeningTutorial(true);
    try {
      const url = await resolveRecipeTutorialUrl(r);
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowserPresentationStyle.FULL_SCREEN,
        toolbarColor: colors.surface,
        controlsColor: colors.primary,
      });
    } catch (e) {
      showErrorToast(t('recipe.favErrorTitle'), e instanceof Error ? e.message : t('recipe.videoOpenFail'));
    } finally {
      tutorialBusyRef.current = false;
      setOpeningTutorial(false);
    }
  }, [colors.primary, colors.surface, t]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const generated = rawId ? await getGeneratedRecipeById(rawId) : null;
      if (cancelled) {
        return;
      }
      if (generated != null) {
        setRecipe(generated);
        setUseNeutralImageFallbacks(true);
      } else {
        const mock = getMockRecipe(rawId);
        setRecipe(mock);
        setUseNeutralImageFallbacks(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rawId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!rawId) {
        setFavorited(false);
        return;
      }
      const on = await isRecipeFavorited(rawId);
      if (!cancelled) {
        setFavorited(on);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rawId]);

  const onToggleFavorite = useCallback(async () => {
    if (savingFavorite || recipe == null) {
      return;
    }
    setSavingFavorite(true);
    try {
      const { nowFavorited } = await toggleFavoriteRecipe(recipe);
      setFavorited(nowFavorited);
      showSuccessToast(
        nowFavorited ? t('recipe.savedToFav') : t('recipe.removedFromFav'),
        nowFavorited ? t('recipe.savedToFavBody') : undefined,
      );
    } catch (e) {
      showErrorToast(t('recipe.favErrorTitle'), e instanceof Error ? e.message : t('recipe.favErrorBody'));
    } finally {
      setSavingFavorite(false);
    }
  }, [recipe, savingFavorite, t]);

  if (recipe == null) {
    return (
      <MealMindScreen scroll={false} contentBottomInset={0} footer={<MealMindMainTabFooter />}>
        <View style={[styles.shell, styles.loadingShell]}>
          <View style={styles.topBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12} onPress={() => router.back()} style={styles.iconBtn}>
              <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
            </Pressable>
            <Text style={styles.topTitle} numberOfLines={1}>
              {t('recipe.brandTitle')}
            </Text>
            <View style={styles.iconBtn} />
          </View>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </MealMindScreen>
    );
  }

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} footer={<MealMindMainTabFooter />}>
      <View style={styles.shell}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
          showsVerticalScrollIndicator={false}>
          <View style={styles.heroWrap}>
            <FallbackRecipeImage
              uri={recipe.heroImage}
              style={styles.heroImg}
              contentFit="cover"
              useNeutralFallbacks={useNeutralImageFallbacks}
              stableKey={`${recipe.id}-hero`}
            />
            <LinearGradient colors={['transparent', colors.surface]} locations={[0.35, 1]} style={StyleSheet.absoluteFill} pointerEvents="none" />
            <View style={styles.metaCard}>
              <View style={styles.tagRow}>
                {recipe.tags.map((tag) => (
                  <View
                    key={tag.label}
                    style={[
                      styles.tag,
                      tag.variant === 'secondary' ? styles.tagSecondary : styles.tagTertiary,
                    ]}>
                    <Text style={tag.variant === 'secondary' ? styles.tagTxtSec : styles.tagTxtTer}>{tag.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <View style={styles.metaDivider}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="schedule" size={18} color={colors.primary} />
                  <Text style={styles.metaSmall}>{recipe.timeLabel}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="restaurant" size={18} color={colors.primary} />
                  <Text style={styles.metaSmall}>{recipe.difficultyLabel}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="local-fire-department" size={18} color={colors.primary} />
                  <Text style={styles.metaSmall}>{recipe.kcalLabel}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionPad}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Watch recipe tutorial on YouTube"
              onPress={() => void openTutorialVideo(recipe)}
              disabled={openingTutorial}
              style={({ pressed }) => [styles.videoCard, pressed && styles.pressed, openingTutorial && styles.videoCardBusy]}>
              <FallbackRecipeImage
                uri={recipe.videoThumb}
                style={styles.videoThumb}
                contentFit="cover"
                useNeutralFallbacks={useNeutralImageFallbacks}
                stableKey={`${recipe.id}-video`}
              />
              <View style={styles.videoOverlay} pointerEvents="none">
                <View style={styles.playBtn}>
                  {openingTutorial ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <MaterialIcons name="play-arrow" size={40} color={colors.primary} />
                  )}
                </View>
                <Text style={styles.videoTitle}>{t('recipe.watchVideo')}</Text>
                <Text style={styles.videoSub}>{recipe.subtitle}</Text>
                <Text style={styles.videoHint}>
                  {process.env.EXPO_PUBLIC_YOUTUBE_API_KEY?.trim()
                    ? t('recipe.videoDescYT')
                    : t('recipe.videoDescSearch')}
                </Text>
              </View>
              <View style={styles.hdBadge}>
                <MaterialIcons name="play-circle-outline" size={16} color={colors.onPrimary} />
                <Text style={styles.hdText}>{t('recipe.youtube')}</Text>
              </View>
            </Pressable>

            <View style={styles.ingredientsCard}>
              <View style={styles.sectionTitleRow}>
                <MaterialIcons name="shopping-basket" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>{t('recipe.ingredients')}</Text>
              </View>
              {recipe.ingredients.map((row) => (
                <View key={row.name} style={styles.ingRow}>
                  <View style={styles.ingLeft}>
                    <View style={styles.ingDot} />
                    <Text style={styles.ingName}>{row.name}</Text>
                  </View>
                  <Text style={styles.ingAmt}>{row.amount}</Text>
                </View>
              ))}
              <View style={styles.tipBox}>
                <Text style={styles.tipKicker}>{t('recipe.familyTip')}</Text>
                <Text style={styles.tipBody}>{recipe.familyTip}</Text>
              </View>
            </View>

            <View style={styles.stepsHeader}>
              <MaterialIcons name="restaurant" size={24} color={colors.primary} />
              <Text style={styles.stepsTitle}>{t('recipe.steps')}</Text>
            </View>
            {recipe.steps.map((s) => (
              <View key={s.n} style={[styles.stepCard, s.active ? styles.stepActive : styles.stepIdle]}>
                <View style={styles.stepRow}>
                  <Text style={[styles.stepNum, s.active ? styles.stepNumOn : styles.stepNumOff]}>{s.n}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepTitle}>{s.title}</Text>
                    <Text style={styles.stepBody}>{s.body}</Text>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.nutGrid}>
              {recipe.nutrition.map((n) => (
                <View key={n.label} style={styles.nutCell}>
                  <Text style={styles.nutVal}>{n.value}</Text>
                  <Text style={styles.nutLbl}>{n.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.heroTopBar, { paddingTop: insets.top }]} pointerEvents="box-none">
          <View style={styles.heroTopBarRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
              onPress={() => router.back()}
              style={styles.iconBtn}>
              <MaterialIcons name="arrow-back" size={24} color="rgba(255,255,255,0.96)" />
            </Pressable>
            <Text style={styles.heroTopTitle} numberOfLines={1}>
              {t('recipe.brandTitle')}
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Share" hitSlop={12} style={styles.iconBtn}>
              <MaterialIcons name="share" size={22} color="rgba(255,255,255,0.96)" />
            </Pressable>
          </View>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + MealMindSpace.md }]}>
          <GlowButton
            label={favorited ? t('recipe.saved') : t('recipe.saveFav')}
            trailing={
              savingFavorite ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <MaterialIcons
                  name={favorited ? 'favorite' : 'favorite-border'}
                  size={22}
                  color={colors.onPrimary}
                />
              )
            }
            style={styles.saveBtn}
            onPress={onToggleFavorite}
          />
          <Pressable style={styles.timerBtn} accessibilityLabel="Timer">
            <MaterialIcons name="timer" size={26} color={colors.onSurface} />
          </Pressable>
        </View>
      </View>
    </MealMindScreen>
  );
}

function createRecipeDetailStyles(colors: MealMindPalette) {
  return StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingShell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.md,
    gap: MealMindSpace.sm,
    backgroundColor: 'transparent',
  },
  heroTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  heroTopBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.md,
    gap: MealMindSpace.sm,
  },
  iconBtn: {
    padding: 4,
  },
  topTitle: {
    flex: 1,
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 17,
    letterSpacing: headlineTracking,
    color: colors.primary,
  },
  heroTopTitle: {
    flex: 1,
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 17,
    letterSpacing: headlineTracking,
    color: 'rgba(255,255,255,0.96)',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scroll: {
    flex: 1,
  },
  heroWrap: {
    height: 360,
    width: '100%',
    position: 'relative',
    backgroundColor: colors.surfaceContainerHigh,
  },
  heroImg: {
    ...StyleSheet.absoluteFillObject,
  },
  metaCard: {
    position: 'absolute',
    left: MealMindSpace.lg,
    right: MealMindSpace.lg,
    bottom: MealMindSpace.lg,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.lg,
    backgroundColor: `${colors.surface}CC`,
    ...mealMindAmbientShadow(colors),
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MealMindSpace.sm,
    marginBottom: MealMindSpace.md,
  },
  tag: {
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: 6,
    borderRadius: MealMindRadii.full,
  },
  tagSecondary: {
    backgroundColor: colors.secondaryContainer,
  },
  tagTertiary: {
    backgroundColor: colors.tertiaryFixed,
  },
  tagTxtSec: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 13,
    color: colors.onSecondaryContainer,
  },
  tagTxtTer: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 13,
    color: colors.onTertiaryFixed,
  },
  recipeTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.onSurface,
    marginBottom: MealMindSpace.md,
  },
  metaDivider: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: MealMindSpace.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${colors.outlineVariant}26`,
    paddingTop: MealMindSpace.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaSmall: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurface,
  },
  sectionPad: {
    paddingHorizontal: MealMindSpace.lg,
    paddingTop: MealMindSpace.lg,
    gap: MealMindSpace.lg,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  videoCard: {
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${colors.outlineVariant}1A`,
    ...mealMindAmbientShadow(colors),
  },
  videoCardBusy: {
    opacity: 0.92,
  },
  videoThumb: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: MealMindSpace.sm,
    padding: MealMindSpace.lg,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...mealMindGlowCtaShadow(colors.primary),
  },
  videoTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  videoSub: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
  },
  videoHint: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 4,
  },
  hdBadge: {
    position: 'absolute',
    bottom: MealMindSpace.md,
    right: MealMindSpace.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: MealMindRadii.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  hdText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.onPrimary,
  },
  ingredientsCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.lg,
    gap: MealMindSpace.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.sm,
    marginBottom: MealMindSpace.sm,
  },
  sectionTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 20,
    color: colors.onSurface,
  },
  ingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: MealMindSpace.md,
  },
  ingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    flex: 1,
  },
  ingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: `${colors.primary}66`,
  },
  ingName: {
    fontFamily: MealMindFonts.body,
    fontSize: 16,
    color: colors.onSurface,
  },
  ingAmt: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    backgroundColor: colors.surfaceContainerHighest,
    paddingHorizontal: MealMindSpace.sm + 2,
    paddingVertical: 4,
    borderRadius: MealMindRadii.full,
  },
  tipBox: {
    marginTop: MealMindSpace.md,
    padding: MealMindSpace.md,
    borderRadius: MealMindRadii.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${colors.outlineVariant}1A`,
  },
  tipKicker: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tipBody: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    color: colors.onSecondaryFixedVariant,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.sm,
    marginTop: MealMindSpace.md,
  },
  stepsTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 22,
    color: colors.onSurface,
  },
  stepCard: {
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.lg,
  },
  stepActive: {
    backgroundColor: `${colors.tertiaryContainer}1A`,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  stepIdle: {
    backgroundColor: colors.surfaceContainerLowest,
    ...mealMindAmbientShadow(colors),
  },
  stepRow: {
    flexDirection: 'row',
    gap: MealMindSpace.lg,
    alignItems: 'flex-start',
  },
  stepNum: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 36,
    lineHeight: 40,
  },
  stepNumOn: {
    color: `${colors.primary}4D`,
  },
  stepNumOff: {
    color: colors.outlineVariant,
  },
  stepTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 17,
    color: colors.onSurface,
    marginBottom: 6,
  },
  stepBody: {
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.onSurfaceVariant,
  },
  nutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MealMindSpace.md,
    marginTop: MealMindSpace.md,
    marginBottom: MealMindSpace.xl,
  },
  nutCell: {
    width: '47%',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.md,
    alignItems: 'center',
  },
  nutVal: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 22,
    color: colors.primary,
  },
  nutLbl: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.92,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    paddingTop: MealMindSpace.md,
    paddingHorizontal: MealMindSpace.lg,
    backgroundColor: `${colors.surface}F2`,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${colors.outlineVariant}26`,
  },
  saveBtn: {
    flex: 1,
  },
  timerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${colors.outlineVariant}55`,
  },
  saveFab: {
    position: 'absolute',
    right: MealMindSpace.lg,
    zIndex: 30,
    alignItems: 'flex-end',
  },
  saveFabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: MealMindSpace.sm,
    minHeight: 56,
    minWidth: 56,
    paddingHorizontal: MealMindSpace.sm,
    borderRadius: MealMindRadii.full,
    backgroundColor: colors.primary,
    ...mealMindAmbientShadow(colors),
  },
  saveFabInnerExpanded: {
    paddingHorizontal: MealMindSpace.lg,
  },
  saveFabLabel: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 15,
    color: colors.onPrimary,
  },
  });
}
