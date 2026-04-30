import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { navigateAfterSuccessfulAuth } from '@/lib/auth-after-signin';
import { completeOAuthSessionFromRedirectUrl } from '@/lib/supabase-auth';

/**
 * OAuth redirect target (`recipeapp://auth/callback?...`). Allowlist this exact URL in Supabase
 * (Authentication → URL configuration → Redirect URLs).
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
  }>();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) {
      return;
    }
    ran.current = true;
    void (async () => {
      const pick = (v: string | string[] | undefined): string | undefined =>
        Array.isArray(v) ? v[0] : v;

      const errDesc = pick(params.error_description) ?? pick(params.error);
      if (errDesc) {
        router.replace('/signin');
        return;
      }

      const code = pick(params.code);
      if (!code) {
        router.replace('/signin');
        return;
      }

      const syntheticUrl = `recipeapp://auth/callback?code=${encodeURIComponent(code)}`;
      try {
        await completeOAuthSessionFromRedirectUrl(syntheticUrl);
        await navigateAfterSuccessfulAuth(router);
      } catch {
        router.replace('/signin');
      }
    })();
  }, [params.code, params.error, params.error_description, router]);

  return (
    <View style={styles.shell}>
      <ActivityIndicator size="large" color={MealMindColors.primary} />
      <Text style={styles.text}>Signing you in…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: MealMindColors.surface,
    padding: 24,
  },
  text: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 16,
    color: MealMindColors.onSurfaceVariant,
    letterSpacing: headlineTracking,
  },
});
