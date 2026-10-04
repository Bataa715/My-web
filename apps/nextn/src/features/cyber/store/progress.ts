// Суралцах явцын хөдөлгүүр — localStorage-д хадгална (backend шаардахгүй).
// Per-question статистик, Leitner spaced-repetition, streak, XP, roadmap явц,
// diagnostic үр дүн, achievement-уудыг хянана.

import { create } from '@/features/cyber/lib/store';
import type { Domain, Question } from '@/features/cyber/quiz/questions';

export type Lang = 'both' | 'en' | 'mn';

export interface QStat {
  seen: number;
  correct: number;
  wrong: number;
  last: 'correct' | 'wrong' | null;
  box: number; // Leitner хайрцаг 0..5
  due: number; // дараагийн давталтын timestamp (ms)
  ts: number; // сүүлд харсан timestamp
}

export interface QuizRecord {
  id: string;
  at: number;
  mode: string; // quick | topic | weak | daily | timed | mock | diagnostic | roadmap | custom
  label: string;
  total: number;
  correct: number;
  pct: number;
  seconds: number;
  byDomain: Partial<Record<Domain, { correct: number; total: number }>>;
}

export interface DiagnosticResult {
  done: boolean;
  at?: number;
  pct?: number;
  byDomain?: Partial<Record<Domain, { correct: number; total: number }>>;
}

export interface ProgressState {
  version: number;
  lang: Lang;
  qstats: Record<string, QStat>;
  history: QuizRecord[];
  streak: { current: number; best: number; lastActive: string };
  xp: number;
  diagnostic: DiagnosticResult;
  roadmap: { currentDay: number; doneTasks: Record<string, boolean> };
  daily: { date: string; done: boolean } | null;
  achievements: string[];
  studySeconds: number;
  lessonsDone: Partial<Record<Domain, boolean>>;

  // actions
  setLang: (l: Lang) => void;
  markLessonDone: (domain: Domain) => void;
  recordQuiz: (input: {
    mode: string;
    label: string;
    seconds: number;
    attempts: { question: Question; picked: number | null }[];
  }) => QuizRecord;
  toggleTask: (day: number, taskId: string) => void;
  setRoadmapDay: (day: number) => void;
  markDailyDone: () => void;
  resetAll: () => void;
}

// ── Leitner давталтын интервал (ms) ──
const DAY = 86_400_000;
const BOX_INTERVAL = [0, 1 * DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];

const KEY = 'csp:progress:v1';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / DAY);
}

const EMPTY: Omit<
  ProgressState,
  'setLang' | 'markLessonDone' | 'recordQuiz' | 'toggleTask' | 'setRoadmapDay' | 'markDailyDone' | 'resetAll'
> = {
  version: 1,
  lang: 'both',
  qstats: {},
  history: [],
  streak: { current: 0, best: 0, lastActive: '' },
  xp: 0,
  diagnostic: { done: false },
  roadmap: { currentDay: 1, doneTasks: {} },
  daily: null,
  achievements: [],
  studySeconds: 0,
  lessonsDone: {},
};

function load(): typeof EMPTY {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY };
  }
}

function save(state: ProgressState): void {
  try {
    const { setLang, markLessonDone, recordQuiz, toggleTask, setRoadmapDay, markDailyDone, resetAll, ...data } = state;
    void setLang; void markLessonDone; void recordQuiz; void toggleTask; void setRoadmapDay; void markDailyDone; void resetAll;
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable — үргэлжлүүлнэ */
  }
}

// Achievement дүрэм — id + шалгах функц
export const ACHIEVEMENTS: { id: string; icon: string; title: string; check: (s: ProgressState) => boolean }[] = [
  { id: 'first-quiz', icon: '🎯', title: 'Анхны сорил', check: (s) => s.history.length >= 1 },
  { id: 'diagnostic', icon: '🧭', title: 'Оношилгоо өгсөн', check: (s) => s.diagnostic.done },
  { id: 'streak-3', icon: '🔥', title: '3 хоног дараалан', check: (s) => s.streak.current >= 3 },
  { id: 'streak-7', icon: '🏅', title: '7 хоногийн streak', check: (s) => s.streak.current >= 7 },
  { id: 'hundred-q', icon: '💯', title: '100 асуулт хариулсан', check: (s) => Object.values(s.qstats).reduce((a, q) => a + q.seen, 0) >= 100 },
  { id: 'mock-80', icon: '🏆', title: 'Mock шалгалт 80%+', check: (s) => s.history.some((h) => h.mode === 'mock' && h.pct >= 80) },
  { id: 'coverage-half', icon: '📚', title: 'Асуултын сангийн 50%', check: (s) => Object.keys(s.qstats).length >= 100 },
  { id: 'roadmap-10', icon: '🚀', title: 'Roadmap 10 хоног', check: (s) => Object.keys(s.roadmap.doneTasks).filter((k) => s.roadmap.doneTasks[k]).length >= 30 },
];

