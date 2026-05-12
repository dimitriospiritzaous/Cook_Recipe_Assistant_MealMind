import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';

function createStepBlockStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    card: {
      borderRadius: MealMindRadii.md,
      padding: MealMindSpace.lg,
      marginBottom: MealMindSpace.md,
    },
    cardIdle: {
      backgroundColor: colors.surfaceContainerLowest,
    },
    cardActive: {
      backgroundColor: `${colors.tertiaryContainer}33`,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    inner: {
      flexDirection: 'row',
      gap: MealMindSpace.md,
    },
    index: {
      fontFamily: MealMindFonts.headlineExtraBold,
      fontSize: 36,
      lineHeight: 40,
      letterSpacing: headlineTracking,
    },
    indexActive: {
      color: `${colors.primary}55`,
    },
    indexIdle: {
      color: `${colors.outlineVariant}cc`,
    },
    copy: {
      flex: 1,
      gap: MealMindSpace.xs,
    },
    title: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 18,
      color: colors.onSurface,
    },
    body: {
      fontFamily: MealMindFonts.body,
      fontSize: 16,
      lineHeight: 24,
      color: colors.onSurfaceVariant,
    },
  });
}

export type MealMindStepBlockProps = {
  stepNumber: number;
  title?: string;
  instruction: string;
  /** “Kitchen mode” — highlighted active step (DESIGN.md). */
  active?: boolean;
};

export function MealMindStepBlock({ stepNumber, title, instruction, active }: MealMindStepBlockProps) {
  const colors = useMealMindColors();
  const styles = useMemo(() => createStepBlockStyles(colors), [colors]);
  return (
    <View style={[styles.card, active ? styles.cardActive : styles.cardIdle]}>
      <View style={styles.inner}>
        <Text style={[styles.index, active ? styles.indexActive : styles.indexIdle]}>{String(stepNumber).padStart(2, '0')}</Text>
        <View style={styles.copy}>
          {title != null ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.body}>{instruction}</Text>
        </View>
      </View>
    </View>
  );
}
