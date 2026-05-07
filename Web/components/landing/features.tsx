import { IconHeart, IconLeaf, IconScan, IconSparkles, IconTarget } from './icons';

const features = [
  {
    title: 'Scan ingredients',
    description: 'Point the camera or choose a photo—MealMind reads what’s in frame so you type less.',
    Icon: IconScan,
    span: 'md:col-span-2',
  },
  {
    title: 'Best-match flow',
    description: 'Ingredients + time + meal type + cooking style narrow the field so the “right” dinners surface first—not buried on page nine.',
    Icon: IconTarget,
    span: '',
  },
  {
    title: 'AI curation',
    description: 'Ideas that fit your filters—not generic lists. Personalized suggestions, clearly framed.',
    Icon: IconSparkles,
    span: '',
  },
  {
    title: 'Taste profile',
    description: 'Diet, allergies, cuisines, spice, calories—onboarding that syncs so every session feels yours.',
    Icon: IconLeaf,
    span: '',
  },
  {
    title: 'Favorites & account',
    description: 'Save recipes you love. Sign in with email or OAuth—your profile stays with you.',
    Icon: IconHeart,
    span: 'md:col-span-2',
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="scroll-mt-20 bg-surface px-5 py-20 md:px-8 md:py-28"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(135, 115, 101, 0.07) 1px, transparent 0)`,
        backgroundSize: '28px 28px',
      }}>
      <div className="mx-auto max-w-content">
        <div className="max-w-2xl">
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary">Features</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-editorial text-on-surface md:text-4xl lg:text-[2.5rem] text-balance">
            Depth where it matters—speed everywhere else.
          </h2>
          <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-on-surface-variant text-balance">
            From the first scan to your saved favorites, MealMind is built for people who love food but hate spinning
            their wheels at 6 p.m.
          </p>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className={`group relative overflow-hidden rounded-card border border-transparent bg-surface-paper/90 p-8 shadow-ambient backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-primary/10 hover:shadow-lift ${f.span}`}>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-container to-secondary-container/50 text-primary transition group-hover:from-primary/10 group-hover:to-primary-container/20">
                <f.Icon className="h-8 w-8" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-on-surface">{f.title}</h3>
              <p className="mt-2 font-body leading-relaxed text-on-surface-variant">{f.description}</p>
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-container/10 blur-2xl transition group-hover:bg-primary-container/20"
                aria-hidden
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
