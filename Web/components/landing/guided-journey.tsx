const milestones = [
  {
    title: 'Shape your taste profile',
    body: 'Run through a friendly setup: diet, spice, cuisines, goals. It takes minutes and powers every “best match” after that.',
  },
  {
    title: 'Capture what you have',
    body: 'List ingredients, reuse recent picks, or scan a photo. The more honest the list, the smarter the suggestions.',
  },
  {
    title: 'Dial in the moment',
    body: 'Breakfast or dinner? Twenty minutes or slow Sunday? One-pot or sheet pan? MealMind respects the night you’re having.',
  },
  {
    title: 'Pick your match & cook',
    body: 'Browse a tight set of recipe cards, save favorites, and come back when the fridge looks different tomorrow.',
  },
];

export function GuidedJourneySection() {
  return (
    <section
      id="guide"
      className="scroll-mt-20 border-y border-outline-variant/15 bg-surface-mid/50 px-5 py-20 md:px-8 md:py-28"
      aria-labelledby="guide-heading">
      <div className="mx-auto max-w-content">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary">Clear path</p>
          <h2 id="guide-heading" className="mt-3 font-display text-3xl font-extrabold tracking-editorial text-on-surface md:text-4xl text-balance">
            Your first session, explained
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-on-surface-variant text-balance">
            No guesswork: follow these beats once and you&apos;ll know exactly how MealMind finds food that fits your
            life—not just your saved links folder.
          </p>
        </div>

        <ol className="relative mx-auto mt-16 max-w-2xl space-y-0">
          {milestones.map((m, i) => (
            <li key={m.title} className="relative flex gap-5 pb-12 last:pb-0 md:gap-8">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-surface-paper bg-gradient-to-br from-primary to-primary-container font-display text-sm font-extrabold text-on-primary shadow-glow md:h-11 md:w-11">
                {i + 1}
              </div>
              <article className="min-w-0 flex-1 rounded-[1.25rem] border border-outline-variant/15 bg-surface-paper p-6 shadow-ambient md:p-8">
                <h3 className="font-display text-lg font-bold text-on-surface md:text-xl">{m.title}</h3>
                <p className="mt-3 font-body leading-relaxed text-on-surface-variant">{m.body}</p>
              </article>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-14 max-w-xl rounded-[1.25rem] border border-primary/20 bg-gradient-to-r from-secondary-container/45 to-surface-paper p-8 text-center shadow-ambient">
          <p className="font-body font-medium text-on-surface">Ready to try the flow on your phone?</p>
          <a
            href="#download"
            className="btn-shine mt-5 inline-flex min-h-[48px] items-center justify-center rounded-pill bg-gradient-to-r from-primary to-primary-container px-10 font-body font-semibold text-on-primary shadow-glow transition hover:scale-[1.02]">
            Get the app
          </a>
        </div>
      </div>
    </section>
  );
}
