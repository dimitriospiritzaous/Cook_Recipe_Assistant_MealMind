import type { AuthError } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getExpoGoProjectConfig } from 'expo';
import { NativeModules, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { clearAuthToken } from '@/lib/auth-storage';
import { clearFavorites } from '@/lib/favorites-storage';
import {
  clearLastAuthUserId,
  clearProfileAndOnboardingState,
  getLastAuthUserId,
  setLastAuthUserId,
} from '@/lib/profile-storage';
import { clearLocalRecentIngredients } from '@/lib/recent-ingredients-api';
import { clearLastGeneratedRecipes } from '@/lib/recipe-generation-session';
import { getSupabaseMisconfigurationMessage, supabase } from '@/lib/supabase';

/**
 * Drop device-local caches that were saved per-user but keyed only by device.
 * Without this, a different sign-in inherits the previous user's favorites,
 * ingredient history, and last generated recipes from AsyncStorage.
 */
async function clearUserScopedDeviceCaches(): Promise<void> {
  await Promise.all([
    clearProfileAndOnboardingState(),
    clearFavorites(),
    clearLocalRecentIngredients(),
    clearLastGeneratedRecipes(),
  ]);
}

/** If a different Supabase account signs in, drop stale per-user device caches from the previous user. */
export async function syncLocalStateAfterAuth(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user?.id;
  if (!uid) return;
  const last = await getLastAuthUserId();
  if (last != null && last !== uid) {
    await clearUserScopedDeviceCaches();
  }
  await setLastAuthUserId(uid);
}

/** Sign out and clear local per-user state so the next sign-in starts from a clean slate. */
export async function signOutMealMind(): Promise<void> {
  await supabase.auth.signOut();
  await clearAuthToken();
  await clearUserScopedDeviceCaches();
  await clearLastAuthUserId();
}

function rethrowIfNetworkFailure(err: unknown): never {
  if (err instanceof TypeError) {
    const m = String(err.message ?? '');
    if (m.includes('Network request failed') || m.includes('Failed to fetch')) {
      throw new Error(
        'Could not reach Supabase. Check Wi‑Fi, confirm EXPO_PUBLIC_SUPABASE_URL in .env matches your project (Settings → API), and restart Expo after any .env change.',
      );
    }
  }
  throw err;
}

export function mapSupabaseAuthError(err: AuthError): string {
  const msg = err.message;
  const lower = msg.toLowerCase();
  if (lower.includes('already registered') || lower.includes('user already registered')) {
    return 'That email is already registered.';
  }
  if (lower.includes('invalid login credentials')) {
    return 'Email or password is incorrect.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email, then try signing in.';
  }
  if (lower.includes('rate limit')) {
    return 'Too many sign-up or email attempts. Wait a little while, then try again. (Supabase limits auth emails per hour.)';
  }
  return msg || 'Something went wrong. Please try again.';
}

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  countryCode: string;
}): Promise<{ session: boolean; needsEmailConfirmation: boolean }> {
  const missing = getSupabaseMisconfigurationMessage();
  if (missing) throw new Error(missing);

  let data;
  let error;
  try {
    const result = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { country_code: input.countryCode },
      },
    });
    data = result.data;
    error = result.error;
  } catch (err) {
    rethrowIfNetworkFailure(err);
  }
  if (error) throw new Error(mapSupabaseAuthError(error));
  if (data.session) {
    await clearUserScopedDeviceCaches();
    await clearLastAuthUserId();
    await syncLocalStateAfterAuth();
    return { session: true, needsEmailConfirmation: false };
  }
  if (data.user) return { session: false, needsEmailConfirmation: true };
  return { session: false, needsEmailConfirmation: false };
}

const OAUTH_CALLBACK_PATH = 'auth/callback';

/** Metro bundle URL on a real device usually uses the Mac’s LAN IP even when Expo still reports localhost elsewhere. */
function packagerHostPortFromScriptUrl(): string | null {
  const raw = NativeModules.SourceCode?.scriptURL as string | undefined;
  if (!raw?.startsWith('http')) return null;
  try {
    const u = new URL(raw);
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return null;
    const port = u.port || '8081';
    return `${u.hostname}:${port}`;
  } catch {
    return null;
  }
}

