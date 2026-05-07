/**
 * Deep narrative: why MealMind exists, how “best match” works, and what makes it different.
 */
export function ProductStorySection() {
  return (
    <section
      id="story"
      className="relative scroll-mt-20 overflow-hidden bg-surface px-5 py-20 md:px-8 md:py-28"
      aria-labelledby="story-heading">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,72rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-primary-container/12 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-24 bottom-20 h-72 w-72 rounded-full bg-secondary-container/35 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-content">
        <div className="max-w-3xl">
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary">Why MealMind</p>
          <h2 id="story-heading" className="mt-3 font-display text-3xl font-extrabold tracking-editorial text-on-surface md:text-4xl lg:text-[2.65rem] text-balance">
            Your fridge is a puzzle. MealMind finds the{' '}
            <span className="gradient-text">best-fit answer</span>—not a random blog list.
          </h2>
          <p className="mt-6 font-body text-lg leading-relaxed text-on-surface-variant md:text-xl text-balance">
            Most apps dump hundreds of recipes and leave you scrolling. MealMind works like a thoughtful sous-chef: it
            looks at what you actually have, how much time you have, and how you like to eat—then surfaces a short list
            of ideas that feel <em className="not-italic text-on-surface">meant</em> for tonight.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-12 lg:gap-8">
          <article className="relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-outline-variant/15 bg-gradient-to-br from-surface-paper via-surface-paper to-secondary-container/25 p-8 shadow-ambient lg:col-span-7 lg:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary-container/20 blur-3xl" aria-hidden />
            <div className="relative">
              <h3 className="font-display text-xl font-bold text-on-surface md:text-2xl">Ingredient-first, always</h3>
              <p className="mt-4 font-body leading-relaxed text-on-surface-variant">
                Type what&apos;s wilting in the crisper, pull from your recent picks, or scan a photo of the counter.
                MealMind uses that list as the <strong className="font-semibold text-on-surface">hard constraint</strong>
                —so you&apos;re not daydreaming about recipes you&apos;d need to shop for.
              </p>
            </div>
            <ul className="relative mt-8 space-y-3 font-body text-sm text-on-surface-variant">
              {[
                'Fewer tabs, fewer “maybe later” saves',
                'Ideas grounded in your real pantry',
                'Room to riff—without losing the thread',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-container" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </article>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <article className="relative overflow-hidden rounded-[1.5rem] border border-primary/15 bg-on-surface p-8 text-surface-paper shadow-ring">
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-primary-container/25 blur-2xl" aria-hidden />
              <p className="relative font-body text-xs font-semibold uppercase tracking-wider text-outline-variant">
                The “best match” idea
              </p>
              <p className="relative mt-4 font-body leading-relaxed text-surface-paper/92">
                Every suggestion is weighed against <strong className="font-semibold text-surface-paper">time</strong>,{' '}
                <strong className="font-semibold text-surface-paper">meal type</strong>,{' '}
                <strong className="font-semibold text-surface-paper">cooking style</strong>, and the{' '}
                <strong className="font-semibold text-surface-paper">taste profile</strong> you set once—so results feel
                curated, not sprayed out of a generic model.
              </p>
            </article>

            <article className="relative rounded-[1.5rem] border border-outline-variant/15 bg-surface-paper p-8 shadow-ambient">
              <p className="font-display text-lg font-bold text-primary">Built for curiosity</p>
              <p className="mt-3 font-body leading-relaxed text-on-surface-variant">
                MealMind is for cooks who want to <strong className="font-semibold text-on-surface">explore</strong>—new
                cuisines, quicker weeknights, healthier defaults—without signing up for another endless feed. Open the
                app, set the vibe, and see what fits <em className="not-italic">you</em>.
              </p>
              <a
                href="#guide"
                className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-primary transition hover:gap-3">
                See your first-week guide
                <span aria-hidden>→</span>
              </a>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