export const useProgress = create<ProgressState>((set, get) => ({
  ...load(),

  setLang: (l) => {
    set({ lang: l });
    save(get());
  },

  markLessonDone: (domain) => {
    const s = get();
    if (s.lessonsDone[domain]) return;
    set({ lessonsDone: { ...s.lessonsDone, [domain]: true } });
    save(get());
  },

  recordQuiz: ({ mode, label, seconds, attempts }) => {
    const s = get();
    const now = Date.now();
    const qstats = { ...s.qstats };
    const byDomain: QuizRecord['byDomain'] = {};
    let correct = 0;

    for (const a of attempts) {
      const q = a.question;
      const ok = a.picked !== null && a.picked === q.answer;
      if (ok) correct += 1;

      const d = byDomain[q.domain] ?? { correct: 0, total: 0 };
      d.total += 1;
      if (ok) d.correct += 1;
      byDomain[q.domain] = d;

      const prev: QStat = qstats[q.id] ?? { seen: 0, correct: 0, wrong: 0, last: null, box: 0, due: now, ts: now };
      const box = ok ? Math.min(prev.box + 1, 5) : 0;
      qstats[q.id] = {
        seen: prev.seen + 1,
        correct: prev.correct + (ok ? 1 : 0),
        wrong: prev.wrong + (ok ? 0 : 1),
        last: ok ? 'correct' : 'wrong',
        box,
        due: now + BOX_INTERVAL[box],
        ts: now,
      };
    }

    const total = attempts.length;
    const pct = total ? Math.round((correct / total) * 100) : 0;

    const rec: QuizRecord = {
      id: `${mode}-${now}`,
      at: now,
      mode,
      label,
      total,
      correct,
      pct,
      seconds,
      byDomain,
    };

    // streak шинэчлэх
    const today = todayStr();
    let streak = { ...s.streak };
    if (streak.lastActive !== today) {
      const gap = streak.lastActive ? daysBetween(streak.lastActive, today) : 999;
      streak.current = gap === 1 ? streak.current + 1 : 1;
      streak.best = Math.max(streak.best, streak.current);
      streak.lastActive = today;
    }

    const xp = s.xp + correct * 10 + total * 2;

    const diagnostic =
      mode === 'diagnostic' ? { done: true, at: now, pct, byDomain } : s.diagnostic;

    const history = [rec, ...s.history].slice(0, 60);

    const next: ProgressState = {
      ...s,
      qstats,
      history,
      streak,
      xp,
      diagnostic,
      studySeconds: s.studySeconds + seconds,
    };

    // achievement-ууд
    const unlocked = new Set(next.achievements);
    for (const a of ACHIEVEMENTS) if (a.check(next) && !unlocked.has(a.id)) unlocked.add(a.id);
    next.achievements = [...unlocked];

    set(next);
    save(get());
    return rec;
  },

  toggleTask: (day, taskId) => {
    const s = get();
    const key = `${day}:${taskId}`;
    const doneTasks = { ...s.roadmap.doneTasks, [key]: !s.roadmap.doneTasks[key] };
    set({ roadmap: { ...s.roadmap, doneTasks } });
    save(get());
  },

  setRoadmapDay: (day) => {
    const s = get();
    set({ roadmap: { ...s.roadmap, currentDay: Math.max(1, Math.min(30, day)) } });
    save(get());
  },

  markDailyDone: () => {
    set({ daily: { date: todayStr(), done: true } });
    save(get());
  },

  resetAll: () => {
    set({ ...EMPTY });
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
  },
}));

export { todayStr };
