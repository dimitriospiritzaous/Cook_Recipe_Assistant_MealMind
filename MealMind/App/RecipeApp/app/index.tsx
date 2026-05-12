import { Redirect } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';


import {
  getIntroSeen,
  getOnboardingComplete,
  hydrateLocalFlagsFromRemoteProfile,
  syncLocalIntroFlagsFromAuthUser,
} from '@/lib/profile-storage';
import { getSupabaseSession, syncAuthMetadataIntroCompleteFromProfileIfNeeded } from '@/lib/supabase-auth';
import { fetchMealMindProfile } from '@/lib/supabase-profile';

type BootTarget = 'signup' | 'intro' | 'tabs' | null;

/**
 * Entry: Supabase session → (first-time only) intro wizard → tabs (home / add ingredients).
 * Returning users hydrate progress from `profiles` and Supabase `user_metadata` so they skip the 12-step flow.
 * Without a session, user is sent to sign up first.
 */
function createBootStyles(colors: MealMindPalette) {
  return StyleSheet.create({
    boot: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
  });
}

export default function Index() {
  const colors = useMealMindColors();
  const styles = useMemo(() => createBootStyles(colors), [colors]);
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
        await syncAuthMetadataIntroCompleteFromProfileIfNeeded(remote);
      }
      const sessionForFlags = (await getSupabaseSession()) ?? session;
      await syncLocalIntroFlagsFromAuthUser(sessionForFlags.user);

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
        <ActivityIndicator size="large" color={colors.primary} />
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
