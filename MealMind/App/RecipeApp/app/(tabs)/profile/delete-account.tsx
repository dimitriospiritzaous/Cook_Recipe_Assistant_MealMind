import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindScreen } from '@/components/mealmind';
import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindRadii, mealMindAmbientShadow } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import { useI18n } from '@/contexts/i18n-context';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';
import { showErrorToast, showSuccessToast } from '@/lib/mealmind-toast';
import { deleteMealMindProfileRow } from '@/lib/supabase-profile';
import { signOutMealMind } from '@/lib/supabase-auth';

const KITCHEN_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAr7hwHPWFSoXyaew7NgKG91MI8cPt9j_goY0ECEqoUEmhkMCalwmHrlmw0KG64dePCwjMMu7DO5tZDeZfeQj4HPq1o9hsH9Pq41Maj9gMiqCNkNbaT5Ym4979EEjhiriO_ifK_GeCi1ElNS7ZnhUq0KoQtHkfKwne6VuWpp69Vmysj3P-rS92Bk6pt7PVpL1VRNnkJPIJfolh5V7zIMje9ytCsIDDNCivXsPCdoxJ8Gn5tetJQL8yOps3L-oDdRVrRTmd7Dad-X7s';

export default function ProfileDeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useMealMindColors();
  const { t } = useI18n();
  const styles = useMemo(() => createDeleteStyles(colors), [colors]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const canDelete = text.trim().toUpperCase() === 'DELETE';

  const onDelete = useCallback(async () => {
    if (!canDelete) return;
    setBusy(true);
    try {
      const { ok } = await deleteMealMindProfileRow();
      if (!ok && __DEV__) {
        console.warn('[MealMind] Profile row delete skipped or failed (RLS). Still signing out.');
      }
      await signOutMealMind();
      showSuccessToast(t('delete.signedOut'), t('delete.signedOutBody'));
      router.replace('/signin');
    } catch (e) {
      showErrorToast(t('delete.errorTitle'), e instanceof Error ? e.message : t('delete.errorBody'));
    } finally {
      setBusy(false);
    }
  }, [canDelete, router, t]);

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
        </Pressable>
        <Text style={styles.brand}>{t('delete.brand')}</Text>
        <View style={styles.headerAvatar}>
          <MaterialIcons name="person" size={22} color={colors.outlineVariant} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.main, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.warnIcon}>
            <MaterialIcons name="warning" size={32} color={colors.error} />
          </View>
          <Text style={styles.title}>{t('delete.title')}</Text>
          <Text style={styles.body}>{t('delete.body')}</Text>

          <Text style={styles.inputLabel}>
            {t('delete.confirmLabel', { word: '' })}<Text style={styles.deleteWord}>{t('delete.confirmWord')}</Text>
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('delete.placeholder')}
            placeholderTextColor={colors.outlineVariant}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canDelete || busy }}
            disabled={!canDelete || busy}
            onPress={() => void onDelete()}
            style={({ pressed }) => [
              styles.deleteBtn,
              (!canDelete || busy) && styles.deleteBtnDisabled,
              pressed && canDelete && !busy && styles.pressed,
            ]}>
            {busy ? (
              <ActivityIndicator color={colors.onSurfaceVariant} />
            ) : (
              <>
                <MaterialIcons name="delete-forever" size={20} color={colors.onSurfaceVariant} />
                <Text style={styles.deleteBtnText}>{t('delete.btn')}</Text>
              </>
            )}
          </Pressable>

          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}>
            <Text style={styles.cancelText}>{t('delete.cancel')}</Text>
          </Pressable>

          <View style={styles.imgBlock}>
            <Image source={{ uri: KITCHEN_IMG }} style={styles.kitchenImg} contentFit="cover" />
            <Text style={styles.imgCaption}>{t('delete.caption')}</Text>
          </View>
        </View>

        <Text style={styles.footerLegal}>{t('delete.footer', { year: new Date().getFullYear() })}</Text>
      </ScrollView>
    </MealMindScreen>
  );
}

function createDeleteStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: `${colors.surfaceContainerLowest}E6`,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: `${colors.outlineVariant}44`,
    },
    backBtn: { padding: 4, marginLeft: -8 },
    brand: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 20,
      color: colors.primary,
      letterSpacing: -0.4,
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    main: { padding: 20, flexGrow: 1, justifyContent: 'center' },
    card: {
      maxWidth: 440,
      width: '100%',
      alignSelf: 'center',
      borderRadius: 24,
      padding: 28,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.outlineVariant}44`,
      ...mealMindAmbientShadow(colors),
      // subtle red shadow hint
      shadowColor: colors.error,
      shadowOpacity: 0.12,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 16 },
    },
    warnIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: colors.errorContainer,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: 20,
    },
    title: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 26,
      textAlign: 'center',
      color: colors.onSurface,
      marginBottom: 12,
    },
    body: {
      fontFamily: MealMindFonts.body,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      color: colors.onSurfaceVariant,
      marginBottom: 24,
    },
    inputLabel: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
      marginLeft: 4,
    },
    deleteWord: {
      color: colors.error,
      fontFamily: MealMindFonts.headlineBold,
      letterSpacing: 2,
    },
    input: {
      height: 48,
      borderRadius: MealMindRadii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLow,
      paddingHorizontal: 16,
      fontFamily: MealMindFonts.body,
      fontSize: 16,
      color: colors.onSurface,
      marginBottom: 20,
    },
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: 48,
      borderRadius: MealMindRadii.md,
      backgroundColor: colors.surfaceContainerHighest,
    },
    deleteBtnDisabled: { opacity: 0.55 },
    deleteBtnText: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 15,
      color: colors.onSurfaceVariant,
    },
    cancelBtn: { paddingVertical: 14, alignItems: 'center' },
    cancelText: { fontFamily: MealMindFonts.labelSemibold, fontSize: 15, color: colors.primary },
    imgBlock: { marginTop: 28, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${colors.outlineVariant}33` },
    kitchenImg: {
      width: '100%',
      height: 160,
      borderRadius: MealMindRadii.md,
      opacity: 0.4,
    },
    imgCaption: {
      marginTop: 12,
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 12,
      fontStyle: 'italic',
      textAlign: 'center',
      color: colors.outline,
    },
    footerLegal: {
      marginTop: 24,
      textAlign: 'center',
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 11,
      color: colors.outlineVariant,
    },
    pressed: { opacity: 0.9 },
  });
}
