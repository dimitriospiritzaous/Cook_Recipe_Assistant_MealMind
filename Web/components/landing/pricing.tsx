import { GlowButton } from './glow-button';

const PRO_BULLETS = [
  'Unlimited AI recipes',
  'Personalized nutrition angle',
  'Offline access',
  'Smart grocery lists',
  'Premium support',
];

const PAID_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$20.00',
    unit: '/month',
    caption: 'Billed every month',
    recommended: false,
  },
  {
    id: 'three_month',
    name: '3 months',
    price: '$50.00',
    unit: '/3 mo',
    caption: '~$16.67/mo · Save vs monthly',
    recommended: false,
  },
  {
    id: 'six_month',
    name: '6 months',
    price: '$100.00',
    unit: '/6 mo',
    caption: '~$16.67/mo · Best value',
    recommended: true,
  },
] as const;

export function PricingSection() {
  return (
    <section id="pricing" className="relative scroll-mt-20 overflow-hidden bg-surface-low px-5 py-20 md:px-8 md:py-28">
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-secondary-container/35 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-primary-container/15 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-content">
        <div className="max-w-2xl">
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary">Pricing</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-editorial text-on-surface md:text-4xl lg:text-[2.5rem] text-balance">
            Start free. Upgrade when you want the full kitchen.
          </h2>
          <p className="mt-4 font-body leading-relaxed text-on-surface-variant">
            Prices match the in-app subscription screen—confirm before you publish live billing.
          </p>
        </div>

        <div className="mt-16 flex flex-col gap-10">
          <article className="flex flex-col rounded-card border border-outline-variant/15 bg-surface-paper p-10 shadow-ambient transition hover:shadow-lift">
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Free</p>
            <p className="mt-2 font-display text-4xl font-extrabold text-on-surface md:text-5xl">
              $0
              <span className="text-xl font-semibold text-on-surface-variant">/forever</span>
            </p>
            <ul className="mt-10 flex flex-col gap-1 font-body text-on-surface-variant">
              {['3 recipes per day', 'Basic search', 'Community access'].map((t) => (
                <li key={t} className="border-l-2 border-primary/30 py-2.5 pl-4 leading-snug">
                  {t}
                </li>
              ))}
            </ul>
            <GlowButton href="#download" className="mt-12 w-full sm:w-auto">
              Download free
            </GlowButton>
          </article>

          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary">MealMind Pro</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-on-surface md:text-3xl">
              Same features — pick how often you pay
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {PAID_PLANS.map((plan) => (
                <article
                  key={plan.id}
                  className={`relative flex flex-col rounded-card border bg-surface-paper p-8 shadow-ambient transition hover:shadow-lift ${
                    plan.recommended
                      ? 'border-primary/35 ring-2 ring-primary/15'
                      : 'border-outline-variant/15'
                  }`}>
                  {plan.recommended ? (
                    <div className="absolute -top-3 left-6 inline-flex rounded-pill bg-gradient-to-r from-primary to-primary-container px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wide text-on-primary shadow-glow">
                      Recommended
                    </div>
                  ) : null}
                  <p className={`font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant ${plan.recommended ? 'mt-4' : ''}`}>
                    {plan.name}
                  </p>
                  <p className="mt-2 font-display text-3xl font-extrabold text-on-surface">
                    {plan.price}
                    <span className="text-lg font-semibold text-on-surface-variant">{plan.unit}</span>
                  </p>
                  <p className="mt-2 font-body text-sm text-on-surface-variant">{plan.caption}</p>
                </article>
              ))}
            </div>
          </div>

          <article className="relative flex flex-col overflow-hidden rounded-card border border-primary-container/30 bg-on-surface p-10 text-surface-paper shadow-ring">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-container/25 blur-3xl" aria-hidden />
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"
              aria-hidden
            />

            <p className="relative font-body text-xs font-semibold uppercase tracking-wider text-outline-variant">
              Included in every Pro plan
            </p>
            <ul className="relative mt-8 flex flex-col gap-1 font-body text-surface-paper/90">
              {PRO_BULLETS.map((t) => (
                <li key={t} className="border-l-2 border-primary-container/45 py-2.5 pl-4 leading-snug">
                  {t}
                </li>
              ))}
            </ul>
            <a
              href="#download"
              className="btn-shine relative mt-10 inline-flex w-full items-center justify-center overflow-hidden rounded-pill bg-gradient-to-r from-primary to-primary-container py-4 font-body font-semibold text-on-primary ring-1 ring-white/15 transition hover:scale-[1.02] hover:shadow-lift sm:w-auto sm:px-12">
              Get Pro in the app
            </a>
            <p className="relative mt-5 text-xs leading-relaxed text-outline-variant">
              Pro is purchased inside the mobile app. Choose monthly, 3-month, or 6-month billing there.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
