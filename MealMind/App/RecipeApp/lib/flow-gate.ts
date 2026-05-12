import {
  getGetStartedSeen,
  getOnboardingComplete,
  getProfile,
  normalizeStoredProfileJson,
  setOnboardingComplete,
  setGetStartedSeen,
  setProfile,
  type StoredProfile,
} from '@/lib/profile-storage';
import { upsertMealMindProfile } from '@/lib/supabase-profile';

async function finalizeFlowGate(): Promise<void> {
  await setGetStartedSeen();
  const existing = await getProfile();
  const base = existing ?? normalizeStoredProfileJson({});
  if (!base) return;
  const next: StoredProfile = { ...base, flowOnboardingDone: true };
  await setProfile(next);
  await upsertMealMindProfile(next);
  await setOnboardingComplete();
}

/**
 * Ensures local + remote onboarding gate matches tabs entry (replacing the former get-started screen).
 * Safe to call when `intro` was completed but legacy flags still implied an intermediate gate.
 */
export async function syncFlowGateBeforeTabs(): Promise<void> {
  const [complete, started] = await Promise.all([getOnboardingComplete(), getGetStartedSeen()]);
  if (complete) return;
  if (!started) {
    await finalizeFlowGate();
    return;
  }
  await setOnboardingComplete();
}
