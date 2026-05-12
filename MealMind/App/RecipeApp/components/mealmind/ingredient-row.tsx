import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';

export type IngredientRowProps = {
  name: string;
  amount?: string;
};

function createRowStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: MealMindSpace.md,
    },
    name: {
      flex: 1,
      fontFamily: MealMindFonts.body,
      fontSize: 16,
      lineHeight: 24,
      color: colors.onSurface,
    },
    amount: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 14,
      color: colors.onSurfaceVariant,
      backgroundColor: colors.surfaceContainerHigh,
      paddingHorizontal: MealMindSpace.sm,
      paddingVertical: 6,
      borderRadius: MealMindRadii.md,
      overflow: 'hidden',
    },
    amountPlaceholder: {
      minWidth: 48,
    },
  });
}

/** Ingredient line — no divider; spacing only (DESIGN.md lists). */
export function IngredientRow({ name, amount }: IngredientRowProps) {
  const colors = useMealMindColors();
  const styles = useMemo(() => createRowStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <Text style={styles.name}>{name}</Text>
      {amount != null ? (
        <Text style={styles.amount}>{amount}</Text>
      ) : (
        <View style={styles.amountPlaceholder} />
      )}
    </View>
  );
}
