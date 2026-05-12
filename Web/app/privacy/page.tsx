import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — MealMind',
  description: 'MealMind privacy policy. Learn how we collect, use, and protect your data.',
};

const EFFECTIVE_DATE = 'May 13, 2026';
const CONTACT_EMAIL = 'davidpeter19900320@gmail.com';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface px-5 py-16 md:px-8">
      <article className="prose-mealmind mx-auto max-w-2xl">
        <Link href="/" className="font-body text-sm font-semibold text-primary hover:underline">
          &larr; Back to home
        </Link>

        <h1 className="mt-8 font-display text-3xl font-extrabold tracking-editorial text-on-surface">
          Privacy Policy
        </h1>
        <p className="mt-2 font-body text-sm text-on-surface-variant">
          Effective date: {EFFECTIVE_DATE}
        </p>

        <div className="mt-8 space-y-8 font-body text-[15px] leading-relaxed text-on-surface-variant">
          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">1. Introduction</h2>
            <p className="mt-2">
              MealMind (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the MealMind mobile
              application (the &quot;App&quot;). This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use the App. Please read this policy
              carefully. By using the App, you agree to the collection and use of information in
              accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">
              2. Information We Collect
            </h2>

            <h3 className="mt-4 font-display text-base font-semibold text-on-surface">
              2.1 Account Information
            </h3>
            <p className="mt-1">
              When you create an account, we collect your email address and authentication
              credentials. If you sign in with Google or Apple, we receive your name and email from
              those providers. We do not store your social-login passwords.
            </p>

            <h3 className="mt-4 font-display text-base font-semibold text-on-surface">
              2.2 Profile &amp; Preference Data
            </h3>
            <p className="mt-1">
              To personalize your experience, we store your taste profile, dietary preferences,
              cooking skill level, country/region, wellness goals, and other onboarding answers. This
              data is stored securely on our servers (Supabase) and locally on your device.
            </p>

            <h3 className="mt-4 font-display text-base font-semibold text-on-surface">
              2.3 Ingredient Photos
            </h3>
            <p className="mt-1">
              If you use the ingredient-scan feature, your photo is sent to a third-party AI vision
              service (OpenAI or Google Gemini) to identify ingredients. We do not permanently store
              these images on our servers. The third-party provider may process them according to
              their own privacy policy.
            </p>

            <h3 className="mt-4 font-display text-base font-semibold text-on-surface">
              2.4 Usage Data
            </h3>
            <p className="mt-1">
              We may collect anonymous usage analytics such as which features are used, session
              duration, and crash reports to improve the App. This data does not personally identify
              you.
            </p>

            <h3 className="mt-4 font-display text-base font-semibold text-on-surface">
              2.5 Subscription Data
            </h3>
            <p className="mt-1">
              In-app purchases and subscriptions are processed by Apple (App Store) or Google (Google
              Play). We receive confirmation of your subscription status through RevenueCat but do
              not have access to your payment card details.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">
              3. How We Use Your Information
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Generate personalized recipe recommendations based on your preferences</li>
              <li>Save your favorite recipes and ingredient history</li>
              <li>Process and manage your subscription</li>
              <li>Improve the App through anonymized analytics</li>
              <li>Communicate with you about updates or support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">
              4. Third-Party Services
            </h2>
            <p className="mt-2">We use the following third-party services:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-on-surface">Supabase</strong> — authentication and data
                storage
              </li>
              <li>
                <strong className="text-on-surface">OpenAI / Google Gemini</strong> — AI-powered
                recipe generation and ingredient scanning
              </li>
              <li>
                <strong className="text-on-surface">RevenueCat</strong> — subscription management
              </li>
              <li>
                <strong className="text-on-surface">Apple / Google</strong> — OAuth sign-in and
                payment processing
              </li>
            </ul>
            <p className="mt-2">
              Each service operates under its own privacy policy. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">5. Data Retention</h2>
            <p className="mt-2">
              We retain your account and profile data for as long as your account is active. You may
              delete your account at any time from the Profile screen in the App, which removes your
              profile data from our servers. Local data (favorites, preferences) is cleared from your
              device upon account deletion.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">6. Data Security</h2>
            <p className="mt-2">
              We implement commercially reasonable security measures to protect your data, including
              encrypted connections (TLS), secure authentication tokens, and row-level security
              policies on our database. However, no method of electronic transmission or storage is
              100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">
              7. Children&apos;s Privacy
            </h2>
            <p className="mt-2">
              The App is not intended for children under the age of 13. We do not knowingly collect
              personal information from children under 13. If we learn that we have collected
              personal information from a child under 13, we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">8. Your Rights</h2>
            <p className="mt-2">You have the right to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent for data processing at any time</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us at{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline underline-offset-4">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">
              9. Changes to This Policy
            </h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes by posting the new policy in the App or on our website. Your continued use of
              the App after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">10. Contact Us</h2>
            <p className="mt-2">
              If you have any questions about this Privacy Policy, please contact us at:{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline underline-offset-4">
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </div>

        <p className="mt-12 border-t border-outline-variant/20 pt-6 font-body text-xs text-on-surface-variant">
          &copy; {new Date().getFullYear()} MealMind. All rights reserved.
        </p>
      </article>
    </div>
  );
}
