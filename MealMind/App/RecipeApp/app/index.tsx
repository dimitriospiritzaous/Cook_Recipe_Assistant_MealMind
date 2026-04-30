import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MealMindColors } from '@/constants/mealmind-colors';
import { syncFlowGateBeforeTabs } from '@/lib/flow-gate';
import { getIntroSeen, getOnboardingComplete, hydrateLocalFlagsFromRemoteProfile } from '@/lib/profile-storage';
import { getSupabaseSession } from '@/lib/supabase-auth';
import { fetchMealMindProfile } from '@/lib/supabase-profile';

type BootTarget = 'signup' | 'intro' | 'tabs' | null;

/**
 * Entry: Supabase session → (first-time only) intro wizard → tabs (home / add ingredients).
 * Returning users hydrate progress from `profiles` so they skip the 12-step flow.
 * Without a session, user is sent to sign up first.
 */
export default function Index() {
  const [target, setTarget] = useState<BootTarget>(null);

  useEffect(() => {
    void (async () => {
      const session = await getSupabaseSession();
      if (!session) {
        setTarget('signup');
        return;
      }
      const remote = await fetchMealMindProfile();
      if (remote) {
        await hydrateLocalFlagsFromRemoteProfile(remote);
      }
      const [introSeen, onboardingDone] = await Promise.all([getIntroSeen(), getOnboardingComplete()]);
      if (!introSeen) {
        setTarget('intro');
        return;
      }
      if (onboardingDone) {
        setTarget('tabs');
        return;
      }
      await syncFlowGateBeforeTabs();
      setTarget('tabs');
    })();
  }, []);

  if (target === null) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={MealMindColors.primary} />
      </View>
    );
  }

  if (target === 'signup') {
    return <Redirect href="/signup" />;
  }

  if (target === 'intro') {
    return <Redirect href="/intro" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MealMindColors.surface,
  },
});
