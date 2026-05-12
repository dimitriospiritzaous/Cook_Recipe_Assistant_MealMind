import type { AppLocale } from './locales';
import en from './en';
import es from './es';
import fr from './fr';
import de from './de';
import it from './it';
import pt from './pt';
import ja from './ja';
import ko from './ko';
import zh from './zh';
import ar from './ar';
import hi from './hi';
import tr from './tr';
import ru from './ru';
import pl from './pl';
import nl from './nl';
import sv from './sv';
import da from './da';
import no from './no';
import fi from './fi';
import el from './el';
import he from './he';
import th from './th';
import vi from './vi';
import id from './id';
import uk from './uk';
import ms from './ms';
import ro from './ro';
import cs from './cs';
import hu from './hu';
import bn from './bn';
import tl from './tl';

const bundles: Record<AppLocale, Record<string, string>> = {
  en, es, fr, de, it, pt, ja, ko, zh,
  ar, hi, tr, ru, pl, nl, sv, da, no,
  fi, el, he, th, vi, id, uk, ms, ro,
  cs, hu, bn, tl,
};

/** Replace `{name}`-style placeholders in translated strings. */
export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`,
  );
}

export function translate(locale: AppLocale, key: string, vars?: Record<string, string | number>): string {
  const raw = bundles[locale]?.[key] ?? bundles.en[key] ?? key;
  return interpolate(raw, vars);
}
