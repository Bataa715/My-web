// Аналитик + сорилын багц бүрдүүлэгч (deck builders).
// Progress төлөв + асуултын сан дээр тулгуурласан цэвэр функцууд.

import { QUESTIONS, shuffle, type Domain, type Question } from '@/features/cyber/quiz/questions';
import { DOMAIN_META } from './domains';
import type { ProgressState, QStat } from '@/features/cyber/store/progress';

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export interface DomainAcc {
  domain: Domain;
  seen: number;
  correct: number;
  pct: number; // 0..100, seen===0 бол -1 (мэдээлэлгүй)
}

/** Домэйн тус бүрийн нарийвчлалыг per-question статистикаас нэгтгэнэ */
export function domainAccuracy(qstats: Record<string, QStat>): DomainAcc[] {
  const agg = new Map<Domain, { seen: number; correct: number }>();
  for (const d of Object.keys(DOMAIN_META) as Domain[]) agg.set(d, { seen: 0, correct: 0 });
  for (const [id, st] of Object.entries(qstats)) {
    const q = BY_ID.get(id);
    if (!q) continue;
    const a = agg.get(q.domain)!;
    a.seen += st.seen;
    a.correct += st.correct;
  }
  return (Object.keys(DOMAIN_META) as Domain[]).map((domain) => {
    const a = agg.get(domain)!;
    return { domain, seen: a.seen, correct: a.correct, pct: a.seen ? Math.round((a.correct / a.seen) * 100) : -1 };
  });
}

/** Хамгийн сул домэйнууд (мэдээлэлтэй, нарийвчлал багатай эхэнд) */
export function weakDomains(state: ProgressState, limit = 3): DomainAcc[] {
  let accs = domainAccuracy(state.qstats).filter((a) => a.seen >= 3);
  // Хангалттай мэдээлэл алга бол diagnostic-ийн задаргаанаас авна
  if (accs.length < limit && state.diagnostic.byDomain) {
    const diag = state.diagnostic.byDomain;
    accs = (Object.keys(DOMAIN_META) as Domain[])
      .map((domain) => {
        const d = diag[domain];
        return { domain, seen: d?.total ?? 0, correct: d?.correct ?? 0, pct: d && d.total ? Math.round((d.correct / d.total) * 100) : -1 };
      })
      .filter((a) => a.seen > 0);
  }
  return accs.sort((x, y) => x.pct - y.pct).slice(0, limit);
}

/** Давталтын хугацаа болсон асуултын id-ууд (Leitner) */
export function dueReviewIds(qstats: Record<string, QStat>, now = Date.now()): string[] {
  return Object.entries(qstats)
    .filter(([, st]) => st.seen > 0 && st.due <= now && st.box < 5)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id);
}

/** Асуултын сангийн хамрах хүрээ (харсан асуултын хувь) */
export function coverage(qstats: Record<string, QStat>): number {
  return Math.round((Object.keys(qstats).length / QUESTIONS.length) * 100);
}

export interface Readiness {
  score: number; // 0..100
  level: string;
  labelMn: string;
  color: string; // tailwind text color class
}

const LEVELS: { min: number; level: string; labelMn: string; color: string }[] = [
  { min: 85, level: 'Exam-Ready Practice', labelMn: 'Шалгалтад бэлэн (дадлагын түвшин)', color: 'text-state-ok' },
  { min: 75, level: 'Strong', labelMn: 'Хүчтэй', color: 'text-state-ok' },
  { min: 60, level: 'Intermediate', labelMn: 'Дунд', color: 'text-cspc' },
  { min: 40, level: 'Developing', labelMn: 'Хөгжиж буй', color: 'text-state-warn' },
  { min: 0, level: 'Foundation', labelMn: 'Суурь', color: 'text-state-err' },
];

/**
 * Дадлагын бэлэн байдлын оноо — албан ёсны EC-Council таамаг БИШ.
 * Diagnostic, сүүлийн шалгалтууд, хамрах хүрээ, сул талын торгууль, тогтвортой
 * байдлыг нэгтгэнэ.
 */
