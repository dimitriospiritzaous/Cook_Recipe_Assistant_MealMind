import { normalizeStoredProfileJson, type StoredProfile } from '@/lib/profile-storage';
import { supabase } from '@/lib/supabase';

const TABLE = 'profiles';

export async function upsertMealMindProfile(profile: StoredProfile): Promise<{ ok: boolean; error?: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, error: 'No session' };

  const { error } = await supabase.from(TABLE).upsert(
    {
      id: uid,
      profile: profile as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (error) {
    if (__DEV__) console.warn('[MealMind] upsert profile', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function fetchMealMindProfile(): Promise<StoredProfile | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase.from(TABLE).select('profile').eq('id', uid).maybeSingle();

  if (error) {
    if (__DEV__) console.warn('[MealMind] fetch profile', error.message);
    return null;
  }
  if (data?.profile == null) return null;
  return normalizeStoredProfileJson(data.profile);
}

/** Best-effort remove server `profiles` row for the signed-in user (RLS must allow delete). */
export async function deleteMealMindProfileRow(): Promise<{ ok: boolean; error?: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) return { ok: false, error: 'No session' };

  const { error } = await supabase.from(TABLE).delete().eq('id', uid);
  if (error) {
    if (__DEV__) console.warn('[MealMind] delete profile row', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
