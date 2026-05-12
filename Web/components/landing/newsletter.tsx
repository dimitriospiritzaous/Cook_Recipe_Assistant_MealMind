'use client';

import { useState, type FormEvent } from 'react';

export function NewsletterSection() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') ?? '').trim();
    if (!email) return;

    setStatus('loading');
    try {
      // Absolute URL avoids edge cases with proxies, previews, or non-root mounts.
      const url = new URL('/api/waitlist', window.location.origin).href;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(payload.error ?? 'Something went wrong. Please try again.');
        setStatus('idle');
        return;
      }

      setStatus('done');
      form.reset();
    } catch {
      setError('Network error. Check your connection and try again.');
      setStatus('idle');
    }
  }

  return (
    <section className="px-5 pb-24 pt-4 md:px-8 md:pb-28">
      <div className="relative mx-auto max-w-content overflow-hidden rounded-[1.75rem] p-[1px] shadow-lift">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: 'linear-gradient(135deg, rgba(143,78,0,0.35), rgba(255,159,67,0.35), rgba(215,229,187,0.5))',
          }}
          aria-hidden
        />
        <div className="relative rounded-[1.7rem] bg-surface-paper px-8 py-14 md:px-14 md:py-16">
          <div className="mx-auto max-w-xl text-center">
            <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary">Stay in touch</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-editorial text-on-surface md:text-3xl">
              Notes from the kitchen
            </h2>
            <p className="mt-3 font-body text-on-surface-variant">
              Join the waitlist for launch updates and seasonal cooking ideas—no spam.
            </p>
            {status === 'done' ? (
              <p className="mt-8 font-body font-semibold text-primary" role="status">
                Thanks—you&apos;re on the list. We&apos;ll be in touch.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="mt-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    required
                    disabled={status === 'loading'}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="min-h-[52px] flex-1 rounded-pill border border-outline-variant/20 bg-surface-high px-6 font-body text-on-surface placeholder:text-on-surface-variant/55 focus:border-primary/25 focus:bg-surface-paper focus:outline-none focus:ring-2 focus:ring-primary/20 enabled:opacity-100 disabled:opacity-60 sm:max-w-sm"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    data-analytics="newsletter_submit"
                    className="btn-shine min-h-[52px] rounded-pill bg-gradient-to-r from-primary to-primary-container px-10 font-body font-semibold text-on-primary shadow-glow transition enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:opacity-60">
                    {status === 'loading' ? 'Saving…' : 'Notify me'}
                  </button>
                </div>
                {error ? (
                  <p className="mt-3 text-center font-body text-sm text-error" role="alert">
                    {error}
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
