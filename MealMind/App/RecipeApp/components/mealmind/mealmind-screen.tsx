import type { PropsWithChildren, ReactNode } from 'react';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { MealMindPalette } from '@/constants/mealmind-colors';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';

import { MealMindFooter } from './mealmind-footer';

function createScreenStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    column: {
      flex: 1,
    },
    fill: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
  });
}

type MealMindScreenProps = PropsWithChildren<
  ViewProps & {
    /** When true, content scrolls inside padded safe area. */
    scroll?: boolean;
    /** Extra bottom inset for tab bar / FAB (e.g. 88). */
    contentBottomInset?: number;
    /** Set false to hide the shared bottom bar (default: shown). */
    showFooter?: boolean;
    /**
     * Replaces the default MealMind footer when set (including `null` to omit).
     * When omitted, `showFooter` controls the default footer.
     */
    footer?: ReactNode;
  }
>;

export function MealMindScreen({
  children,
  scroll = false,
  contentBottomInset = 0,
  showFooter = true,
  footer: footerProp,
  style,
  ...rest
}: MealMindScreenProps) {
  const colors = useMealMindColors();
  const styles = useMemo(() => createScreenStyles(colors), [colors]);
  const paddingBottom = contentBottomInset;
  const footer =
    footerProp !== undefined ? footerProp : showFooter ? <MealMindFooter /> : null;

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]} edges={['top', 'left', 'right']} {...rest}>
        <View style={styles.column}>
          <ScrollView
            style={styles.fill}
            contentContainerStyle={[styles.scrollContent, { paddingBottom }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {footer}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, style]} edges={['top', 'left', 'right']} {...rest}>
      <View style={styles.column}>
        <View style={[styles.fill, { paddingBottom }]}>{children}</View>
        {footer}
      </View>
    </SafeAreaView>
  );
}
