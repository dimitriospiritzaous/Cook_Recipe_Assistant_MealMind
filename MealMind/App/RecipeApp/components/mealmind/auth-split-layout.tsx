import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';

const BREAKPOINT = 768;

function createAuthSplitStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    mobileRoot: { flex: 1 },
    row: { flex: 1, flexDirection: 'row' },
    heroPane: {
      flex: 1,
      backgroundColor: colors.surfaceContainer,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    heroCopy: {
      padding: MealMindSpace.xl + 8,
      paddingBottom: MealMindSpace.xl + 24,
    },
    heroTitle: {
      fontFamily: MealMindFonts.headlineExtraBold,
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.5,
      color: colors.surface,
      marginBottom: MealMindSpace.md,
    },
    heroSubtitle: {
      fontFamily: MealMindFonts.body,
      fontSize: 16,
      lineHeight: 24,
      color: `${colors.surface}E6`,
      maxWidth: 400,
    },
    formPane: {
      flex: 1,
      backgroundColor: colors.surface,
      borderTopLeftRadius: MealMindRadii.xl,
      overflow: 'hidden',
    },
  });
}

export type AuthSplitLayoutProps = {
  heroImageUri: string;
  heroTitle: string;
  heroSubtitle: string;
  children: ReactNode;
};

/** Matches stitch sign-in/up split editorial panel on tablet + web (`Design/stitch_signup`, `stitch_signin`). */
export function AuthSplitLayout({ heroImageUri, heroTitle, heroSubtitle, children }: AuthSplitLayoutProps) {
  const colors = useMealMindColors();
  const styles = useMemo(() => createAuthSplitStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const showHero = width >= BREAKPOINT;

  if (!showHero) {
    return <View style={styles.mobileRoot}>{children}</View>;
  }

  return (
    <View style={styles.row}>
      <View style={styles.heroPane}>
        <Image source={{ uri: heroImageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={['transparent', `${colors.onSurface}99`]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.2 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
        </View>
      </View>
      <View style={styles.formPane}>{children}</View>
    </View>
  );
}
