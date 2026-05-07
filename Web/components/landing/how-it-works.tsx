const steps = [
  {
    n: '01',
    title: 'Add what’s on hand',
    body: 'Type ingredients, pull from recents, or scan from your camera roll. MealMind treats that list as ground truth—no fantasy shopping trip.',
  },
  {
    n: '02',
    title: 'Set the constraints',
    body: 'Breakfast or dinner? 15 minutes or slow roast? Sheet pan, one-pot, light & fresh? You set the guardrails; the app works inside them.',
  },
  {
    n: '03',
    title: 'Get your best matches',
    body: 'See a tight shortlist of recipe cards tuned to your taste profile—not an infinite scroll. Save favorites for the nights you’re rushing.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-surface-low px-5 pb-20 pt-4 md:px-8 md:pb-28 md:pt-2">
      <div className="mx-auto max-w-content">
        <div className="max-w-2xl">
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-editorial text-on-surface md:text-4xl lg:text-[2.5rem] text-balance">
            Three calm steps from “what do we eat?” to “let’s cook.”
          </h2>
          <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-on-surface-variant text-balance">
            No mystery algorithms you can&apos;t trust—just your ingredients, your schedule, and your preferences
            blended into suggestions you can actually use tonight.
          </p>
        </div>

        <div className="relative mt-16 md:mt-20">
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <article
                key={s.n}
                className={`group relative rounded-card border border-outline-variant/10 bg-surface-paper p-8 shadow-ambient transition duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-lift ${
                  i === 1 ? 'md:-translate-y-3 md:hover:-translate-y-4' : ''
                }`}>
                <div className="relative z-10 flex items-start gap-4 md:block">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 to-primary-container font-display text-lg font-extrabold text-on-primary shadow-glow md:mb-6">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-on-surface transition group-hover:text-primary">
                      {s.title}
                    </h3>
                    <p className="mt-3 font-body leading-relaxed text-on-surface-variant">{s.body}</p>
                  </div>
                </div>
                <div
                  className="pointer-events-none absolute inset-0 rounded-card bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition group-hover:opacity-100"
                  aria-hidden
                />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
