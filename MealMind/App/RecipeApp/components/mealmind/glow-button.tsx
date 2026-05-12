import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps, type ViewStyle } from 'react-native';

import type { MealMindPalette } from '@/constants/mealmind-colors';
import { mealMindGlowCtaShadow, MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';

export type GlowButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  /** Optional icon after label (e.g. Material symbol as Text). */
  trailing?: ReactNode;
  style?: ViewStyle;
};

function createGlowStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    pressable: {
      borderRadius: MealMindRadii.lg,
      overflow: 'hidden',
      ...mealMindGlowCtaShadow(colors.primary),
    },
    pressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    disabled: {
      opacity: 0.5,
    },
    gradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: MealMindSpace.md + 4,
      paddingHorizontal: MealMindSpace.xl + 8,
      gap: MealMindSpace.sm,
    },
    label: {
      fontFamily: MealMindFonts.headlineBold,
      fontSize: 18,
      letterSpacing: headlineTracking,
      color: colors.onPrimary,
    },
    trail: {
      marginLeft: 4,
    },
  });
}

/** Primary CTA — 135° glow gradient primary → primaryContainer (DESIGN.md). */
export function GlowButton({ label, trailing, style, disabled, ...rest }: GlowButtonProps) {
  const colors = useMealMindColors();
  const styles = useMemo(() => createGlowStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      {...rest}>
      <LinearGradient
        colors={[colors.primary, colors.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <Text style={styles.label}>{label}</Text>
        {trailing != null ? <View style={styles.trail}>{trailing}</View> : null}
      </LinearGradient>
    </Pressable>
  );
}
