import Image from 'next/image';

import { GlowButton, GlowButtonOutline } from './glow-button';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85';

/** Matches outer `rounded-[2rem]` minus the 3px gradient padding so inner media aligns with the frame. */
const HERO_PREVIEW_INNER_RADIUS = 'calc(2rem - 3px)';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-10 md:px-8 md:pb-32 md:pt-14">
      <div className="pointer-events-none absolute inset-0 gradient-mesh" aria-hidden />
      <div className="pointer-events-none absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-primary-container/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-16 bottom-1/4 h-64 w-64 rounded-full bg-secondary-container/40 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-content gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20">
        <div className="max-w-xl lg:pl-1">
          <p
            className="mb-5 inline-flex items-center gap-2 rounded-pill border border-secondary/10 bg-secondary-container/75 px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-on-secondary-container shadow-ambient opacity-0-start animate-fade-up">
            The culinary curator
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.06] tracking-editorial text-on-surface opacity-0-start animate-fade-up animate-delay-100 md:text-5xl lg:text-[3.35rem] text-balance">
            Cook from what you{' '}
            <span className="gradient-text-animated">already have</span>
            —without the decision fatigue.
          </h1>
          <p className="mt-7 font-body text-lg leading-relaxed text-on-surface-variant opacity-0-start animate-fade-up animate-delay-200 md:text-xl text-balance">
            MealMind pairs your ingredients, time, and taste with ideas that feel editorial, not robotic. Scan the
            fridge, set the mood, and get recipes worth making tonight.
          </p>
          <ul className="mt-9 flex flex-col gap-3 font-body text-on-surface-variant sm:flex-row sm:flex-wrap">
            {['Ingredient-first flow', 'Smart time & style filters', 'Taste profile that learns you'].map(
              (t, i) => (
                <li
                  key={t}
                  style={{ animationDelay: `${300 + i * 80}ms` }}
                  className="flex items-center gap-2.5 rounded-card border border-outline-variant/15 bg-surface-paper/95 px-4 py-2.5 text-sm font-medium shadow-ambient opacity-0-start animate-fade-up backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-br from-primary to-primary-container shadow-sm" aria-hidden />
                  {t}
                </li>
              ),
            )}
          </ul>
          <div className="mt-11 flex flex-col gap-4 opacity-0-start animate-fade-up animate-delay-500 sm:flex-row sm:items-center">
            <GlowButton href="#download">Get MealMind</GlowButton>
            <GlowButtonOutline href="#how-it-works">See how it works</GlowButtonOutline>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
          <div
            className="absolute -left-8 top-8 hidden font-display text-[10rem] font-extrabold leading-none text-primary/[0.06] lg:block"
            aria-hidden>
            &
          </div>
          <div
            className="absolute -left-4 -top-4 h-36 w-36 rounded-full bg-gradient-to-br from-primary-container/30 to-transparent blur-2xl md:h-44 md:w-44"
            aria-hidden
          />
          <div
            className="absolute -bottom-6 -right-2 h-44 w-44 rounded-full bg-secondary-container/55 blur-2xl md:h-52 md:w-52"
            aria-hidden
          />

          <div className="relative animate-float [animation-delay:0.5s] lg:translate-x-2">
            <div className="absolute -right-2 top-8 z-10 rounded-2xl border border-surface-paper/80 bg-surface-paper/95 px-4 py-3 shadow-lift backdrop-blur-md md:-right-6 md:top-12">
              <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-primary">Live preview</p>
              <p className="mt-0.5 font-display text-sm font-bold text-on-surface">Curating your plate</p>
            </div>

            <div className="relative rotate-[1.5deg] overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary-container to-secondary p-[3px] shadow-ring transition duration-500 hover:rotate-0 hover:shadow-lift">
              <div
                className="overflow-hidden bg-surface-paper shadow-ambient"
                style={{ borderRadius: HERO_PREVIEW_INNER_RADIUS }}>
                <div
                  className="group relative aspect-[4/5] w-full overflow-hidden"
                  style={{ borderRadius: HERO_PREVIEW_INNER_RADIUS }}>
                  <Image
                    src={HERO_IMAGE}
                    alt="Colorful vegetable bowl—fresh ingredients styled like a lifestyle magazine"
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    style={{ borderRadius: HERO_PREVIEW_INNER_RADIUS }}
                    sizes="(max-width: 1024px) 100vw, 480px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-on-surface/5 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-surface-paper/90 p-4 shadow-lift backdrop-blur-md">
                    <p className="font-display text-sm font-bold text-primary">Tonight&apos;s direction</p>
                    <p className="mt-1 font-body text-sm text-on-surface-variant">
                      Potato · carrot · 30 min · sheet-pan cozy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-5 text-center font-body text-xs leading-relaxed text-on-surface-variant/85 lg:text-left">
            Inspiration photo; your real recipe card may differ. MealMind curates ideas tailored to you.
          </p>
        </div>
      </div>
    </section>
  );
}
