import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MealMindPalette } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import { useI18n } from '@/contexts/i18n-context';
import { useMealMindColors } from '@/contexts/mealmind-theme-context';

export type TabKey = 'index' | 'favorites' | 'profile';

export type MealMindMainTabFooterProps = {
  /** Override which tab looks selected (defaults from current path when possible). */
  activeTab?: TabKey;
};

type TabItem = {
  key: TabKey;
  routeName: string;
  href: Href;
  labelKey: string;
  a11yKey: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const TAB_DEFS: TabItem[] = [
  {
    key: 'index',
    routeName: 'index',
    href: '/(tabs)',
    labelKey: 'tabs.home',
    a11yKey: 'tabs.a11y.home',
    icon: 'home',
  },
  {
    key: 'favorites',
    routeName: 'favorites',
    href: '/(tabs)/favorites',
    labelKey: 'tabs.favorites',
    a11yKey: 'tabs.a11y.favorites',
    icon: 'favorite',
  },
  {
    key: 'profile',
    routeName: 'profile',
    href: '/(tabs)/profile',
    labelKey: 'tabs.profile',
    a11yKey: 'tabs.a11y.profile',
    icon: 'person',
  },
];

function createTabStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    bar: {
      backgroundColor: colors.surface,
      paddingTop: MealMindSpace.sm,
      borderTopLeftRadius: MealMindRadii.xl,
      borderTopRightRadius: MealMindRadii.xl,
      shadowColor: colors.onSurface,
      shadowOffset: { width: 0, height: -12 },
      shadowOpacity: 0.06,
      shadowRadius: 40,
      elevation: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'space-between',
      paddingHorizontal: MealMindSpace.sm,
      gap: 4,
    },
    item: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 2,
      borderRadius: 20,
      gap: 4,
    },
    itemActive: {
      backgroundColor: colors.primary,
    },
    itemPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.97 }],
    },
    label: {
      fontFamily: MealMindFonts.labelSemibold,
      fontSize: 10,
      letterSpacing: 0.2,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      maxWidth: '100%',
    },
    labelActive: {
      color: colors.onPrimary,
    },
  });
}

function resolveActiveFromPath(pathname: string, override?: TabKey): TabKey {
  if (override) return override;
  if (pathname.includes('profile')) return 'profile';
  if (pathname.includes('favorites')) return 'favorites';
  return 'index';
}

function TabSlot({
  tab,
  focused,
  onPress,
  label,
  a11yHint,
  styles,
  colors,
}: {
  tab: TabItem;
  focused: boolean;
  onPress: () => void;
  label: string;
  a11yHint: string;
  styles: ReturnType<typeof createTabStyles>;
  colors: MealMindPalette;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      accessibilityHint={a11yHint}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.item,
        focused && styles.itemActive,
        pressed && styles.itemPressed,
      ]}>
      <MaterialIcons
        name={tab.icon}
        size={22}
        color={focused ? colors.onPrimary : colors.onSurfaceVariant}
      />
      <Text
        style={[styles.label, focused && styles.labelActive]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Standalone footer for non-Tabs screens (e.g. `results.tsx`). */
export function MealMindMainTabFooter({ activeTab }: MealMindMainTabFooterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colors = useMealMindColors();
  const { t } = useI18n();
  const styles = useMemo(() => createTabStyles(colors), [colors]);
  const active = resolveActiveFromPath(pathname, activeTab);

  const onSelect = (tab: TabItem) => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.replace(tab.href);
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, MealMindSpace.sm) }]}>
      <View style={styles.row}>
        {TAB_DEFS.map((tab) => (
          <TabSlot
            key={tab.key}
            tab={tab}
            focused={active === tab.key}
            onPress={() => onSelect(tab)}
            label={t(tab.labelKey)}
            a11yHint={t(tab.a11yKey)}
            styles={styles}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
}

/** Custom tabBar used by `Tabs` navigator. Keeps visuals identical to standalone. */
export function MealMindTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useMealMindColors();
  const { t } = useI18n();
  const styles = useMemo(() => createTabStyles(colors), [colors]);
  const focusedRoute = state.routes[state.index]?.name;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, MealMindSpace.sm) }]}>
      <View style={styles.row}>
        {TAB_DEFS.map((tab) => {
          const routeExists = state.routes.some((r) => r.name === tab.routeName);
          const focused = focusedRoute === tab.routeName;
          const onPress = () => {
            if (!routeExists) return;
            if (process.env.EXPO_OS === 'ios') {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes.find((r) => r.name === tab.routeName)?.key ?? '',
              canPreventDefault: true,
            });
            if (event.defaultPrevented) return;
            if (focused) {
              if (tab.routeName === 'profile') {
                router.replace(tab.href);
              }
              return;
            }
            navigation.navigate(tab.routeName);
          };
          return (
            <TabSlot
              key={tab.key}
              tab={tab}
              focused={focused}
              onPress={onPress}
              label={t(tab.labelKey)}
              a11yHint={t(tab.a11yKey)}
              styles={styles}
              colors={colors}
            />
          );
        })}
      </View>
    </View>
  );
}
