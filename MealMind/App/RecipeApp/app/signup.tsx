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
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { getCountryLabel, getCountryPickerItems } from '@/lib/country-picker-data';
import { detectCountryCodeFromDevice } from '@/lib/detect-country-from-location';
import { navigateAfterSuccessfulAuth } from '@/lib/auth-after-signin';
import { showAuthSuccessToast } from '@/lib/mealmind-toast';
import { signInWithOAuthProvider, signUpWithEmail } from '@/lib/supabase-auth';

const FORM_MAX_WIDTH = 480;
const OUTLINE_BORDER = `${MealMindColors.outlineVariant}26`;

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the Terms and Privacy Policy.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await signUpWithEmail({ email: e, password, countryCode });
      if (result.needsEmailConfirmation) {
        showAuthSuccessToast('Account created', 'Confirm your email, then sign in below.');
        router.replace('/signin');
        return;
      }
      showAuthSuccessToast('Account created', 'You can sign in with your email and password.');
      router.replace('/signin');
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [acceptTerms, confirm, countryCode, email, password, router]);

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
          setError('Something went wrong. Please try again.');
        }
      } finally {
        setOauthBusy(false);
      }
    },
    [router],
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
            <View style={[styles.brandDot, MealMindShadow.glowCta]}>
              <MaterialIcons name="eco" size={18} color={MealMindColors.onPrimary} />
            </View>
            <Text style={styles.brand}>MealMind</Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Join the Hearth</Text>
            <Text style={styles.subtitle}>
              Begin your culinary journey today. We’ll help you curate your kitchen with mindful meal planning.
            </Text>
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <MaterialIcons name="error-outline" size={18} color={MealMindColors.onErrorContainer} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.field}>
                <MaterialIcons name="mail-outline" size={20} color={MealMindColors.primary} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="chef@mealmind.com"
                  placeholderTextColor={MealMindColors.outline}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Location</Text>
              <Pressable
                accessibilityRole="button"
                onPress={openCountryModal}
                style={({ pressed }) => [styles.field, pressed && styles.pressed]}>
                <MaterialIcons name="public" size={20} color={MealMindColors.primary} />
                <Text
                  style={[styles.selectText, locationDetecting && styles.selectTextMuted]}
                  numberOfLines={1}>
                  {locationDetecting ? 'Finding your location…' : getCountryLabel(countryCode)}
                </Text>
                {locationDetecting ? (
                  <ActivityIndicator size="small" color={MealMindColors.primary} />
                ) : (
                  <MaterialIcons name="expand-more" size={22} color={MealMindColors.onSurfaceVariant} />
                )}
              </Pressable>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.field}>
                <MaterialIcons name="lock-outline" size={20} color={MealMindColors.primary} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={MealMindColors.outline}
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
                    color={MealMindColors.onSurfaceVariant}
                  />
                </Pressable>
              </View>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Confirm</Text>
              <View style={styles.field}>
                <MaterialIcons name="shield" size={20} color={MealMindColors.primary} />
                <TextInput
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="••••••••"
                  placeholderTextColor={MealMindColors.outline}
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
                    color={MealMindColors.onSurfaceVariant}
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
                {acceptTerms ? <MaterialIcons name="check" size={16} color={MealMindColors.onPrimary} /> : null}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.link}>Terms</Text> and <Text style={styles.link}>Privacy</Text>.
              </Text>
            </Pressable>

            <View style={styles.oauthDivider}>
              <View style={styles.oauthLine} />
              <Text style={styles.oauthLabel}>Or join with</Text>
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
                <AppleLogo size={22} color={MealMindColors.onSurface} />
                <Text style={styles.oauthBtnText}>Apple</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.footerCopy}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.link} onPress={goToSignIn}>Sign in</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.stickyBottom, { paddingBottom: stickyBottomPad }]}>
        <View style={styles.stickyInner}>
          <GlowButton
            label={submitting ? 'Creating…' : oauthBusy ? 'Opening browser…' : 'Create account'}
            trailing={<MaterialIcons name="arrow-forward" size={22} color={MealMindColors.onPrimary} />}
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
            <Text style={styles.modalTitle}>Select your location</Text>
            <Pressable hitSlop={12} onPress={closeCountryModal} style={styles.iconBtn}>
              <MaterialIcons name="close" size={26} color={MealMindColors.primary} />
            </Pressable>
          </View>
          <TextInput
            value={countryQuery}
            onChangeText={setCountryQuery}
            placeholder="Search"
            placeholderTextColor={`${MealMindColors.onSurfaceVariant}99`}
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
                  {selected ? <MaterialIcons name="check" size={22} color={MealMindColors.primary} /> : null}
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
          heroTitle="The Art of No Waste."
          heroSubtitle="Join a community of modern chefs turning every leftover into a culinary masterpiece.">
          {formBody}
        </AuthSplitLayout>
      </View>
    </MealMindScreen>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: MealMindColors.surface, overflow: 'hidden' },
  formColumn: { flex: 1, overflow: 'hidden' },
  formDecor: { ...StyleSheet.absoluteFillObject },
  blobTL: {
    position: 'absolute',
    top: 80,
    left: -110,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: MealMindColors.secondaryContainer,
    opacity: 0.22,
  },
  blobBR: {
    position: 'absolute',
    bottom: 140,
    right: -110,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: MealMindColors.primaryFixed,
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
    backgroundColor: MealMindColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 22,
    color: MealMindColors.onSurface,
    letterSpacing: headlineTracking,
  },
  header: { marginBottom: MealMindSpace.xl },
  title: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 36,
    letterSpacing: -0.8,
    color: MealMindColors.onSurface,
    marginBottom: 10,
  },
  subtitle: { fontFamily: MealMindFonts.body, fontSize: 16, lineHeight: 24, color: MealMindColors.onSurfaceVariant },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: MealMindColors.errorContainer,
    borderRadius: MealMindRadii.lg,
    padding: MealMindSpace.lg,
    marginBottom: MealMindSpace.lg,
  },
  errorText: { flex: 1, fontFamily: MealMindFonts.bodyMedium, fontSize: 14, lineHeight: 20, color: MealMindColors.onErrorContainer },
  form: { gap: MealMindSpace.lg },
  fieldBlock: { gap: 8 },
  label: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    color: MealMindColors.onSurfaceVariant,
    marginLeft: 10,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: MealMindRadii.full,
    backgroundColor: MealMindColors.surfaceContainer,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE_BORDER,
  },
  input: { flex: 1, fontFamily: MealMindFonts.body, fontSize: 16, color: MealMindColors.onSurface },
  selectText: { flex: 1, fontFamily: MealMindFonts.body, fontSize: 16, color: MealMindColors.onSurface },
  selectTextMuted: { color: MealMindColors.onSurfaceVariant },
  iconHit: { padding: 4, marginRight: -4 },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 6, paddingVertical: 6 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}CC`,
    backgroundColor: MealMindColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: MealMindColors.primary, borderColor: 'transparent' },
  termsText: { flex: 1, fontFamily: MealMindFonts.body, fontSize: 13, color: MealMindColors.onSurfaceVariant },
  link: { fontFamily: MealMindFonts.labelSemibold, color: MealMindColors.primary },
  oauthDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    marginTop: MealMindSpace.md,
  },
  oauthLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: MealMindColors.surfaceContainerHigh },
  oauthLabel: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: MealMindColors.outline,
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
    backgroundColor: MealMindColors.surfaceContainer,
  },
  oauthBtnDisabled: { opacity: 0.55 },
  oauthBtnText: { fontFamily: MealMindFonts.labelSemibold, fontSize: 14, color: MealMindColors.onSurface },
  footerCopy: { marginTop: 32, alignItems: 'center' },
  footerText: { fontFamily: MealMindFonts.body, fontSize: 14, color: MealMindColors.onSurfaceVariant },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  stickyBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: MealMindSpace.lg,
    paddingTop: MealMindSpace.md,
    backgroundColor: `${MealMindColors.surface}F2`,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${MealMindColors.outlineVariant}1A`,
  },
  stickyInner: { width: '100%', maxWidth: FORM_MAX_WIDTH, alignSelf: 'center' },
  modalRoot: { flex: 1, backgroundColor: MealMindColors.surface },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${MealMindColors.outlineVariant}33`,
  },
  modalTitle: { flex: 1, fontFamily: MealMindFonts.headlineBold, fontSize: 18, color: MealMindColors.onSurface },
  iconBtn: { padding: 4 },
  modalSearch: {
    marginHorizontal: MealMindSpace.lg,
    marginVertical: MealMindSpace.sm,
    fontFamily: MealMindFonts.body,
    fontSize: 16,
    color: MealMindColors.onSurface,
    backgroundColor: MealMindColors.surfaceContainerHigh,
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
    borderBottomColor: `${MealMindColors.outlineVariant}1F`,
  },
  modalRowPressed: { backgroundColor: MealMindColors.surfaceContainerLow },
  modalRowSelected: { backgroundColor: `${MealMindColors.primaryFixed}66` },
  modalRowLabel: { flex: 1, fontFamily: MealMindFonts.body, fontSize: 16, color: MealMindColors.onSurface },
  modalRowLabelSelected: { fontFamily: MealMindFonts.bodyMedium, color: MealMindColors.onPrimaryContainer },
});
