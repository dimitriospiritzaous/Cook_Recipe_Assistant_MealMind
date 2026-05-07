'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { IconClose, IconMenu } from './icons';

const nav = [
  { href: '#story', label: 'Story' },
  { href: '#watch', label: 'Watch' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#guide', label: 'Guide' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-outline-variant/25 bg-surface/92 shadow-ambient backdrop-blur-xl backdrop-saturate-150'
            : 'border-b border-transparent bg-surface/70 backdrop-blur-md'
        }`}>
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-3.5 md:gap-6 md:px-8 md:py-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-container text-sm font-extrabold text-on-primary shadow-glow transition group-hover:shadow-lift"
              aria-hidden>
              M
            </span>
            <span className="font-display text-lg font-extrabold tracking-editorial text-primary transition group-hover:text-primary/90">
              MealMind
            </span>
          </Link>

          <nav
            className="hidden max-w-[min(100%,28rem)] flex-wrap items-center justify-end gap-x-0 gap-y-1 md:flex lg:max-w-none lg:flex-nowrap lg:gap-x-0.5"
            aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative px-2 py-2 font-body text-[13px] font-medium text-on-surface-variant transition hover:text-primary lg:px-3 lg:text-sm">
                {item.label}
                <span className="absolute inset-x-3 -bottom-px h-px scale-x-0 bg-gradient-to-r from-primary to-primary-container transition group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="#download"
              className="hidden rounded-pill bg-gradient-to-r from-secondary-container to-secondary-container/80 px-5 py-2.5 font-body text-sm font-semibold text-on-secondary-container shadow-ambient transition hover:shadow-lift sm:inline-flex">
              Get the app
            </Link>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-primary md:hidden"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-label="Open menu">
              <IconMenu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="animate-fade-up absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-surface-paper shadow-lift">
            <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
              <span className="font-display font-bold text-primary">Menu</span>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-on-surface-variant"
                onClick={() => setOpen(false)}
                aria-label="Close">
                <IconClose className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col p-4" aria-label="Mobile">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3.5 font-body text-base font-medium text-on-surface transition hover:bg-surface-low">
                  {item.label}
                </Link>
              ))}
              <Link
                href="#download"
                onClick={() => setOpen(false)}
                className="mt-4 rounded-pill bg-gradient-to-r from-primary to-primary-container px-4 py-3.5 text-center font-body font-semibold text-on-primary">
                Get the app
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
