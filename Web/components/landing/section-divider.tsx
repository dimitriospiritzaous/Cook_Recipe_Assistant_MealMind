type DividerTone = 'to-low' | 'to-surface';

const toneClass: Record<DividerTone, string> = {
  'to-low': 'text-surface-low',
  'to-surface': 'text-surface',
};

/** Organic wave between sections — `to-low` enters a surface-low block; `to-surface` returns to cream. */
export function SectionDivider({ tone = 'to-low' }: { tone?: DividerTone }) {
  return (
    <div
      className={`relative -mt-px h-12 w-full overflow-hidden ${tone === 'to-low' ? 'bg-surface' : 'bg-surface-low'}`}
      aria-hidden>
      <svg
        className={`absolute -bottom-px left-0 h-14 w-[110%] ${toneClass[tone]}`}
        preserveAspectRatio="none"
        viewBox="0 0 1200 56"
        fill="currentColor">
        <path d="M0 56h1200V32c-150 18-300 8-450-4s-300-10-450 4-300 22-450 4-300-12-450 0V56z" />
      </svg>
    </div>
  );
}