/** First usable `host:port` for the dev packager (non-loopback). */
function resolveLanPackagerHostPort(): string | null {
  const tryParseHostPort = (raw: string | undefined | null): string | null => {
    if (!raw || typeof raw !== 'string') return null;
    const t = raw.trim();
    if (t.includes('://')) {
      try {
        const u = new URL(t);
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return null;
        const port = u.port || '8081';
        return `${u.hostname}:${port}`;
      } catch {
        return null;
      }
    }
    const head = t.split('?')[0].split('/')[0].trim();
    if (!head || !head.includes(':')) return null;
    const host = head.split(':')[0];
    if (host === 'localhost' || host === '127.0.0.1') return null;
    return head;
  };

  const fromUrl = (uri: string | undefined | null): string | null => {
    if (!uri?.includes('://')) return null;
    try {
      const u = new URL(uri);
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return null;
      const port = u.port || '8081';
      return `${u.hostname}:${port}`;
    } catch {
      return null;
    }
  };

  return (
    packagerHostPortFromScriptUrl() ??
    tryParseHostPort(Constants.expoConfig?.hostUri) ??
    tryParseHostPort(getExpoGoProjectConfig()?.debuggerHost) ??
    fromUrl(Constants.linkingUri) ??
    fromUrl(Constants.experienceUrl)
  );
}

/**
 * Replace Metro loopback in `exp://` / `recipeapp:` dev URLs using a resolved LAN packager host.
 */
function rewriteExpoRedirectIfLoopback(uri: string): string {
  if (!uri.includes('localhost') && !uri.includes('127.0.0.1')) {
    return uri;
  }
  const packager = resolveLanPackagerHostPort();
  if (!packager) return uri;
  const isExpoGoStyle = uri.startsWith('exp:');
  const isRecipeWithMetroHost = uri.startsWith('recipeapp:') && /localhost|127\.0\.0\.1/.test(uri);
  if (!isExpoGoStyle && !isRecipeWithMetroHost) {
    return uri;
  }
  return uri.replace(/127\.0\.0\.1:\d+/, packager).replace(/localhost:\d+/, packager);
}

function isLikelyIosSimulator(): boolean {
  return Platform.OS === 'ios' && (Constants.deviceName ?? '').toLowerCase().includes('simulator');
}

/**
 * If `redirect_to` is not allowlisted in Supabase, the server falls back to **Site URL** (often
 * `http://localhost:3000`) — Safari on a phone then shows exactly that. This guard catches the
 * client-side half (loopback deep links); users must still add redirects / wildcards in Supabase.
 */
function assertOAuthRedirectUsableOnPhone(redirectTo: string): void {
  if (Platform.OS === 'web' || isLikelyIosSimulator()) return;
  if (!/localhost|127\.0\.0\.1/.test(redirectTo)) return;
  throw new Error(
    'OAuth cannot complete on this device: the return URL still uses localhost. ' +
      'MealMind will use your Mac’s LAN IP from the Metro bundle when possible — reload the app after `npm start` on the same Wi‑Fi. ' +
      'In Supabase → Authentication → URL configuration, add Additional Redirect URLs that include your app return URL ' +
      '(for Expo Go use `exp://**`, for dev/production builds use `recipeapp://**`). ' +
      'If those patterns are missing, Supabase ignores `redirect_to` and sends the browser to Site URL — ' +
      'change Site URL from http://localhost:3000 to a real https URL so phones are not sent to localhost.',
  );
}

/**
 * Redirect URI for OAuth (Google / Apple). Must be allowlisted in Supabase → Authentication → URL configuration.
 * Uses `scheme` from app.json (`recipeapp`) and path `auth/callback` (see `app/auth/callback.tsx`).
 *
 * Dev / production builds (Bare or Standalone): force `recipeapp://auth/callback` so Linking does not append
 * the Metro host (`…localhost:8081…`), which breaks on a real device (Safari cannot reach your Mac).
 * Expo Go: prefer `exp://HOST:PORT/--/auth/callback` built from the Metro bundle URL (LAN IP on device).
 *
 * Optional: set `EXPO_PUBLIC_AUTH_REDIRECT_URI` in `.env` to the exact string Supabase should allow (e.g. after `expo start --lan`).
 */
export function getOAuthRedirectUrl(): string {
  const override = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URI?.trim();
  if (override) {
    return override;
  }

  const native = `recipeapp://${OAUTH_CALLBACK_PATH}`;
  const useNative =
    Constants.executionEnvironment === ExecutionEnvironment.Bare ||
    Constants.executionEnvironment === ExecutionEnvironment.Standalone;

  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    const host = resolveLanPackagerHostPort();
    if (host) {
      return `exp://${host}/--/${OAUTH_CALLBACK_PATH}`;
    }
  }

  const uri = makeRedirectUri({
    scheme: 'recipeapp',
    path: OAUTH_CALLBACK_PATH,
    ...(useNative ? { native } : {}),
  });
  return rewriteExpoRedirectIfLoopback(uri);
}

