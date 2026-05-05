import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'MealMind privacy policy — placeholder until legal publishes the final document.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface px-5 py-16 md:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="font-body text-sm font-semibold text-primary hover:underline">
          ← Back to home
        </Link>
        <h1 className="mt-8 font-display text-3xl font-extrabold tracking-editorial text-on-surface">
          Privacy policy
        </h1>
        <p className="mt-6 font-body leading-relaxed text-on-surface-variant">
          This is a <strong className="text-on-surface">placeholder page</strong> for{' '}
          <code className="rounded bg-surface-high px-1.5 py-0.5 text-sm">mealmind.app/privacy</code>. Describe
          data practices for profiles (e.g. Supabase), optional analytics, ingredient images, and retention.
          Replace before production.
        </p>
      </div>
    </div>
  );
}
