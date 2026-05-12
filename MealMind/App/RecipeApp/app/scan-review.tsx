import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlowButton } from '@/components/mealmind';
import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useI18n } from '@/contexts/i18n-context';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';
import { enrichScanItemsWithThumbnails, resolveIngredientThumbnail } from '@/lib/ingredient-thumbnails';
import { detectIngredientsFromImage, isVisionScanConfigured } from '@/lib/scan-detect';
import { showErrorToast } from '@/lib/mealmind-toast';
import { cloneDefaultScanIngredients, type ScanIngredientItem } from '@/lib/scan-mock-ingredients';
import { setPendingScanIngredients } from '@/lib/scan-session';

const HEADER_BG = 'rgba(254, 248, 245, 0.92)';
const CONTENT_MAX = 672;

function nextId() {
  return `ing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ScanReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const colors = useMealMindColors();
  const styles = useMemo(() => createScanReviewStyles(colors), [colors]);
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const imageUri = useMemo(() => {
    const raw = params.imageUri;
    if (typeof raw !== 'string' || !raw.length) {
      return null;
    }
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [params.imageUri]);

  const [items, setItems] = useState<ScanIngredientItem[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftDetail, setDraftDetail] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (imageUri) {
        setDetecting(true);
        setItems([]);
        try {
          const found = await detectIngredientsFromImage(imageUri);
          if (!cancelled) {
            setItems(found);
            void enrichScanItemsWithThumbnails(found).then((enriched) => {
              if (!cancelled) {
                setItems(enriched);
              }
            });
          }
        } catch (e) {
          if (!cancelled) {
            setItems([]);
            const msg = e instanceof Error ? e.message : t('scanReview.scanErrorDetail');
            showErrorToast(t('scanReview.scanErrorBody'), msg);
          }
        } finally {
          if (!cancelled) {
            setDetecting(false);
          }
        }
        return;
      }

      if (!cancelled) {
        setDetecting(false);
        const demo = cloneDefaultScanIngredients();
        setItems(demo);
        void enrichScanItemsWithThumbnails(demo).then((enriched) => {
          if (!cancelled) {
            setItems(enriched);
          }
        });
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [imageUri, t]);

  const openAdd = () => {
    setEditorMode('add');
    setEditingId(null);
    setDraftName('');
    setDraftDetail('');
    setEditorOpen(true);
  };

  const openEdit = (row: ScanIngredientItem) => {
    setEditorMode('edit');
    setEditingId(row.id);
    setDraftName(row.name);
    setDraftDetail(row.detail);
    setEditorOpen(true);
  };

  const saveEditor = () => {
    const name = draftName.trim();
    const detail = draftDetail.trim() || t('scanReview.fallbackDetail');
    if (!name) {
      setEditorOpen(false);
      return;
    }
    if (editorMode === 'add') {
      const id = nextId();
      const thumb = imageUri ?? items[0]?.imageUri ?? '';
      setItems((prev) => [...prev, { id, name, detail, imageUri: thumb }]);
      void resolveIngredientThumbnail(name).then((url) => {
        if (url) {
          setItems((prev) => prev.map((r) => (r.id === id ? { ...r, thumbnailUrl: url } : r)));
        }
      });
    } else if (editingId) {
      setItems((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...r, name, detail, thumbnailUrl: undefined } : r,
        ),
      );
      void resolveIngredientThumbnail(name).then((url) => {
        if (url) {
          setItems((prev) =>
            prev.map((r) => (r.id === editingId ? { ...r, thumbnailUrl: url } : r)),
          );
        }
      });
    }
    setEditorOpen(false);
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
  };

  const onConfirm = () => {
    setPendingScanIngredients(items.map((i) => i.name.trim()).filter((n) => n.length > 0));
    router.replace('/(tabs)');
  };

  const footerReserve = Math.max(insets.bottom, 16) + 96;
  const listEmpty = !detecting && items.length === 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close review"
            hitSlop={12}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
            <MaterialIcons name="close" size={24} color={colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {t('scanReview.title')}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Review settings"
          hitSlop={12}
          style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
          <MaterialIcons name="settings" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: footerReserve }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.maxW}>
          <View style={styles.progressBlock}>
            <View style={styles.progressLabels}>
              <View style={styles.progressLeftRow}>
                {detecting ? (
                  <ActivityIndicator size="small" color={colors.primary} style={styles.progressSpinner} />
                ) : null}
                <Text style={styles.progressLeft}>
                  {detecting ? t('scanReview.scanning') : listEmpty ? t('scanReview.noIngredients') : t('scanReview.scanComplete')}
                </Text>
              </View>
              <Text style={styles.progressRight}>
                {detecting ? t('scanReview.analyzing') : t('scanReview.itemsFound', { n: items.length })}
              </Text>
            </View>
            <View style={[styles.progressTrack, detecting && styles.progressTrackScanning]}>
              {detecting ? (
                <View style={styles.progressTrackBusy}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : (
                <LinearGradient
                  colors={[colors.primary, colors.primaryContainer]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
            </View>
          </View>

          <Text style={styles.hero}>{t('scanReview.heroTitle')}</Text>

          <View style={styles.chefCard}>
            <MaterialIcons name="auto-awesome" size={22} color={colors.secondary} style={styles.chefIcon} />
            <View style={styles.chefText}>
              <Text style={styles.chefTitle}>{t('scanReview.chefNote')}</Text>
              <Text style={styles.chefBody}>
                {detecting
                  ? t('scanReview.chefRealNote')
                  : listEmpty
                    ? t('scanReview.chefDemoNote')
                    : t('scanReview.chefTip')}
              </Text>
              {!detecting && imageUri && !isVisionScanConfigured() ? (
                <Text style={styles.demoHint}>
                  {t('scanReview.demoHint')}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.list}>
            {detecting && items.length === 0 ? (
              <View style={styles.listPlaceholder}>
                <Text style={styles.listPlaceholderText}>{t('scanReview.identifyingPlaceholder')}</Text>
              </View>
            ) : null}
            {items.map((row) => (
              <View key={row.id} style={styles.row}>
                <View style={styles.thumbWell}>
                  <Image
                    source={{ uri: row.thumbnailUrl ?? row.imageUri }}
                    style={styles.thumb}
                    contentFit="cover"
                  />
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{row.name}</Text>
                  <Text style={styles.rowSub}>{row.detail}</Text>
                </View>
                <View style={styles.rowActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${row.name}`}
                    disabled={detecting}
                    onPress={() => openEdit(row)}
                    style={({ pressed }) => [styles.iconAct, pressed && !detecting && styles.pressed]}>
                    <MaterialIcons name="edit" size={22} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${row.name}`}
                    disabled={detecting}
                    onPress={() => remove(row.id)}
                    style={({ pressed }) => [styles.iconAct, pressed && !detecting && styles.pressed]}>
                    <MaterialIcons name="delete-outline" size={22} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            ))}
            {!detecting && items.length === 0 ? (
              <View style={styles.listPlaceholder}>
                <Text style={styles.listPlaceholderText}>
                  {t('scanReview.emptyBody')}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('scanReview.addManually')}
            disabled={detecting}
            onPress={openAdd}
            style={({ pressed }) => [
              styles.addDashed,
              detecting && styles.addDisabled,
              pressed && !detecting && styles.addPressed,
            ]}>
            <MaterialIcons name="add" size={22} color={colors.onSurfaceVariant} />
            <Text style={styles.addLabel}>{t('scanReview.addManually')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.ctaBar, { paddingBottom: Math.max(insets.bottom, MealMindSpace.md) }]}>
        <GlowButton
          label={t('scanReview.confirm')}
          onPress={onConfirm}
          disabled={detecting}
          trailing={<MaterialIcons name="check-circle" size={22} color={colors.onPrimary} />}
          style={styles.ctaBtn}
        />
      </View>

      <Modal visible={editorOpen} transparent animationType="fade" onRequestClose={() => setEditorOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditorOpen(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editorMode === 'add' ? t('scanReview.addModalTitle') : t('scanReview.editModalTitle')}</Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder={t('scanReview.namePlaceholder')}
              placeholderTextColor={colors.outlineVariant}
              style={styles.input}
            />
            <TextInput
              value={draftDetail}
              onChangeText={setDraftDetail}
              placeholder={t('scanReview.detailPlaceholder')}
              placeholderTextColor={colors.outlineVariant}
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setEditorOpen(false)}
                style={({ pressed }) => [styles.modalGhost, pressed && styles.pressed]}>
                <Text style={styles.modalGhostLabel}>{t('scanReview.modalCancel')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={saveEditor}
                style={({ pressed }) => [styles.modalPrimary, pressed && styles.pressed]}>
                <Text style={styles.modalPrimaryLabel}>{t('scanReview.modalSave')}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function createScanReviewStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: MealMindSpace.lg,
      minHeight: 56,
      backgroundColor: HEADER_BG,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: `${colors.outlineVariant}33`,
    },
    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: MealMindSpace.md,
      minWidth: 0,
      paddingRight: MealMindSpace.sm,
    },
    headerIcon: {
      padding: 4,
      width: 40,
      alignItems: 'center',
    },
    headerTitle: {
      flexShrink: 1,
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 18,
      letterSpacing: headlineTracking,
      color: colors.onSurface,
    },
    pressed: {
      opacity: 0.72,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: MealMindSpace.lg,
      paddingTop: MealMindSpace.xl,
    },
    maxW: {
      maxWidth: CONTENT_MAX,
      width: '100%',
      alignSelf: 'center',
    },
    progressBlock: {
      marginBottom: MealMindSpace.xl,
    },
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: MealMindSpace.sm,
    },
    progressLeftRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 1,
    },
    progressSpinner: {
      marginBottom: 2,
    },
    progressLeft: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 11,
      letterSpacing: 2,
      color: colors.primary,
      flexShrink: 1,
    },
    progressRight: {
      fontFamily: MealMindFonts.bodyMedium,
      fontSize: 12,
      color: colors.onSurfaceVariant,
    },
    progressTrack: {
      height: 6,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: colors.surfaceContainer,
    },
    progressTrackScanning: {
      height: 36,
    },
    progressTrackBusy: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceContainer,
    },
    hero: {
      fontFamily: MealMindFonts.headlineExtraBold,
      fontSize: 34,
      lineHeight: 40,
      letterSpacing: headlineTracking,
      color: colors.onSurface,
      marginBottom: MealMindSpace.lg,
    },
    chefCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: MealMindSpace.md,
      padding: MealMindSpace.lg,
      borderRadius: MealMindRadii.lg,
      backgroundColor: 'rgba(215, 229, 187, 0.35)',
      borderWidth: 1,
      borderColor: `${colors.secondaryFixed}33`,
      marginBottom: MealMindSpace.xl,
    },
    chefIcon: {
      marginTop: 2,
    },
    chefText: {
      flex: 1,
    },
    chefTitle: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 18,
      color: colors.onSecondaryContainer,
      marginBottom: 6,
    },
    chefBody: {
      fontFamily: MealMindFonts.body,
      fontSize: 15,
      lineHeight: 22,
      color: colors.onSecondaryContainer,
    },
    demoHint: {
      marginTop: MealMindSpace.md,
      fontFamily: MealMindFonts.bodyMedium,
      fontSize: 13,
      lineHeight: 18,
      color: colors.primary,
    },
    list: {
      gap: MealMindSpace.md,
      marginBottom: MealMindSpace.xl,
    },
    listPlaceholder: {
      paddingVertical: MealMindSpace.xl,
      paddingHorizontal: MealMindSpace.md,
      alignItems: 'center',
      borderRadius: MealMindRadii.lg,
      backgroundColor: colors.surfaceContainerLow,
    },
    listPlaceholderText: {
      fontFamily: MealMindFonts.bodyMedium,
      fontSize: 15,
      textAlign: 'center',
      color: colors.onSurfaceVariant,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: MealMindSpace.md,
      padding: MealMindSpace.md,
      borderRadius: MealMindRadii.lg,
      backgroundColor: colors.surfaceContainer,
    },
    thumbWell: {
      width: 64,
      height: 64,
      borderRadius: MealMindRadii.md,
      overflow: 'hidden',
      backgroundColor: colors.surfaceContainerHigh,
    },
    thumb: {
      width: '100%',
      height: '100%',
    },
    rowBody: {
      flex: 1,
      minWidth: 0,
    },
    rowTitle: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 17,
      color: colors.onSurface,
    },
    rowSub: {
      marginTop: 2,
      fontFamily: MealMindFonts.body,
      fontSize: 13,
      color: colors.onSurfaceVariant,
    },
    rowActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    iconAct: {
      padding: 8,
      borderRadius: MealMindRadii.full,
    },
    addDashed: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: MealMindSpace.sm,
      paddingVertical: MealMindSpace.lg,
      borderRadius: MealMindRadii.lg,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.outlineVariant,
      marginBottom: MealMindSpace.xl,
    },
    addPressed: {
      backgroundColor: colors.surfaceContainerLow,
    },
    addDisabled: {
      opacity: 0.45,
    },
    addLabel: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 15,
      color: colors.onSurfaceVariant,
    },
    ctaBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: MealMindSpace.lg,
      paddingTop: MealMindSpace.sm,
      backgroundColor: 'rgba(254, 248, 245, 0.94)',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: `${colors.outlineVariant}26`,
      ...MealMindShadow.ambient,
    },
    ctaBtn: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: CONTENT_MAX,
      borderRadius: MealMindRadii.full,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(29, 27, 26, 0.45)',
      justifyContent: 'center',
      padding: MealMindSpace.lg,
    },
    modalCard: {
      borderRadius: MealMindRadii.lg,
      backgroundColor: colors.surfaceContainerLowest,
      padding: MealMindSpace.lg,
      ...MealMindShadow.ambient,
    },
    modalTitle: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 18,
      color: colors.onSurface,
      marginBottom: MealMindSpace.md,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: MealMindRadii.md,
      paddingHorizontal: MealMindSpace.md,
      paddingVertical: 12,
      fontFamily: MealMindFonts.body,
      fontSize: 16,
      color: colors.onSurface,
      marginBottom: MealMindSpace.sm,
      backgroundColor: colors.surface,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: MealMindSpace.sm,
      marginTop: MealMindSpace.md,
    },
    modalGhost: {
      paddingVertical: 10,
      paddingHorizontal: MealMindSpace.lg,
      borderRadius: MealMindRadii.md,
    },
    modalGhostLabel: {
      fontFamily: MealMindFonts.headlineSemibold,
      fontSize: 15,
      color: colors.primary,
    },
    modalPrimary: {
      paddingVertical: 10,
      paddingHorizontal: MealMindSpace.lg,
      borderRadius: MealMindRadii.md,
      backgroundColor: colors.primary,
    },
    modalPrimaryLabel: {
      fontFamily: MealMindFonts.headlineSemibold,
      fontSize: 15,
      color: colors.onPrimary,
    },
  });
}
