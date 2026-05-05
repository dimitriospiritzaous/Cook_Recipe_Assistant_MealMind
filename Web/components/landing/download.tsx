import { IconApple, IconPlay } from './icons';

/** Replace with live store URLs when the apps ship. */
const APP_STORE_URL = 'https://apps.apple.com/app/mealmind/id0000000000';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.mealmind';

export function DownloadSection() {
  return (
    <section id="download" className="scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <div className="relative mx-auto max-w-content overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-gradient-to-br from-secondary-container via-surface-paper to-surface-mid px-8 py-16 shadow-lift md:px-16 md:py-24">
        <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-secondary/10 blur-2xl" aria-hidden />

        <div className="relative mx-auto max-w-2xl text-center">
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary">Download</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-editorial text-on-surface md:text-4xl lg:text-[2.75rem] text-balance">
            Get MealMind on your phone
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-on-surface-variant text-balance">
            Install on iOS or Android. Your taste profile and favorites sync when you sign in.
          </p>
          <div className="mt-12 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:justify-center">
            <a
              href={APP_STORE_URL}
              data-analytics="cta_app_store_click"
              className="group inline-flex min-h-[52px] min-w-[220px] items-center justify-center gap-3 rounded-2xl bg-on-surface px-8 py-3.5 font-body text-sm font-semibold text-surface-paper shadow-lift transition hover:scale-[1.02] hover:shadow-glow active:scale-[0.98]">
              <IconApple className="h-7 w-7 transition group-hover:scale-110" />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">Download on the</span>
                <span className="text-base">App Store</span>
              </span>
            </a>
            <a
              href={PLAY_STORE_URL}
              data-analytics="cta_play_store_click"
              className="group inline-flex min-h-[52px] min-w-[220px] items-center justify-center gap-3 rounded-2xl border-2 border-on-surface/15 bg-surface-paper/95 px-8 py-3.5 font-body text-sm font-semibold text-on-surface shadow-ambient backdrop-blur-sm transition hover:border-primary/25 hover:shadow-lift active:scale-[0.98]">
              <IconPlay className="h-6 w-6 text-primary transition group-hover:scale-110" />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[10px] font-medium uppercase tracking-wide text-on-surface-variant">
                  Get it on
                </span>
                <span className="text-base">Google Play</span>
              </span>
            </a>
          </div>
          <p className="mt-8 font-body text-xs leading-relaxed text-on-surface-variant">
            Placeholder links—swap for real App Store and Play URLs before launch.
          </p>
        </div>
      </div>
    </section>
  );
}