export function readiness(state: ProgressState): Readiness {
  const accs = domainAccuracy(state.qstats).filter((a) => a.seen >= 1);
  const avgAcc = accs.length ? accs.reduce((s, a) => s + a.pct, 0) / accs.length : 0;

  const exams = state.history.filter((h) => h.mode === 'mock' || h.mode === 'timed' || h.mode === 'diagnostic').slice(0, 5);
  const examAvg = exams.length ? exams.reduce((s, h) => s + h.pct, 0) / exams.length : avgAcc;

  const cov = coverage(state.qstats); // 0..100
  const consistency = Math.min(state.streak.current, 7) / 7; // 0..1

  // Жинлэлт: нарийвчлал 45%, шалгалт 30%, хамрах хүрээ 15%, тогтвортой 10%
  let score =
    avgAcc * 0.45 +
    examAvg * 0.3 +
    cov * 0.15 +
    consistency * 100 * 0.1;

  // Хэт цөөн мэдээлэлтэй бол оноог дарна
  const answered = Object.values(state.qstats).reduce((a, q) => a + q.seen, 0);
  if (answered < 20) score *= 0.6;

  score = Math.max(0, Math.min(100, Math.round(score)));
  const lv = LEVELS.find((l) => score >= l.min)!;
  return { score, level: lv.level, labelMn: lv.labelMn, color: lv.color };
}

// ── Deck builders ────────────────────────────────────────────────

export function byDomain(domain: Domain): Question[] {
  return QUESTIONS.filter((q) => q.domain === domain);
}

export function quickDeck(n = 10): Question[] {
  return shuffle(QUESTIONS).slice(0, n);
}

export function topicDeck(domain: Domain, n = 20): Question[] {
  return shuffle(byDomain(domain)).slice(0, n);
}

/** Сул талын дадлага — буруу/давталт хүлээж буй асуултыг эрэмбэлж авна */
export function weakDeck(state: ProgressState, n = 20): Question[] {
  const now = Date.now();
  const scored = QUESTIONS.map((q) => {
    const st = state.qstats[q.id];
    let priority = 0;
    if (st) {
      if (st.last === 'wrong') priority += 100;
      priority += st.wrong * 10;
      if (st.due <= now) priority += 20;
      priority -= st.box * 5;
    }
    return { q, priority, r: Math.random() };
  });
  const withData = scored.filter((s) => s.priority > 0).sort((a, b) => b.priority - a.priority);
  const pick = withData.slice(0, n).map((s) => s.q);
  // Хангалтгүй бол санамсаргүй нэмнэ
  if (pick.length < n) {
    const rest = shuffle(QUESTIONS.filter((q) => !pick.includes(q))).slice(0, n - pick.length);
    pick.push(...rest);
  }
  return shuffle(pick);
}

export function reviewDeck(state: ProgressState, n = 15): Question[] {
  const ids = dueReviewIds(state.qstats).slice(0, n);
  const due = ids.map((id) => BY_ID.get(id)!).filter(Boolean);
  if (due.length >= n) return due;
  // Дутвал сүүлд буруу хариулсан асуултаас нэмнэ
  const wrong = Object.entries(state.qstats)
    .filter(([id, st]) => st.last === 'wrong' && !ids.includes(id))
    .map(([id]) => BY_ID.get(id)!)
    .filter(Boolean);
  return [...due, ...shuffle(wrong)].slice(0, n);
}

/** Өдрийн сорил — огноогоор тогтмол (deterministic) */
export function dailyDeck(n = 10): Question[] {
  const seed = hashStr(new Date().toISOString().slice(0, 10));
  const rng = mulberry32(seed);
  const arr = [...QUESTIONS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

/** Diagnostic — 12 домэйнээс жигд түүвэрлэнэ (≈ n асуулт) */
export function diagnosticDeck(n = 50): Question[] {
  const domains = Object.keys(DOMAIN_META) as Domain[];
  const per = Math.ceil(n / domains.length);
  const out: Question[] = [];
  for (const d of domains) out.push(...shuffle(byDomain(d)).slice(0, per));
  return shuffle(out).slice(0, Math.min(n, out.length));
}

export function mockDeck(n = 100): Question[] {
  // Домэйнээр тэнцвэртэй, дараа нь холино
  const domains = Object.keys(DOMAIN_META) as Domain[];
  const per = Math.ceil(n / domains.length);
  const out: Question[] = [];
  for (const d of domains) out.push(...shuffle(byDomain(d)).slice(0, per));
  return shuffle(out).slice(0, Math.min(n, out.length));
}

// ── жижиг туслах ──
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
