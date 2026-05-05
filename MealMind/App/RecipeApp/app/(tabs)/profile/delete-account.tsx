import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import { showErrorToast, showSuccessToast } from '@/lib/mealmind-toast';
import { deleteMealMindProfileRow } from '@/lib/supabase-profile';
import { signOutMealMind } from '@/lib/supabase-auth';

const KITCHEN_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAr7hwHPWFSoXyaew7NgKG91MI8cPt9j_goY0ECEqoUEmhkMCalwmHrlmw0KG64dePCwjMMu7DO5tZDeZfeQj4HPq1o9hsH9Pq41Maj9gMiqCNkNbaT5Ym4979EEjhiriO_ifK_GeCi1ElNS7ZnhUq0KoQtHkfKwne6VuWpp69Vmysj3P-rS92Bk6pt7PVpL1VRNnkJPIJfolh5V7zIMje9ytCsIDDNCivXsPCdoxJ8Gn5tetJQL8yOps3L-oDdRVrRTmd7Dad-X7s';

export default function ProfileDeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      showSuccessToast('Signed out', 'Your session and data on this device were cleared.');
      router.replace('/signin');
    } catch (e) {
      showErrorToast('Delete account', e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }, [canDelete, router]);

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color={MealMindColors.onSurfaceVariant} />
        </Pressable>
        <Text style={styles.brand}>MealMind</Text>
        <View style={styles.headerAvatar}>
          <MaterialIcons name="person" size={22} color={MealMindColors.outlineVariant} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.main, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.warnIcon}>
            <MaterialIcons name="warning" size={32} color={MealMindColors.error} />
          </View>
          <Text style={styles.title}>Delete Account?</Text>
          <Text style={styles.body}>
            This action signs you out and removes your MealMind profile row from our servers when your project allows
            it. Local favorites and history on this device are cleared. Cloud account removal may still require support
            if your backend policy differs.
          </Text>

          <Text style={styles.inputLabel}>
            To confirm, type <Text style={styles.deleteWord}>DELETE</Text> below
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type DELETE here"
            placeholderTextColor={MealMindColors.outlineVariant}
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
              <ActivityIndicator color={MealMindColors.onSurfaceVariant} />
            ) : (
              <>
                <MaterialIcons name="delete-forever" size={20} color={MealMindColors.onSurfaceVariant} />
                <Text style={styles.deleteBtnText}>Delete My Account</Text>
              </>
            )}
          </Pressable>

          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>

          <View style={styles.imgBlock}>
            <Image source={{ uri: KITCHEN_IMG }} style={styles.kitchenImg} contentFit="cover" />
            <Text style={styles.imgCaption}>We are sorry to see you go. Your data privacy is our priority.</Text>
          </View>
        </View>

        <Text style={styles.footerLegal}>© {new Date().getFullYear()} MealMind. All rights reserved.</Text>
      </ScrollView>
    </MealMindScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: `${MealMindColors.surfaceContainerLowest}E6`,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${MealMindColors.outlineVariant}44`,
  },
  backBtn: { padding: 4, marginLeft: -8 },
  brand: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 20,
    color: MealMindColors.primary,
    letterSpacing: -0.4,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MealMindColors.surfaceContainerHigh,
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
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}44`,
    ...MealMindShadow.ambient,
    // subtle red shadow hint
    shadowColor: MealMindColors.error,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
  },
  warnIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: MealMindColors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 26,
    textAlign: 'center',
    color: MealMindColors.onSurface,
    marginBottom: 12,
  },
  body: {
    fontFamily: MealMindFonts.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: MealMindColors.onSurfaceVariant,
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
    marginBottom: 8,
    marginLeft: 4,
  },
  deleteWord: {
    color: MealMindColors.error,
    fontFamily: MealMindFonts.headlineBold,
    letterSpacing: 2,
  },
  input: {
    height: 48,
    borderRadius: MealMindRadii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: MealMindColors.outlineVariant,
    backgroundColor: MealMindColors.surfaceContainerLow,
    paddingHorizontal: 16,
    fontFamily: MealMindFonts.body,
    fontSize: 16,
    color: MealMindColors.onSurface,
    marginBottom: 20,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: MealMindRadii.md,
    backgroundColor: MealMindColors.surfaceContainerHighest,
  },
  deleteBtnDisabled: { opacity: 0.55 },
  deleteBtnText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 15,
    color: MealMindColors.onSurfaceVariant,
  },
  cancelBtn: { paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontFamily: MealMindFonts.labelSemibold, fontSize: 15, color: MealMindColors.primary },
  imgBlock: { marginTop: 28, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${MealMindColors.outlineVariant}33` },
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
    color: MealMindColors.outline,
  },
  footerLegal: {
    marginTop: 24,
    textAlign: 'center',
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 11,
    color: MealMindColors.outlineVariant,
  },
  pressed: { opacity: 0.9 },
});
