import { PART1 } from './part1';
import { PART2 } from './part2';
import { PART3 } from './part3';
import { PART4 } from './part4';
import { PART5 } from './part5';
import { PART6 } from './part6';

export type UiLang = 'mn' | 'en' | 'ja';

interface Pattern {
  re: RegExp;
  en: string;
  ja: string;
}

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Exact (whitespace-normalised) Mongolian string → translations */
const EXACT = new Map<string, { en: string; ja: string }>();
/** Strings containing `{}` placeholders for interpolated values */
const PATTERNS: Pattern[] = [];

for (const [mn, en, ja] of [...PART1, ...PART2, ...PART3, ...PART4, ...PART5, ...PART6]) {
  const key = norm(mn);
  if (key.includes('{}')) {
    const source = key
      .split('{}')
      .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('(.+?)');
    PATTERNS.push({ re: new RegExp(`^${source}$`), en, ja });
  } else {
    EXACT.set(key, { en, ja });
  }
}

function fill(template: string, groups: string[]): string {
  let i = 0;
  return template.replace(/\{\}/g, () => groups[i++] ?? '');
}

/**
 * Translate one UI string. Keeps surrounding whitespace.
 * Returns null when there is no known translation (text stays as authored).
 */
export function translateUi(text: string, lang: UiLang): string | null {
  if (lang === 'mn') return null;
  const core = norm(text);
  if (!core) return null;
  const lead = text.match(/^\s*/)?.[0] ?? '';
  const trail = text.match(/\s*$/)?.[0] ?? '';

  const hit = EXACT.get(core);
  if (hit) return lead + hit[lang] + trail;

  for (const p of PATTERNS) {
    const m = core.match(p.re);
    if (m) return lead + fill(p[lang], m.slice(1)) + trail;
  }
  return null;
}
