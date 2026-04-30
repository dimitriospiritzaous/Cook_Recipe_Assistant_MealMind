import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthSplitLayout } from '@/components/mealmind/auth-split-layout';
import { AppleLogo, GlowButton, GoogleLogo, MealMindScreen } from '@/components/mealmind';
import { SIGNIN_HERO_IMAGE } from '@/constants/auth-assets';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { navigateAfterSuccessfulAuth } from '@/lib/auth-after-signin';
import { signInWithEmail, signInWithOAuthProvider } from '@/lib/supabase-auth';

const FORM_MAX_WIDTH = 480;
const OUTLINE_BORDER = `${MealMindColors.outlineVariant}26`;

const SPLIT_BREAKPOINT = 768;

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setSubmitting(true);
    try {
      await signInWithEmail(e, password);
      await navigateAfterSuccessfulAuth(router);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [email, password, router]);

  const goToSignUp = useCallback(() => {
    router.replace('/signup');
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
          {width < SPLIT_BREAKPOINT ? (
            <View style={styles.mobileBrand}>
              <Text style={styles.mobileBrandText}>MealMind</Text>
            </View>
          ) : null}

          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Enter your details to continue your culinary journey.</Text>
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
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Password</Text>
                <Pressable disabled style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Forgot?</Text>
                </Pressable>
              </View>
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

            <View style={styles.oauthDivider}>
              <View style={styles.oauthLine} />
              <Text style={styles.oauthCenter}>Or continue with</Text>
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
              New here? <Text style={styles.link} onPress={goToSignUp}>Create an account</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.stickyBottom, { paddingBottom: stickyBottomPad }]}>
        <View style={styles.stickyInner}>
          <GlowButton
            label={submitting ? 'Signing in…' : oauthBusy ? 'Opening browser…' : 'Sign in'}
            trailing={<MaterialIcons name="arrow-forward" size={22} color={MealMindColors.onPrimary} />}
            disabled={submitting || oauthBusy}
            onPress={() => void onSubmit()}
          />
        </View>
      </View>
    </View>
  );

  return (
    <MealMindScreen scroll={false} showFooter={false} contentBottomInset={0}>
      <View style={styles.shell}>
        <AuthSplitLayout
          heroImageUri={SIGNIN_HERO_IMAGE}
          heroTitle="Sustainable taste starts here."
          heroSubtitle="Transforming your leftovers into curated culinary experiences. Redefine your kitchen ritual with mindful meal planning.">
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
    top: 90,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: MealMindColors.primaryFixed,
    opacity: 0.2,
  },
  blobBR: {
    position: 'absolute',
    bottom: 140,
    right: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: MealMindColors.secondaryContainer,
    opacity: 0.18,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: MealMindSpace.lg, paddingTop: MealMindSpace.xl + 8 },
  inner: { width: '100%', maxWidth: FORM_MAX_WIDTH, alignSelf: 'center' },
  mobileBrand: { alignItems: 'center', marginBottom: MealMindSpace.lg },
  mobileBrandText: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 22,
    color: MealMindColors.primary,
    letterSpacing: headlineTracking,
  },
  header: { marginBottom: MealMindSpace.xl },
  title: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 36,
    letterSpacing: -0.8,
    color: MealMindColors.onSurface,
    marginBottom: 8,
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
  passwordLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  forgotBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  forgotText: { fontFamily: MealMindFonts.labelSemibold, fontSize: 12, color: MealMindColors.outline },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: MealMindRadii.full,
    backgroundColor: MealMindColors.surfaceContainerLow,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE_BORDER,
  },
  input: { flex: 1, fontFamily: MealMindFonts.body, fontSize: 16, color: MealMindColors.onSurface },
  iconHit: { padding: 4, marginRight: -4 },
  oauthDivider: { flexDirection: 'row', alignItems: 'center', gap: MealMindSpace.md, marginTop: MealMindSpace.md },
  oauthLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: `${MealMindColors.outlineVariant}4D` },
  oauthCenter: {
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    color: MealMindColors.onSurfaceVariant,
    paddingHorizontal: MealMindSpace.sm,
    backgroundColor: MealMindColors.surface,
  },
  oauthRow: { flexDirection: 'row', gap: MealMindSpace.md },
  oauthBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: MealMindSpace.md + 4,
    borderRadius: MealMindRadii.full,
    backgroundColor: MealMindColors.surfaceContainer,
  },
  oauthBtnDisabled: {
    opacity: 0.55,
  },
  oauthBtnText: { fontFamily: MealMindFonts.labelSemibold, fontSize: 14, color: MealMindColors.onSurface },
  footerCopy: { marginTop: 32, alignItems: 'center' },
  footerText: { fontFamily: MealMindFonts.body, fontSize: 14, color: MealMindColors.onSurfaceVariant },
  link: { fontFamily: MealMindFonts.labelSemibold, color: MealMindColors.primary },
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
});
