import 'react-native-url-polyfill/auto';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useMealMindFonts } from '@/hooks/use-mealmind-fonts';
import { useMealmindToastConfig } from '@/lib/mealmind-toast';
import { initRevenueCat, syncRevenueCatUser } from '@/lib/revenuecat';
import { supabase } from '@/lib/supabase';
import { I18nProvider } from '@/contexts/i18n-context';
import { MealMindThemeProvider, useMealMindTheme } from '@/contexts/mealmind-theme-context';

SplashScreen.preventAutoHideAsync();

function RootLayoutBody() {
  const { colors, colorScheme } = useMealMindTheme();
  const toastConfig = useMealmindToastConfig();

  const navigationTheme = useMemo(
    () => ({
      ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        primary: colorScheme === 'dark' ? colors.primaryContainer : colors.primary,
        background: colors.surface,
        card: colors.surface,
        text: colors.onSurface,
        border: colors.surfaceContainer,
        notification: colors.primaryContainer,
      },
    }),
    [colorScheme, colors],
  );

  return (
    <>
      <ThemeProvider value={navigationTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="signin" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="auth/callback" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="intro" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="loading" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="scan" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="scan-review" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="results" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="recipe/[id]" options={{ headerShown: false, presentation: 'card' }} />
        </Stack>
      </ThemeProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Toast config={toastConfig} />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useMealMindFonts();

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  useEffect(() => {
    void initRevenueCat();
  }, []);

  useEffect(() => {
    const syncRc = () => {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        void syncRevenueCatUser(session?.user?.id ?? null);
      });
    };
    syncRc();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncRevenueCatUser(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <MealMindThemeProvider>
        <I18nProvider>
          <RootLayoutBody />
        </I18nProvider>
      </MealMindThemeProvider>
    </View>
  );
}
