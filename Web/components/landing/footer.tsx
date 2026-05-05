import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant/20 bg-gradient-to-b from-surface-mid/50 to-surface-low/80 px-5 py-16 md:px-8">
      <div className="mx-auto flex max-w-content flex-col gap-12 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container text-xs font-extrabold text-on-primary"
              aria-hidden>
              M
            </span>
            <p className="font-display text-lg font-extrabold text-primary">MealMind</p>
          </div>
          <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-on-surface-variant">
            The culinary curator—ingredient-first meals for real life.
          </p>
        </div>
        <div className="flex flex-wrap gap-12 md:gap-16">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Product
            </p>
            <ul className="mt-4 flex flex-col gap-3 font-body text-sm">
              <li>
                <Link href="#features" className="text-on-surface transition hover:text-primary">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-on-surface transition hover:text-primary">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#download" className="text-on-surface transition hover:text-primary">
                  Download
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Legal
            </p>
            <ul className="mt-4 flex flex-col gap-3 font-body text-sm">
              <li>
                <Link href="/terms" className="text-on-surface transition hover:text-primary">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-on-surface transition hover:text-primary">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Support
            </p>
            <p className="mt-4 font-body text-sm">
              <a href="mailto:support@mealmind.app" className="text-on-surface underline decoration-primary/30 underline-offset-4 transition hover:text-primary hover:decoration-primary">
                support@mealmind.app
              </a>
            </p>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-14 max-w-content text-center font-body text-xs text-on-surface-variant">
        © {new Date().getFullYear()} MealMind. Warm typography, calm decisions.
      </p>
    </footer>
  );
}
