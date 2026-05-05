'use client';

import { useState } from 'react';

const items = [
  {
    q: 'Do you train on my ingredients or photos?',
    a: 'MealMind is built to help you cook, not to surprise you with data use. Review the Privacy policy for what we store (e.g. profile and account data via Supabase) and update it to match your production practices.',
  },
  {
    q: 'Is this medical or nutrition advice?',
    a: 'Recipes and suggestions are for inspiration. For medical diets or conditions, follow guidance from a qualified professional.',
  },
  {
    q: 'Can I use MealMind offline?',
    a: 'Free and Pro capabilities differ. Pro messaging in the app includes offline access—confirm what you ship before promising it here.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Use the in-app account or support flow. Link your live support email in the footer when ready.',
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-surface-low px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-content">
        <div className="max-w-2xl">
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-editorial text-on-surface md:text-4xl lg:text-[2.5rem]">
            Straight answers
          </h2>
        </div>
        <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-card border border-outline-variant/15 bg-surface-paper shadow-lift">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={`border-b border-outline-variant/15 last:border-b-0 ${isOpen ? 'bg-surface-low/40' : ''}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-surface-low/30 md:px-8 md:py-6"
                  aria-expanded={isOpen}>
                  <span className="font-display text-base font-bold text-on-surface md:text-lg">{item.q}</span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary-container/80 font-display text-lg text-primary transition ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden>
                    ⌄
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}>
                  <div className="min-h-0 overflow-hidden">
                    <p className="px-6 pb-6 font-body leading-relaxed text-on-surface-variant md:px-8">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
