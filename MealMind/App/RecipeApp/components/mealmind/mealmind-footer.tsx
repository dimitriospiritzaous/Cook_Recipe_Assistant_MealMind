import Constants from 'expo-constants';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';

const appVersion = Constants.expoConfig?.version ?? '1.0.0';

function createFooterStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    wrap: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.surfaceContainerHigh,
      backgroundColor: colors.surface,
      paddingHorizontal: MealMindSpace.md,
      paddingTop: MealMindSpace.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brand: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 12,
      letterSpacing: 0.4,
      color: colors.onSurfaceVariant,
      textTransform: 'uppercase',
    },
    meta: {
      fontFamily: MealMindFonts.body,
      fontSize: 12,
      color: colors.outline,
    },
  });
}

export function MealMindFooter() {
  const { bottom } = useSafeAreaInsets();
  const colors = useMealMindColors();
  const styles = useMemo(() => createFooterStyles(colors), [colors]);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(bottom, MealMindSpace.sm) }]}>
      <View style={styles.row}>
        <Text style={styles.brand}>MealMind</Text>
        <Text style={styles.meta}>v{appVersion}</Text>
      </View>
    </View>
  );
}
