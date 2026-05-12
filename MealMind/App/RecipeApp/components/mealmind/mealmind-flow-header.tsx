import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';

export type MealMindFlowHeaderProps = {
  title: string;
  /** Subtle bottom hairline like registration mock (`border-outline-variant/10`). */
  showBottomDivider?: boolean;
};

function createHeaderStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: MealMindSpace.sm,
      paddingHorizontal: MealMindSpace.lg,
      paddingVertical: MealMindSpace.md,
      backgroundColor: colors.surface,
    },
    back: {
      padding: 4,
    },
    pressed: {
      opacity: 0.7,
    },
    title: {
      flex: 1,
      fontFamily: MealMindFonts.headlineExtraBold,
      fontSize: 18,
      letterSpacing: headlineTracking,
      color: colors.primary,
    },
    spacer: {
      width: 24,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: `${colors.outlineVariant}26`,
    },
  });
}

/** Stack flow screens: back + title (matches design top bar pattern). */
export function MealMindFlowHeader({ title, showBottomDivider }: MealMindFlowHeaderProps) {
  const router = useRouter();
  const colors = useMealMindColors();
  const styles = useMemo(() => createHeaderStyles(colors), [colors]);

  return (
    <View style={[styles.row, showBottomDivider && styles.rowDivider]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
        <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}
