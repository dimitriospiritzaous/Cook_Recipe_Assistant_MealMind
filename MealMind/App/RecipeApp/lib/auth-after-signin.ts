import type { Router } from 'expo-router';

import { syncFlowGateBeforeTabs } from '@/lib/flow-gate';
import { showAuthSuccessToast } from '@/lib/mealmind-toast';
import {
  getIntroSeen,
  hydrateLocalFlagsFromRemoteProfile,
  syncLocalIntroFlagsFromAuthUser,
} from '@/lib/profile-storage';
import {
  getSupabaseSession,
  syncAuthMetadataIntroCompleteFromProfileIfNeeded,
} from '@/lib/supabase-auth';
import { fetchMealMindProfile } from '@/lib/supabase-profile';

/**
 * After any successful Supabase sign-in (email or OAuth), mirror the same routing as the email flow.
 */
export async function navigateAfterSuccessfulAuth(router: Router): Promise<void> {
  const session = await getSupabaseSession();
  if (!session) return;

  const remote = await fetchMealMindProfile();
  if (remote) {
    await hydrateLocalFlagsFromRemoteProfile(remote);
    await syncAuthMetadataIntroCompleteFromProfileIfNeeded(remote);
  }
  const sessionForFlags = (await getSupabaseSession()) ?? session;
  await syncLocalIntroFlagsFromAuthUser(sessionForFlags.user);

  const introSeen = await getIntroSeen();
  if (!introSeen) {
    showAuthSuccessToast('Signed in', "Let's personalize MealMind.");
    router.replace('/intro');
    return;
  }
  await syncFlowGateBeforeTabs();
  showAuthSuccessToast('Signed in', 'Welcome back.');
  router.replace('/(tabs)');
}
