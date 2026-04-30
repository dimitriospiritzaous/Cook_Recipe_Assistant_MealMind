import 'react-native-url-polyfill/auto';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { MealMindColors } from '@/constants/mealmind-colors';
import { useMealMindFonts } from '@/hooks/use-mealmind-fonts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mealmindToastConfig } from '@/lib/mealmind-toast';

SplashScreen.preventAutoHideAsync();

const MealMindNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: MealMindColors.primary,
    background: MealMindColors.surface,
    card: MealMindColors.surface,
    text: MealMindColors.onSurface,
    border: MealMindColors.surfaceContainer,
    notification: MealMindColors.primaryContainer,
  },
};

const MealMindDarkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: MealMindColors.primaryContainer,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useMealMindFonts();

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? MealMindDarkNavigationTheme : MealMindNavigationTheme}>
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
        <StatusBar style="dark" />
        <Toast config={mealmindToastConfig} />
      </ThemeProvider>
    </View>
  );
}
