import Link from 'next/link';
import type { ComponentProps } from 'react';

type GlowButtonProps = ComponentProps<typeof Link> & {
  children: React.ReactNode;
  className?: string;
};

export function GlowButton({ children, className = '', ...props }: GlowButtonProps) {
  return (
    <Link
      {...props}
      className={`btn-shine group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-pill px-8 py-3.5 font-body text-base font-semibold text-on-primary shadow-glow ring-1 ring-white/20 transition duration-300 hover:scale-[1.02] hover:shadow-lift active:scale-[0.98] ${className}`}
      style={{
        background: 'linear-gradient(135deg, #8f4e00 0%, #ff9f43 100%)',
      }}>
      <span className="relative z-10">{children}</span>
    </Link>
  );
}

export function GlowButtonOutline({
  children,
  href,
  className = '',
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-pill border-2 border-primary/20 bg-surface-paper/90 px-7 py-3 font-body text-base font-semibold text-primary shadow-ambient backdrop-blur-sm transition hover:border-primary/40 hover:bg-surface-low hover:shadow-lift ${className}`}>
      {children}
    </Link>
  );
}
