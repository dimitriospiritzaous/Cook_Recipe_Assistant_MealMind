'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';

/** Natural-light, editorial food photography (Unsplash). */
const FOOD_CAROUSEL = [
  {
    src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=88',
    alt: 'Chef plating a colorful dish in warm restaurant light',
  },
  {
    src: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=88',
    alt: 'Fresh rainbow salad bowl with crisp vegetables overhead',
  },
  {
    src: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=88',
    alt: 'Rustic wood table with artisan pizza and herbs',
  },
  {
    src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=88',
    alt: 'Stack of pancakes with berries and maple drizzle',
  },
  {
    src: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=88',
    alt: 'Bright vegetable bowl with grains on a light table',
  },
  {
    src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=88',
    alt: 'Juicy burgers and grilled sides in natural daylight',
  },
  {
    src: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=1200&q=88',
    alt: 'Grilled salmon with lemon and roasted vegetables',
  },
  {
    src: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=88',
    alt: 'Rustic tomato pasta with parmesan and basil',
  },
] as const;

const INNER_RADIUS = 'calc(1.125rem - 2px)';
const AUTO_ADVANCE_MS = 4200;
const GAP_PX = 20;

export function FoodGallerySection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);

  const advance = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || pauseRef.current) return;
    const slide = el.querySelector('[data-carousel-slide]') as HTMLElement | null;
    if (!slide) return;
    const step = slide.offsetWidth + GAP_PX;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    if (el.scrollLeft >= max - 8) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollTo({ left: Math.min(el.scrollLeft + step, max), behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(advance, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [advance]);

  return (
    <section
      className="relative overflow-hidden bg-surface px-5 py-14 md:px-8 md:py-20"
      aria-label="Meal inspiration gallery">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-outline-variant/25 to-transparent" />
      <div className="relative mx-auto max-w-content">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary">Live from the kitchen</p>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-editorial text-on-surface md:text-3xl text-balance">
            Curating plates you&apos;ll actually want to cook
          </h2>
          <p className="mt-3 font-body text-on-surface-variant md:text-lg text-balance">
            Real meals, natural light—the kind of results MealMind chases when it pairs your ingredients with your time,
            style, and taste.
          </p>
        </div>

        <div
          className="relative mt-12"
          onMouseEnter={() => {
            pauseRef.current = true;
          }}
          onMouseLeave={() => {
            pauseRef.current = false;
          }}>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-surface to-transparent md:w-16"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-surface to-transparent md:w-16"
            aria-hidden
          />

          <div
            ref={scrollerRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Rotating food photography"
            tabIndex={0}
            className="food-carousel -mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-3 pt-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
            {FOOD_CAROUSEL.map((item) => (
              <div
                key={item.src}
                data-carousel-slide
                className="food-frame-ring group relative w-[min(82vw,340px)] shrink-0 snap-center sm:w-[min(72vw,380px)] md:w-[360px]">
                <div className="food-frame-inner overflow-hidden bg-surface-paper shadow-ambient" style={{ borderRadius: INNER_RADIUS }}>
                  <div
                    className="relative aspect-[4/5] w-full overflow-hidden"
                    style={{ borderRadius: INNER_RADIUS }}>
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                      style={{ borderRadius: INNER_RADIUS }}
                      sizes="(max-width: 640px) 82vw, 360px"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-on-surface/40 via-on-surface/[0.02] to-transparent" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
