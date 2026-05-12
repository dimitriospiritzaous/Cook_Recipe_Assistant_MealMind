import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace, mealMindAmbientShadow } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import { useI18n } from '@/contexts/i18n-context';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';
import { showErrorToast } from '@/lib/mealmind-toast';
import { signOutMealMind } from '@/lib/supabase-auth';

export type ProfileMenuButtonProps = {
  /** Visual offset from the screen right edge (defaults to screen padding). */
  anchorRightInset?: number;
};

function createProfileMenuStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    avatarWell: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceContainerHigh,
      borderWidth: 2,
      borderColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.75,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.18)',
    },
    card: {
      position: 'absolute',
      minWidth: 200,
      borderRadius: MealMindRadii.md,
      backgroundColor: colors.surfaceContainerLowest,
      paddingVertical: MealMindSpace.xs,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.outlineVariant}33`,
      ...mealMindAmbientShadow(colors),
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: MealMindSpace.sm + 2,
      paddingVertical: MealMindSpace.sm + 2,
      paddingHorizontal: MealMindSpace.md,
    },
    itemPressed: {
      backgroundColor: colors.surfaceContainerHigh,
    },
    itemBusy: {
      opacity: 0.6,
    },
    itemText: {
      fontFamily: MealMindFonts.bodyMedium,
      fontSize: 15,
      color: colors.onSurface,
    },
    itemTextDanger: {
      color: colors.error,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: `${colors.outlineVariant}33`,
      marginVertical: 2,
    },
  });
}

/**
 * Circular avatar button in the top bar. Tapping it opens a small popover
 * with "My Profile" and "Sign Out" actions.
 */
export function ProfileMenuButton({ anchorRightInset }: ProfileMenuButtonProps = {}) {
  const { t } = useI18n();
  const colors = useMealMindColors();
  const styles = useMemo(() => createProfileMenuStyles(colors), [colors]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const onProfile = useCallback(() => {
    setOpen(false);
    router.push('/(tabs)/profile');
  }, [router]);

  const onSignOut = useCallback(() => {
    if (busy) return;
    setBusy(true);
    void (async () => {
      try {
        await signOutMealMind();
        setOpen(false);
        router.replace('/signin');
      } catch (e) {
        showErrorToast(
          t('profile.menu.signOutToast'),
          e instanceof Error ? e.message : t('profile.menu.signOutFail'),
        );
      } finally {
        setBusy(false);
      }
    })();
  }, [busy, router, t]);

  const rightInset = anchorRightInset ?? MealMindSpace.lg;
  const topInset = insets.top + MealMindSpace.md + 44;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('profile.menu.open')}
        accessibilityState={{ expanded: open }}
        hitSlop={12}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.avatarWell, pressed && styles.pressed]}>
        <MaterialIcons name="account-circle" size={26} color={colors.primary} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('profile.menu.dismiss')}
          onPress={close}
          style={styles.backdrop}>
          <Pressable
            onPress={() => {}}
            style={[styles.card, { top: topInset, right: rightInset }]}>
            <Pressable
              accessibilityRole="menuitem"
              accessibilityLabel={t('profile.menu.myProfile')}
              onPress={onProfile}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
              <MaterialIcons name="person" size={20} color={colors.onSurface} />
              <Text style={styles.itemText}>{t('profile.menu.myProfile')}</Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              accessibilityRole="menuitem"
              accessibilityLabel={t('profile.menu.signOutA11y')}
              onPress={onSignOut}
              disabled={busy}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed, busy && styles.itemBusy]}>
              <MaterialIcons name="logout" size={20} color={colors.error} />
              <Text style={[styles.itemText, styles.itemTextDanger]}>{t('profile.menu.signOut')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
