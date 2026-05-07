import Image from 'next/image';

import { IconPlayVideo } from './icons';

const POSTER =
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1920&q=85';

/** Optional: set NEXT_PUBLIC_LANDING_YOUTUBE_ID (YouTube video id) in .env.local to embed your trailer here. */
export function VideoSpotlightSection() {
  const youtubeId = process.env.NEXT_PUBLIC_LANDING_YOUTUBE_ID?.trim();

  return (
    <section id="watch" className="scroll-mt-20 bg-surface-low px-5 py-20 md:px-8 md:py-28" aria-labelledby="watch-heading">
      <div className="mx-auto max-w-content">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary">Cook with confidence</p>
          <h2 id="watch-heading" className="mt-3 font-display text-3xl font-extrabold tracking-editorial text-on-surface md:text-4xl lg:text-[2.5rem] text-balance">
            Best-match recipes, step by step—with video when you want it
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-on-surface-variant text-balance">
            MealMind helps you discover meals that fit what you have and how you eat, then guides you through each step
            in the app. When it helps, you can lean on video-style guidance alongside the instructions—so you&apos;re
            never guessing at the technique.
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-4xl">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary-container/15 to-secondary-container/30 blur-2xl md:-inset-6" aria-hidden />
          <div className="relative overflow-hidden rounded-[1.35rem] border border-outline-variant/20 bg-on-surface shadow-lift ring-1 ring-white/10">
            <div className="aspect-video w-full bg-on-surface">
              {youtubeId ? (
                <iframe
                  title="MealMind product video"
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <a
                  href="#download"
                  className="group relative flex h-full w-full items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-on-surface">
                  <Image
                    src={POSTER}
                    alt="Home cooks preparing food together in a bright kitchen"
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 896px) 100vw, 896px"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/75 via-on-surface/25 to-on-surface/20" aria-hidden />
                  <span className="relative flex max-w-lg flex-col items-center gap-4 px-6 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-paper/95 text-primary shadow-lift ring-2 ring-white/30 transition duration-300 group-hover:scale-110 group-hover:shadow-glow md:h-20 md:w-20">
                      <IconPlayVideo className="h-8 w-8 md:h-9 md:w-9" />
                    </span>
                    <span className="font-display text-xl font-bold leading-snug text-surface-paper md:text-2xl">
                      Get the app for step-by-step best matches—and video support
                    </span>
                    <span className="font-body text-sm leading-relaxed text-surface-paper/90 md:text-base">
                      From the right recipe for tonight to clear directions and video when you need a visual nudge.
                    </span>
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
