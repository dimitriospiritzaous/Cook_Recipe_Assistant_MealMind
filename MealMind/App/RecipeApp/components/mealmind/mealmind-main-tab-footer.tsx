import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';

export type TabKey = 'index' | 'favorites' | 'profile';

type TabItem = {
  key: TabKey;
  routeName: string;
  href: Href;
  /** Short label under the icon (visible hint). */
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  /** Extra context for screen readers. */
  accessibilityHint: string;
};

const TABS: TabItem[] = [
  {
    key: 'index',
    routeName: 'index',
    href: '/(tabs)',
    label: 'Home',
    icon: 'home',
    accessibilityHint: 'Ingredients and Find My Meal',
  },
  {
    key: 'favorites',
    routeName: 'favorites',
    href: '/(tabs)/favorites',
    label: 'Favorites',
    icon: 'favorite',
    accessibilityHint: 'Saved recipes',
  },
  {
    key: 'profile',
    routeName: 'profile',
    href: '/(tabs)/profile',
    label: 'Profile',
    icon: 'person',
    accessibilityHint: 'Account and settings',
  },
];

export type MealMindMainTabFooterProps = {
  /** Override which tab looks selected (defaults from current path when possible). */
  activeTab?: TabKey;
};

function resolveActiveFromPath(pathname: string, override?: TabKey): TabKey {
  if (override) return override;
  if (pathname.includes('profile')) return 'profile';
  if (pathname.includes('favorites')) return 'favorites';
  return 'index';
}

/** Standalone footer for non-Tabs screens (e.g. `results.tsx`). */
export function MealMindMainTabFooter({ activeTab }: MealMindMainTabFooterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
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
        {TABS.map((tab) => (
          <TabSlot key={tab.key} tab={tab} focused={active === tab.key} onPress={() => onSelect(tab)} />
        ))}
      </View>
    </View>
  );
}

/** Custom tabBar used by `Tabs` navigator. Keeps visuals identical to standalone. */
export function MealMindTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const focusedRoute = state.routes[state.index]?.name;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, MealMindSpace.sm) }]}>
      <View style={styles.row}>
        {TABS.map((tab) => {
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
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(tab.routeName);
            }
          };
          return <TabSlot key={tab.key} tab={tab} focused={focused} onPress={onPress} />;
        })}
      </View>
    </View>
  );
}

function TabSlot({ tab, focused, onPress }: { tab: TabItem; focused: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={tab.label}
      accessibilityHint={tab.accessibilityHint}
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
        color={focused ? MealMindColors.onPrimary : MealMindColors.onSurfaceVariant}
      />
      <Text
        style={[styles.label, focused && styles.labelActive]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: MealMindColors.surface,
    paddingTop: MealMindSpace.sm,
    borderTopLeftRadius: MealMindRadii.xl,
    borderTopRightRadius: MealMindRadii.xl,
    shadowColor: MealMindColors.onSurface,
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
    backgroundColor: MealMindColors.primary,
  },
  itemPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 0.2,
    color: MealMindColors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: '100%',
  },
  labelActive: {
    color: MealMindColors.onPrimary,
  },
});
