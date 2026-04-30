import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FallbackRecipeImage } from '@/components/FallbackRecipeImage';
import { MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { getFavoriteEntries, removeFavoriteRecipe, type FavoriteEntry } from '@/lib/favorites-storage';
import { showErrorToast, showSuccessToast } from '@/lib/mealmind-toast';
 
/** Shared image height so featured and grid rows align visually. */
const FAVORITES_CARD_IMAGE_HEIGHT = 220;
 
export default function FavoritesScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<FavoriteEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void getFavoriteEntries().then((list) => {
        if (alive) {
          setEntries(list);
          setLoaded(true);
        }
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const featured = entries[0];
  const compact = entries.slice(1);

  const onRemove = useCallback(async (id: string) => {
    try {
      await removeFavoriteRecipe(id);
      setEntries((prev) => prev.filter((e) => e.recipe.id !== id));
      showSuccessToast('Removed from Favorites');
    } catch (e) {
      showErrorToast('Favorites', e instanceof Error ? e.message : 'Could not remove favorite.');
    }
  }, []);

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
              style={styles.iconBtn}>
              <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
            </Pressable>
            <Text style={styles.topTitle} numberOfLines={1}>
              Your Favorites
            </Text>
          </View>
          <Pressable hitSlop={12} style={styles.iconBtn} accessibilityLabel="Search favorites">
            <MaterialIcons name="search" size={24} color={MealMindColors.onSurface} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <View style={styles.pageHead}>
              <View style={styles.pageHeadRow}>
                <Text style={styles.headline}>Your Favorites</Text>
                <Text style={styles.count}>{entries.length} Recipes</Text>
              </View>
              <View style={styles.accentBar} />
            </View>
 
            {loaded && entries.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <MaterialIcons name="favorite-border" size={36} color={MealMindColors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No favorites yet</Text>
                <Text style={styles.emptyBody}>
                  Open a recipe and tap “Save to Favorites”. Your saved recipes will show up here.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.replace('/(tabs)')}
                  style={({ pressed }) => [styles.emptyCta, pressed && styles.pressed]}>
                  <Text style={styles.emptyCtaText}>Find a Recipe</Text>
                </Pressable>
              </View>
            ) : null}

            {featured != null ? (
              <Pressable
                onPress={() => router.push(`/recipe/${featured.recipe.id}`)}
                style={({ pressed }) => [styles.featured, pressed && styles.pressed]}>
                <View style={styles.featuredImageWrap}>
                  <FallbackRecipeImage
                    uri={featured.recipe.heroImage}
                    style={styles.featuredImage}
                    contentFit="cover"
                    useNeutralFallbacks={false}
                    stableKey={`${featured.recipe.id}-fav-featured`}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.78)']}
                    locations={[0.38, 1]}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />
                  <View style={styles.imageOverlayBottom} pointerEvents="none">
                    {featured.recipe.tags.length > 0 ? (
                      <View style={styles.overlayBadgeRow}>
                        {featured.recipe.tags.slice(0, 2).map((t) => (
                          <View key={t.label} style={styles.overlayBadge}>
                            <Text style={styles.overlayBadgeText}>{t.label}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    <Text style={styles.overlayTitle} numberOfLines={2}>
                      {featured.recipe.title}
                    </Text>
                    <Text style={styles.overlayMetaLine} numberOfLines={1}>
                      {[featured.recipe.timeLabel, featured.recipe.kcalLabel, featured.recipe.servingsLabel]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.fabHeart}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Remove from favorites"
                    onPress={() => void onRemove(featured.recipe.id)}>
                    <MaterialIcons name="favorite" size={22} color={MealMindColors.primary} />
                  </Pressable>
                </View>
              </Pressable>
            ) : null}

            {compact.length > 0 ? (
              <View style={styles.grid}>
                {compact.map((entry) => (
                  <Pressable
                    key={entry.recipe.id}
                    onPress={() => router.push(`/recipe/${entry.recipe.id}`)}
                    style={({ pressed }) => [styles.compactCard, pressed && styles.pressed]}>
                    <View style={styles.compactImageWrap}>
                      <FallbackRecipeImage
                        uri={entry.recipe.heroImage}
                        style={styles.compactImage}
                        contentFit="cover"
                        useNeutralFallbacks={false}
                        stableKey={`${entry.recipe.id}-fav-compact`}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.78)']}
                        locations={[0.42, 1]}
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                      />
                      <View style={styles.imageOverlayBottomCompact} pointerEvents="none">
                        {entry.recipe.tags[0] != null ? (
                          <Text style={styles.overlayKicker}>{entry.recipe.tags[0].label}</Text>
                        ) : null}
                        <Text style={styles.overlayTitleCompact} numberOfLines={2}>
                          {entry.recipe.title}
                        </Text>
                        <Text style={styles.overlayMetaLineCompact} numberOfLines={1}>
                          {[entry.recipe.timeLabel, entry.recipe.kcalLabel].filter(Boolean).join(' · ')}
                        </Text>
                      </View>
                      <Pressable
                        style={styles.fabHeartSm}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Remove from favorites"
                        onPress={() => void onRemove(entry.recipe.id)}>
                        <MaterialIcons name="favorite" size={20} color={MealMindColors.primary} />
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
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
  topBarLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    minWidth: 0,
  },
  topTitle: {
    flex: 1,
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 17,
    letterSpacing: headlineTracking,
    color: MealMindColors.primary,
  },
  iconBtn: {
    padding: 4,
  },
  scroll: {
    paddingHorizontal: MealMindSpace.lg,
    paddingTop: MealMindSpace.lg,
    paddingBottom: MealMindSpace.xl * 2,
  },
  inner: {
    maxWidth: 1024,
    width: '100%',
    alignSelf: 'center',
    gap: MealMindSpace.lg + 4,
  },
  pageHead: {
    gap: MealMindSpace.sm,
  },
  pageHeadRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: MealMindSpace.md,
  },
  headline: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.68,
    color: MealMindColors.onSurface,
    flex: 1,
  },
  count: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
    marginBottom: 4,
  },
  accentBar: {
    width: 64,
    height: 6,
    borderRadius: 3,
    backgroundColor: MealMindColors.primary,
  },
  filterRow: {
    gap: MealMindSpace.sm,
    paddingVertical: MealMindSpace.xs,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: MealMindSpace.md + 4,
    paddingVertical: MealMindSpace.sm + 4,
    borderRadius: MealMindRadii.full,
    borderWidth: 1.5,
    minHeight: 40,
    justifyContent: 'center',
  },
  filterChipOn: {
    borderColor: MealMindColors.primary,
    backgroundColor: MealMindColors.primary,
  },
  filterChipOff: {
    backgroundColor: MealMindColors.surface,
    borderColor: `${MealMindColors.outlineVariant}BB`,
  },
  filterChipText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.onSurface,
  },
  filterChipTextOn: {
    color: MealMindColors.onPrimary,
  },
  pressed: {
    opacity: 0.94,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: MealMindSpace.xl * 1.5,
    gap: MealMindSpace.md,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MealMindColors.secondaryContainer,
  },
  emptyTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 22,
    color: MealMindColors.onSurface,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: MealMindColors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 300,
  },
  emptyCta: {
    marginTop: MealMindSpace.sm,
    backgroundColor: MealMindColors.primary,
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.sm + 2,
    borderRadius: MealMindRadii.full,
  },
  emptyCtaText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 14,
    color: MealMindColors.onPrimary,
  },
  featured: {
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    backgroundColor: MealMindColors.surfaceContainerLowest,
    ...MealMindShadow.ambient,
  },
  featuredImageWrap: {
    height: FAVORITES_CARD_IMAGE_HEIGHT,
    width: '100%',
    position: 'relative',
    backgroundColor: MealMindColors.surfaceContainerHigh,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBottom: {
    position: 'absolute',
    left: MealMindSpace.lg,
    right: MealMindSpace.lg,
    bottom: MealMindSpace.lg,
    gap: 6,
    zIndex: 1,
  },
  overlayBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MealMindSpace.xs,
    marginBottom: 2,
  },
  overlayBadge: {
    paddingHorizontal: MealMindSpace.sm,
    paddingVertical: 3,
    borderRadius: MealMindRadii.full,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  overlayBadgeText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.95)',
  },
  overlayTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 22,
    lineHeight: 28,
    color: '#ffffff',
  },
  overlayMetaLine: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  fabHeart: {
    position: 'absolute',
    top: MealMindSpace.md,
    right: MealMindSpace.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...MealMindShadow.ambient,
    zIndex: 2,
  },
  grid: {
    gap: MealMindSpace.lg,
  },
  compactCard: {
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    backgroundColor: MealMindColors.surfaceContainerLowest,
    ...MealMindShadow.ambient,
  },
  compactImageWrap: {
    height: FAVORITES_CARD_IMAGE_HEIGHT,
    width: '100%',
    position: 'relative',
    backgroundColor: MealMindColors.surfaceContainerHigh,
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBottomCompact: {
    position: 'absolute',
    left: MealMindSpace.md,
    right: MealMindSpace.md,
    bottom: MealMindSpace.md,
    gap: 4,
    zIndex: 1,
  },
  overlayKicker: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.88)',
    marginBottom: 2,
  },
  overlayTitleCompact: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    lineHeight: 23,
    color: '#ffffff',
  },
  overlayMetaLineCompact: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 2,
  },
  fabHeartSm: {
    position: 'absolute',
    top: MealMindSpace.sm + 4,
    right: MealMindSpace.sm + 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
