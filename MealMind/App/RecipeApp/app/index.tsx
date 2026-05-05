import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MealMindColors } from '@/constants/mealmind-colors';
import {
  getIntroSeen,
  hydrateLocalFlagsFromRemoteProfile,
  syncLocalIntroFlagsFromAuthUser,
} from '@/lib/profile-storage';
import { getSupabaseSession, syncAuthMetadataIntroCompleteFromProfileIfNeeded } from '@/lib/supabase-auth';
import { fetchMealMindProfile } from '@/lib/supabase-profile';

type BootTarget = 'signup' | 'intro' | 'tabs' | null;

/**
 * Entry: Supabase session → (first-time only) intro wizard → tabs.
 * Returning users skip intro via Supabase `user_metadata` and/or `profiles` hydration.
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
        await syncAuthMetadataIntroCompleteFromProfileIfNeeded(remote);
      }
      const sessionForFlags = (await getSupabaseSession()) ?? session;
      await syncLocalIntroFlagsFromAuthUser(sessionForFlags.user);

      const introSeen = await getIntroSeen();
      if (!introSeen) {
        setTarget('intro');
        return;
      }
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
