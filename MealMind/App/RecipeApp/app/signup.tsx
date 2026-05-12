import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthSplitLayout } from '@/components/mealmind/auth-split-layout';
import { AppleLogo, GlowButton, GoogleLogo, MealMindScreen } from '@/components/mealmind';
import { SIGNUP_HERO_IMAGE } from '@/constants/auth-assets';
import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindRadii, mealMindAmbientShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useI18n } from '@/contexts/i18n-context';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';
import { getCountryLabel, getCountryPickerItems } from '@/lib/country-picker-data';
import { detectCountryCodeFromDevice } from '@/lib/detect-country-from-location';
import { navigateAfterSuccessfulAuth } from '@/lib/auth-after-signin';
import { showAuthSuccessToast } from '@/lib/mealmind-toast';
import { signInWithOAuthProvider, signUpWithEmail } from '@/lib/supabase-auth';

const FORM_MAX_WIDTH = 480;

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const colors = useMealMindColors();
  const styles = useMemo(() => createSignupStyles(colors), [colors]);
  const countryItems = useMemo(() => getCountryPickerItems(), []);

  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('WORLDWIDE');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const [locationDetecting, setLocationDetecting] = useState(true);
  const userPickedCountryRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const code = await detectCountryCodeFromDevice();
      if (!cancelled && code && !userPickedCountryRef.current) {
        setCountryCode(code);
      }
      if (!cancelled) setLocationDetecting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return countryItems;
    return countryItems.filter(
      (row) => row.label.toLowerCase().includes(q) || row.value.toLowerCase().includes(q),
    );
  }, [countryItems, countryQuery]);

  const openCountryModal = useCallback(() => {
    setCountryQuery('');
    setCountryModalOpen(true);
  }, []);

  const closeCountryModal = useCallback(() => {
    setCountryModalOpen(false);
    setCountryQuery('');
  }, []);

  const onSubmit = useCallback(async () => {
    setError(null);
    const e = email.trim().toLowerCase();
    if (!e.includes('@')) {
      setError(t('signup.errEmail'));
      return;
    }
    if (password.length < 8) {
      setError(t('signup.errPassword'));
      return;
    }
    if (password !== confirm) {
      setError(t('signup.errConfirm'));
      return;
    }
    if (!acceptTerms) {
      setError(t('signup.errTerms'));
      return;
    }

    setSubmitting(true);
    try {
      const result = await signUpWithEmail({ email: e, password, countryCode });
      if (result.needsEmailConfirmation) {
        showAuthSuccessToast(t('signup.successTitle'), t('signup.successBodyConfirm'));
        router.replace('/signin');
        return;
      }
      if (result.session) {
        showAuthSuccessToast(t('signup.successTitle'), t('signup.successBodyWelcome'));
        await navigateAfterSuccessfulAuth(router);
        return;
      }
      showAuthSuccessToast(t('signup.successTitle'), t('signup.successBodySignin'));
      router.replace('/signin');
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError(t('signup.errGeneric'));
    } finally {
      setSubmitting(false);
    }
  }, [acceptTerms, confirm, countryCode, email, password, router, t]);

  const goToSignIn = useCallback(() => {
    router.replace('/signin');
  }, [router]);

  const onOAuth = useCallback(
    async (provider: 'google' | 'apple') => {
      setError(null);
      setOauthBusy(true);
      try {
        await signInWithOAuthProvider(provider);
        await navigateAfterSuccessfulAuth(router);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t('signup.errGeneric'));
        }
      } finally {
        setOauthBusy(false);
      }
    },
    [router, t],
  );

  const stickyBottomPad = insets.bottom + MealMindSpace.lg;

  const formBody = (
    <View style={styles.formColumn}>
      <View style={styles.formDecor} pointerEvents="none">
        <View style={styles.blobTL} />
        <View style={styles.blobBR} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: stickyBottomPad + 160 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={styles.brandRow}>
            <View style={[styles.brandDot, mealMindAmbientShadow(colors)]}>
              <MaterialIcons name="eco" size={18} color={colors.onPrimary} />
            </View>
            <Text style={styles.brand}>MealMind</Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{t('signup.title')}</Text>
            <Text style={styles.subtitle}>{t('signup.sub')}</Text>
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <MaterialIcons name="error-outline" size={18} color={colors.onErrorContainer} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>{t('signup.email')}</Text>
              <View style={styles.field}>
                <MaterialIcons name="mail-outline" size={20} color={colors.primary} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('signup.placeholderEmail')}
                  placeholderTextColor={colors.outline}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>{t('signup.location')}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={openCountryModal}
                style={({ pressed }) => [styles.field, pressed && styles.pressed]}>
                <MaterialIcons name="public" size={20} color={colors.primary} />
                <Text
                  style={[styles.selectText, locationDetecting && styles.selectTextMuted]}
                  numberOfLines={1}>
                  {locationDetecting ? t('signup.detectingLocation') : getCountryLabel(countryCode)}
                </Text>
                {locationDetecting ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <MaterialIcons name="expand-more" size={22} color={colors.onSurfaceVariant} />
                )}
              </Pressable>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>{t('signup.password')}</Text>
              <View style={styles.field}>
                <MaterialIcons name="lock-outline" size={20} color={colors.primary} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.outline}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  hitSlop={10}
                  onPress={() => setShowPassword((v) => !v)}
                  style={({ pressed }) => [styles.iconHit, pressed && styles.pressed]}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={22}
                    color={colors.onSurfaceVariant}
                  />
                </Pressable>
              </View>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>{t('signup.confirm')}</Text>
              <View style={styles.field}>
                <MaterialIcons name="shield" size={20} color={colors.primary} />
                <TextInput
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="••••••••"
                  placeholderTextColor={colors.outline}
                  secureTextEntry={!showConfirm}
                  style={styles.input}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  hitSlop={10}
                  onPress={() => setShowConfirm((v) => !v)}
                  style={({ pressed }) => [styles.iconHit, pressed && styles.pressed]}>
                  <MaterialIcons
                    name={showConfirm ? 'visibility-off' : 'visibility'}
                    size={22}
                    color={colors.onSurfaceVariant}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptTerms }}
              onPress={() => setAcceptTerms((v) => !v)}
              style={({ pressed }) => [styles.termsRow, pressed && styles.pressed]}>
              <View style={[styles.checkbox, acceptTerms && styles.checkboxOn]}>
                {acceptTerms ? <MaterialIcons name="check" size={16} color={colors.onPrimary} /> : null}
              </View>
              <Text style={styles.termsText}>{t('signup.terms')}</Text>
            </Pressable>

            <View style={styles.oauthDivider}>
              <View style={styles.oauthLine} />
              <Text style={styles.oauthLabel}>{t('signup.orJoinWith')}</Text>
              <View style={styles.oauthLine} />
            </View>
            <View style={styles.oauthRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
                disabled={submitting || oauthBusy}
                style={({ pressed }) => [
                  styles.oauthBtn,
                  pressed && styles.pressed,
                  (submitting || oauthBusy) && styles.oauthBtnDisabled,
                ]}
                onPress={() => void onOAuth('google')}>
                <GoogleLogo size={22} />
                <Text style={styles.oauthBtnText}>Google</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue with Apple"
                disabled={submitting || oauthBusy}
                style={({ pressed }) => [
                  styles.oauthBtn,
                  pressed && styles.pressed,
                  (submitting || oauthBusy) && styles.oauthBtnDisabled,
                ]}
                onPress={() => void onOAuth('apple')}>
                <AppleLogo size={22} color={colors.onSurface} />
                <Text style={styles.oauthBtnText}>Apple</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.footerCopy}>
            <Text style={styles.footerText}>
              {t('signup.footerPrefix')}<Text style={styles.link} onPress={goToSignIn}>{t('signup.footerLink')}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.stickyBottom, { paddingBottom: stickyBottomPad }]}>
        <View style={styles.stickyInner}>
          <GlowButton
            label={submitting ? t('signup.ctaBusy') : oauthBusy ? t('signup.ctaOAuth') : t('signup.cta')}
            trailing={<MaterialIcons name="arrow-forward" size={22} color={colors.onPrimary} />}
            disabled={submitting || oauthBusy}
            onPress={() => void onSubmit()}
          />
        </View>
      </View>

      <Modal
        visible={countryModalOpen}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={closeCountryModal}>
        <SafeAreaView style={styles.modalRoot} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('signup.selectLocation')}</Text>
            <Pressable hitSlop={12} onPress={closeCountryModal} style={styles.iconBtn}>
              <MaterialIcons name="close" size={26} color={colors.primary} />
            </Pressable>
          </View>
          <TextInput
            value={countryQuery}
            onChangeText={setCountryQuery}
            placeholder={t('signup.searchLocation')}
            placeholderTextColor={`${colors.onSurfaceVariant}99`}
            style={styles.modalSearch}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          <ScrollView contentContainerStyle={styles.modalList}>
            {filteredCountries.map((row) => {
              const selected = row.value === countryCode;
              return (
                <Pressable
                  key={row.value}
                  onPress={() => {
                    userPickedCountryRef.current = true;
                    setCountryCode(row.value);
                    closeCountryModal();
                  }}
                  style={({ pressed }) => [
                    styles.modalRow,
                    selected && styles.modalRowSelected,
                    pressed && styles.modalRowPressed,
                  ]}>
                  <Text style={[styles.modalRowLabel, selected && styles.modalRowLabelSelected]}>{row.label}</Text>
                  {selected ? <MaterialIcons name="check" size={22} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );

  return (
    <MealMindScreen scroll={false} showFooter={false} contentBottomInset={0}>
      <View style={styles.shell}>
        <AuthSplitLayout
          heroImageUri={SIGNUP_HERO_IMAGE}
          heroTitle={t('signup.heroTitle')}
          heroSubtitle={t('signup.heroSub')}>
          {formBody}
        </AuthSplitLayout>
      </View>
    </MealMindScreen>
  );
}

function createSignupStyles(colors: MealMindPalette) {
  const OUTLINE_BORDER = `${colors.outlineVariant}26`;

  return StyleSheet.create({
    shell: { flex: 1, backgroundColor: colors.surface, overflow: 'hidden' },
    formColumn: { flex: 1, overflow: 'hidden' },
    formDecor: { ...StyleSheet.absoluteFillObject },
    blobTL: {
      position: 'absolute',
      top: 80,
      left: -110,
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: colors.secondaryContainer,
      opacity: 0.22,
    },
    blobBR: {
      position: 'absolute',
      bottom: 140,
      right: -110,
      width: 340,
      height: 340,
      borderRadius: 170,
      backgroundColor: colors.primaryFixed,
      opacity: 0.22,
    },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: MealMindSpace.lg, paddingTop: MealMindSpace.xl },
    inner: { width: '100%', maxWidth: FORM_MAX_WIDTH, alignSelf: 'center' },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: MealMindSpace.xl },
    brandDot: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brand: {
      fontFamily: MealMindFonts.headlineExtraBold,
      fontSize: 22,
      color: colors.onSurface,
      letterSpacing: headlineTracking,
    },
    header: { marginBottom: MealMindSpace.xl },
    title: {
      fontFamily: MealMindFonts.headlineExtraBold,
      fontSize: 36,
      letterSpacing: -0.8,
      color: colors.onSurface,
      marginBottom: 10,
    },
    subtitle: { fontFamily: MealMindFonts.body, fontSize: 16, lineHeight: 24, color: colors.onSurfaceVariant },
    errorCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: colors.errorContainer,
      borderRadius: MealMindRadii.lg,
      padding: MealMindSpace.lg,
      marginBottom: MealMindSpace.lg,
    },
    errorText: { flex: 1, fontFamily: MealMindFonts.bodyMedium, fontSize: 14, lineHeight: 20, color: colors.onErrorContainer },
    form: { gap: MealMindSpace.lg },
    fieldBlock: { gap: 8 },
    label: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 1.3,
      color: colors.onSurfaceVariant,
      marginLeft: 10,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: MealMindRadii.full,
      backgroundColor: colors.surfaceContainer,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: OUTLINE_BORDER,
    },
    input: { flex: 1, fontFamily: MealMindFonts.body, fontSize: 16, color: colors.onSurface },
    selectText: { flex: 1, fontFamily: MealMindFonts.body, fontSize: 16, color: colors.onSurface },
    selectTextMuted: { color: colors.onSurfaceVariant },
    iconHit: { padding: 4, marginRight: -4 },
    termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 6, paddingVertical: 6 },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${colors.outlineVariant}CC`,
      backgroundColor: colors.surfaceContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxOn: { backgroundColor: colors.primary, borderColor: 'transparent' },
    termsText: { flex: 1, fontFamily: MealMindFonts.body, fontSize: 13, color: colors.onSurfaceVariant },
    link: { fontFamily: MealMindFonts.labelSemibold, color: colors.primary },
    oauthDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: MealMindSpace.md,
      marginTop: MealMindSpace.md,
    },
    oauthLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.surfaceContainerHigh },
    oauthLabel: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.outline,
    },
    oauthRow: { flexDirection: 'row', gap: MealMindSpace.md },
    oauthBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: MealMindSpace.md,
      borderRadius: MealMindRadii.full,
      backgroundColor: colors.surfaceContainer,
    },
    oauthBtnDisabled: { opacity: 0.55 },
    oauthBtnText: { fontFamily: MealMindFonts.labelSemibold, fontSize: 14, color: colors.onSurface },
    footerCopy: { marginTop: 32, alignItems: 'center' },
    footerText: { fontFamily: MealMindFonts.body, fontSize: 14, color: colors.onSurfaceVariant },
    pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
    stickyBottom: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: MealMindSpace.lg,
      paddingTop: MealMindSpace.md,
      backgroundColor: `${colors.surface}F2`,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: `${colors.outlineVariant}1A`,
    },
    stickyInner: { width: '100%', maxWidth: FORM_MAX_WIDTH, alignSelf: 'center' },
    modalRoot: { flex: 1, backgroundColor: colors.surface },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: MealMindSpace.lg,
      paddingVertical: MealMindSpace.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: `${colors.outlineVariant}33`,
    },
    modalTitle: { flex: 1, fontFamily: MealMindFonts.headlineBold, fontSize: 18, color: colors.onSurface },
    iconBtn: { padding: 4 },
    modalSearch: {
      marginHorizontal: MealMindSpace.lg,
      marginVertical: MealMindSpace.sm,
      fontFamily: MealMindFonts.body,
      fontSize: 16,
      color: colors.onSurface,
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: MealMindRadii.md,
      paddingHorizontal: MealMindSpace.md,
      paddingVertical: MealMindSpace.sm,
    },
    modalList: { paddingBottom: MealMindSpace.xl },
    modalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: MealMindSpace.md,
      paddingHorizontal: MealMindSpace.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: `${colors.outlineVariant}1F`,
    },
    modalRowPressed: { backgroundColor: colors.surfaceContainerLow },
    modalRowSelected: { backgroundColor: `${colors.primaryFixed}66` },
    modalRowLabel: { flex: 1, fontFamily: MealMindFonts.body, fontSize: 16, color: colors.onSurface },
    modalRowLabelSelected: { fontFamily: MealMindFonts.bodyMedium, color: colors.onPrimaryContainer },
  });
}
