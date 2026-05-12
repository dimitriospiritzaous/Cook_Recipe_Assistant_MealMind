import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — MealMind',
  description: 'MealMind terms of service. Read before using the App.',
};

const EFFECTIVE_DATE = 'May 13, 2026';
const CONTACT_EMAIL = 'davidpeter19900320@gmail.com';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface px-5 py-16 md:px-8">
      <article className="prose-mealmind mx-auto max-w-2xl">
        <Link href="/" className="font-body text-sm font-semibold text-primary hover:underline">
          &larr; Back to home
        </Link>

        <h1 className="mt-8 font-display text-3xl font-extrabold tracking-editorial text-on-surface">
          Terms of Service
        </h1>
        <p className="mt-2 font-body text-sm text-on-surface-variant">
          Effective date: {EFFECTIVE_DATE}
        </p>

        <div className="mt-8 space-y-8 font-body text-[15px] leading-relaxed text-on-surface-variant">
          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2">
              By downloading, installing, or using the MealMind mobile application (the
              &quot;App&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
              If you do not agree to these Terms, do not use the App.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">
              2. Description of Service
            </h2>
            <p className="mt-2">
              MealMind is an AI-powered recipe assistant that generates personalized meal suggestions
              based on the ingredients you provide, your dietary preferences, and your cooking
              profile. The App may include free and paid subscription features.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">3. User Accounts</h2>
            <p className="mt-2">
              You may be required to create an account to access certain features. You are
              responsible for maintaining the confidentiality of your account credentials and for all
              activities that occur under your account. You agree to provide accurate and complete
              information when creating your account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">
              4. Subscriptions &amp; Payments
            </h2>

            <h3 className="mt-4 font-display text-base font-semibold text-on-surface">
              4.1 Free Tier
            </h3>
            <p className="mt-1">
              The App offers a limited free tier that allows a one-time AI recipe generation.
              Additional features require a paid subscription.
            </p>

            <h3 className="mt-4 font-display text-base font-semibold text-on-surface">
              4.2 MealMind Pro
            </h3>
            <p className="mt-1">
              MealMind Pro is available as a monthly, 3-month, or 6-month subscription. Payment is
              charged to your Apple ID or Google Play account at confirmation of purchase.
            </p>

            <h3 className="mt-4 font-display text-base font-semibold text-on-surface">
              4.3 Auto-Renewal
            </h3>
            <p className="mt-1">
              Subscriptions automatically renew unless auto-renew is turned off at least 24 hours
              before the end of the current period. Your account will be charged for renewal within
              24 hours prior to the end of the current period at the same price.
            </p>

            <h3 className="mt-4 font-display text-base font-semibold text-on-surface">
              4.4 Managing Subscriptions
            </h3>
            <p className="mt-1">
              You can manage or cancel your subscription through your device&apos;s App Store or
              Google Play settings. Cancellation takes effect at the end of the current billing
              period. No refunds are provided for partial billing periods.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">5. Acceptable Use</h2>
            <p className="mt-2">You agree not to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use the App for any unlawful purpose</li>
              <li>
                Attempt to reverse-engineer, decompile, or disassemble any part of the App
              </li>
              <li>
                Interfere with or disrupt the App&apos;s servers or networks
              </li>
              <li>Use automated systems to access the App in a manner that exceeds reasonable use</li>
              <li>Impersonate another person or entity</li>
              <li>Upload malicious content or attempt to exploit vulnerabilities</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">
              6. AI-Generated Content
            </h2>
            <p className="mt-2">
              Recipes and nutritional information provided by MealMind are generated by artificial
              intelligence and are for informational purposes only. We do not guarantee the accuracy,
              completeness, or suitability of any recipe or nutritional data. Always use your own
              judgment regarding food safety, allergies, and dietary needs.
            </p>
            <p className="mt-2">
              <strong className="text-on-surface">
                MealMind is not a substitute for professional medical or nutritional advice.
              </strong>{' '}
              Consult a healthcare professional before making significant dietary changes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">
              7. Intellectual Property
            </h2>
            <p className="mt-2">
              The App, its original content, features, and functionality are owned by MealMind and
              are protected by international copyright, trademark, and other intellectual property
              laws. You retain ownership of any personal content (e.g., photos) you upload, but
              grant us a limited license to process it for the purpose of providing the service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">
              8. Disclaimer of Warranties
            </h2>
            <p className="mt-2">
              The App is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make
              no warranties, expressed or implied, regarding the App&apos;s reliability, accuracy,
              availability, or fitness for a particular purpose. We do not warrant that the App will
              be uninterrupted, error-free, or free of harmful components.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">
              9. Limitation of Liability
            </h2>
            <p className="mt-2">
              To the fullest extent permitted by applicable law, MealMind shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, including but not
              limited to loss of profits, data, or goodwill, arising out of or in connection with
              your use of the App.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">10. Termination</h2>
            <p className="mt-2">
              We reserve the right to suspend or terminate your access to the App at any time,
              without prior notice, for conduct that we believe violates these Terms or is harmful to
              other users or the App. You may delete your account at any time through the App&apos;s
              Profile settings.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">
              11. Changes to These Terms
            </h2>
            <p className="mt-2">
              We reserve the right to modify these Terms at any time. We will notify you of
              significant changes by posting the updated Terms in the App or on our website.
              Continued use of the App after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">12. Governing Law</h2>
            <p className="mt-2">
              These Terms shall be governed by and construed in accordance with applicable laws,
              without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-on-surface">13. Contact Us</h2>
            <p className="mt-2">
              If you have any questions about these Terms, please contact us at:{' '}
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
