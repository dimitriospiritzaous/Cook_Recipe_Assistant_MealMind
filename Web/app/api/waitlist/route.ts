/**
 * Waitlist API — Next.js Route Handler (Vercel, Node). Inserts into Supabase `waitlist_signups`.
 *
 * Production: set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY on the host (server-only).
 * Fallback: SUPABASE_ANON_KEY works if RLS/policy from the migration is applied.
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSupabaseUrl(): string | null {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  return url || null;
}

async function createWaitlistSupabaseClient() {
  const url = getSupabaseUrl();
  if (!url) return null;

  const { createClient } = await import('@supabase/supabase-js');

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (serviceRole) {
    return createClient(url, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  const anonKey =
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!anonKey) return null;

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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

  const supabase = await createWaitlistSupabaseClient();
  if (!supabase) {
    const vercelHint =
      process.env.VERCEL === '1'
        ? ' On Vercel: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_ANON_KEY, then redeploy.'
        : ' Set SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY (e.g. Web/.env.local).';
    console.error(`[waitlist] Missing Supabase configuration.${vercelHint}`);
    return NextResponse.json(
      { error: 'Waitlist is not configured yet. Try again soon.' },
      { status: 503 },
    );
  }

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
            "Waitlist isn't set up in Supabase yet. Open `20260507120000_waitlist_signups.sql` in the repo, copy the SQL (from create table to the end), paste into Supabase SQL Editor, and Run.",
        },
        { status: 503 },
      );
    }

    const msg = typeof error.message === 'string' ? error.message : '';
    if (
      error.code === '42501' ||
      msg.toLowerCase().includes('permission denied') ||
      msg.toLowerCase().includes('row-level security')
    ) {
      console.error('[waitlist] RLS or permission denied', error);
      return NextResponse.json(
        {
          error:
            'Could not save your email (database permissions). On Vercel, add SUPABASE_SERVICE_ROLE_KEY as a server secret, or re-run the waitlist SQL migration so anon can insert.',
        },
        { status: 503 },
      );
    }

    if (msg.includes('JWT') || msg.includes('Invalid API key') || error.code === 'PGRST301') {
      console.error('[waitlist] Invalid Supabase key or JWT', error);
      return NextResponse.json(
        {
          error:
            'Waitlist configuration error: check SUPABASE_URL and your Supabase key (use the service_role or anon key from Project Settings → API).',
        },
        { status: 503 },
      );
    }

    console.error('[waitlist] Insert failed', error);
    return NextResponse.json({ error: 'Could not save your email. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true as const, duplicate: false });
}
