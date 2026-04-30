/** Words that shouldn’t dominate “sameness” between two titles. */
const TITLE_WEAK_WORDS = new Set([
  'and',
  'with',
  'the',
  'for',
  'from',
  'style',
  'fresh',
  'quick',
  'easy',
  'homemade',
  'classic',
  'simple',
  'healthy',
  'best',
  'one',
  'pan',
  'pot',
  'bowl',
  'meal',
  'dish',
]);

export function normalizeRecipeTitleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function significantTitleWords(title: string): string[] {
  return normalizeRecipeTitleKey(title)
    .split(' ')
    .filter((w) => w.length > 2 && !TITLE_WEAK_WORDS.has(w));
}

/**
 * True if `candidate` is the same or too close to any title in `existingTitles`
 * (exact match, long substring, or high overlap of content words).
 */
export function isNearDuplicateTitle(candidate: string, existingTitles: string[]): boolean {
  const c = normalizeRecipeTitleKey(candidate);
  if (!c) {
    return false;
  }
  for (const ex of existingTitles) {
    const e = normalizeRecipeTitleKey(ex);
    if (!e) {
      continue;
    }
    if (c === e) {
      return true;
    }
    if (c.length >= 14 && e.length >= 14 && (c.includes(e) || e.includes(c))) {
      return true;
    }
    const wa = significantTitleWords(candidate);
    const wb = significantTitleWords(ex);
    if (wa.length === 0 || wb.length === 0) {
      continue;
    }
    const setB = new Set(wb);
    let overlap = 0;
    for (const x of wa) {
      if (setB.has(x)) {
        overlap++;
      }
    }
    const union = new Set([...wa, ...wb]).size;
    if (union > 0 && overlap / union >= 0.68) {
      return true;
    }
  }
  return false;
}