export function parseOAuthReturnUrl(url: string): {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  oauthError: string | null;
} {
  try {
    const u = new URL(url);
    const oauthError = u.searchParams.get('error_description') ?? u.searchParams.get('error');
    let code = u.searchParams.get('code');
    let accessToken = u.searchParams.get('access_token');
    let refreshToken = u.searchParams.get('refresh_token');
    if (u.hash && u.hash.length > 1) {
      const h = new URLSearchParams(u.hash.slice(1));
      code = code ?? h.get('code');
      accessToken = accessToken ?? h.get('access_token');
      refreshToken = refreshToken ?? h.get('refresh_token');
    }
    return {
      code: code,
      accessToken: accessToken,
      refreshToken: refreshToken,
      oauthError: oauthError,
    };
  } catch {
    return { code: null, accessToken: null, refreshToken: null, oauthError: 'Invalid return URL' };
  }
}

/** Exchange PKCE code or implicit tokens from the OAuth redirect URL, then sync local user id. */
export async function completeOAuthSessionFromRedirectUrl(url: string): Promise<void> {
  const { code, accessToken, refreshToken, oauthError } = parseOAuthReturnUrl(url);
  if (oauthError) {
    throw new Error(oauthError);
  }

  if (code) {
    let exchangeErr: AuthError | null = null;
    try {
      const ex = await supabase.auth.exchangeCodeForSession(code);
      exchangeErr = ex.error;
    } catch (err) {
      rethrowIfNetworkFailure(err);
    }
    if (exchangeErr) {
      throw new Error(mapSupabaseAuthError(exchangeErr));
    }
  } else if (accessToken && refreshToken) {
    const { error: sessErr } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessErr) {
      throw new Error(mapSupabaseAuthError(sessErr));
    }
  } else {
    throw new Error(
      `Missing auth code in return URL. In Supabase → Authentication → URL configuration, add this redirect: ${getOAuthRedirectUrl()}`,
    );
  }

  await syncLocalStateAfterAuth();
}

/**
 * Google or Apple sign-in via Supabase OAuth + in-app browser (PKCE).
 * Configure providers and redirect URLs in the Supabase dashboard first.
 */
export async function signInWithOAuthProvider(provider: 'google' | 'apple'): Promise<void> {
  const missing = getSupabaseMisconfigurationMessage();
  if (missing) {
    throw new Error(missing);
  }

  const redirectTo = getOAuthRedirectUrl();

  if (
    Platform.OS !== 'web' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)\b/i.test(redirectTo)
  ) {
    throw new Error(
      'OAuth redirect is http(s)://localhost, which cannot load on a phone. Remove EXPO_PUBLIC_AUTH_REDIRECT_URI if it points at localhost, ' +
        'and in Supabase → Authentication → URL configuration set Site URL to a real https origin (not http://localhost:3000). ' +
        'Add your app redirect (e.g. recipeapp://auth/callback or exp://YOUR_LAN_IP:8081/--/auth/callback) under Redirect URLs.',
    );
  }

  assertOAuthRedirectUsableOnPhone(redirectTo);

  if (__DEV__) {
    console.info('[OAuth] redirect_to (allowlist this or use exp://** / recipeapp://** in Supabase):', redirectTo);
    console.info(
      '[OAuth] If Safari shows localhost after Google: Supabase → Authentication → URL configuration → ' +
        'Additional Redirect URLs must include exp://** and recipeapp://** (or the exact URL above). ' +
        'Otherwise Auth falls back to Site URL — set Site URL to a real https:// address, not http://localhost.',
    );
  }

  let data: { url?: string | null } | null = null;
  let oauthErr: AuthError | null = null;
  try {
    const result = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    data = result.data;
    oauthErr = result.error;
  } catch (err) {
    rethrowIfNetworkFailure(err);
  }
  if (oauthErr) {
    throw new Error(mapSupabaseAuthError(oauthErr));
  }
  const authUrl = data?.url?.trim();
  if (!authUrl) {
    throw new Error('Could not start OAuth. Enable this provider in Supabase (Authentication → Providers).');
  }

  const browser = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);

  if (browser.type === 'cancel' || browser.type === 'dismiss') {
    throw new Error('Sign-in was cancelled.');
  }
  if (browser.type !== 'success' || !browser.url) {
    throw new Error('Sign-in did not complete.');
  }

  await completeOAuthSessionFromRedirectUrl(browser.url);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const missing = getSupabaseMisconfigurationMessage();
  if (missing) throw new Error(missing);

  let error;
  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    error = result.error;
  } catch (err) {
    rethrowIfNetworkFailure(err);
  }
  if (error) throw new Error(mapSupabaseAuthError(error));
  await syncLocalStateAfterAuth();
}

export async function signOutSupabase(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSupabaseSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
