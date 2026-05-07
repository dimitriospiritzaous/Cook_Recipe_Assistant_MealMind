/**
 * Waitlist API — runs on Vercel as a Route Handler (no MealMind/backend server required).
 * Configure SUPABASE_URL + SUPABASE_ANON_KEY in Vercel → Environment Variables.
 */
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const anonKey =
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const raw = typeof (body as { email?: unknown })?.email === 'string' ? (body as { email: string }).email : '';
  const email = raw.trim().toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const config = getSupabaseConfig();
  if (!config) {
    const vercelHint =
      process.env.VERCEL === '1'
        ? ' On Vercel: Project Settings → Environment Variables → SUPABASE_URL and SUPABASE_ANON_KEY → Redeploy.'
        : ' Set SUPABASE_URL + SUPABASE_ANON_KEY (e.g. Web/.env.local or RecipeApp/.env for local dev).';
    console.error(`[waitlist] Missing Supabase URL/anon key.${vercelHint}`);
    return NextResponse.json(
      { error: 'Waitlist is not configured yet. Try again soon.' },
      { status: 503 },
    );
  }

  const supabase = createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from('waitlist_signups').insert({
    email,
    source: 'web_landing',
  });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ ok: true as const, duplicate: true });
    }
    if (
      error.code === 'PGRST205' ||
      (typeof error.message === 'string' && error.message.includes('schema cache'))
    ) {
      console.error(
        '[waitlist] Table missing or API schema stale. Run Web/supabase/migrations/20260507120000_waitlist_signups.sql (SQL only) in Supabase SQL Editor.',
        error,
      );
      return NextResponse.json(
        {
          error:
            'Waitlist isn’t set up in Supabase yet. Open `20260507120000_waitlist_signups.sql` in the repo, copy the SQL (from create table to the end), paste into Supabase SQL Editor, and Run—not the file path.',
        },
        { status: 503 },
      );
    }
    console.error('[waitlist] Insert failed', error);
    return NextResponse.json({ error: 'Could not save your email. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true as const, duplicate: false });
}
