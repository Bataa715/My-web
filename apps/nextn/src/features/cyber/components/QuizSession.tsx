'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Domain, Question } from '@/features/cyber/quiz/questions';
import { useProgress } from '@/features/cyber/store/progress';
import { domainLabel } from '@/features/cyber/curriculum/domains';
import { Confetti } from './Confetti';

export interface SessionConfig {
  deck: Question[];
  mode: 'practice' | 'exam';
  label: string;
  recordMode: string; // quick | topic | weak | daily | timed | mock | diagnostic | roadmap | custom
}

const EXAM_SECONDS_PER_Q = 72;
const PASS_PERCENT = 70;

interface Attempt {
  question: Question;
  picked: number | null;
}

export function QuizSession({
  config,
  onExit,
  onRetry,
  onFinish,
  onLearn,
}: {
  config: SessionConfig;
  onExit: () => void;
  onRetry?: () => void;
  onFinish?: (pct: number) => void;
  onLearn?: (d: Domain) => void;
}) {
  const { deck, mode, label, recordMode } = config;
  const lang = useProgress((s) => s.lang);
  const recordQuiz = useProgress((s) => s.recordQuiz);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => deck.map(() => null));
  const [revealed, setRevealed] = useState<boolean[]>(() => deck.map(() => false));
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(mode === 'exam' ? deck.length * EXAM_SECONDS_PER_Q : 0);
  const startRef = useRef(Date.now());
  const recordedRef = useRef(false);

  // ── Timer (exam) ──
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (mode !== 'exam' || done) return;
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timerRef.current!);
          finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, done]);

  const q = deck[idx];
  const showEn = true;
  const showMn = lang !== 'en';

  // Auto-advance timer (practice: зөв хариулбал автоматаар цааш)
  const autoRef = useRef<number | null>(null);
  function clearAuto() {
    if (autoRef.current) {
      window.clearTimeout(autoRef.current);
      autoRef.current = null;
    }
  }
  useEffect(() => () => clearAuto(), []);

  function advance() {
    clearAuto();
    if (idx + 1 >= deck.length) finish();
    else go(idx + 1);
  }

  function pick(optionIdx: number) {
    if (mode === 'practice' && revealed[idx]) return;
    const next = [...answers];
    next[idx] = optionIdx;
    setAnswers(next);
    if (mode === 'practice') {
      const r = [...revealed];
      r[idx] = true;
      setRevealed(r);
      // зөв хариулбал 1.1 сек дараа автоматаар үргэлжилнэ (Next дарах шаардлагагүй)
      if (optionIdx === deck[idx].answer) {
        clearAuto();
        autoRef.current = window.setTimeout(() => advance(), 1100);
      }
    }
  }

  function go(to: number) {
    clearAuto();
    setIdx(Math.max(0, Math.min(deck.length - 1, to)));
  }

  // Гарын товчлуур: 1–4 / A–D сонгох, Enter/Space үргэлжлүүлэх, ←→ (шалгалт)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      const k = e.key.toLowerCase();
      const numMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
      if (k in numMap) {
        const oi = numMap[k];
        if (oi < deck[idx].options.length && (mode === 'exam' || !revealed[idx])) {
          e.preventDefault();
          pick(oi);
        }
        return;
      }
      if (k === 'enter' || k === ' ') {
        e.preventDefault();
        if (mode === 'practice') {
          if (revealed[idx]) advance();
        } else if (idx + 1 >= deck.length) finish();
        else go(idx + 1);
      } else if (mode === 'exam' && e.key === 'ArrowRight') go(idx + 1);
      else if (mode === 'exam' && e.key === 'ArrowLeft') go(idx - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function toggleMark() {
    const m = new Set(marked);
    if (m.has(idx)) m.delete(idx);
    else m.add(idx);
    setMarked(m);
  }

  function finish() {
    if (recordedRef.current) return;
    recordedRef.current = true;
    if (timerRef.current) window.clearInterval(timerRef.current);
    const attempts: Attempt[] = deck.map((question, i) => ({ question, picked: answers[i] }));
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    recordQuiz({ mode: recordMode, label, seconds, attempts });
    const correct = attempts.filter((a) => a.picked === a.question.answer).length;
    const pct = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
    onFinish?.(pct);
    setDone(true);
  }

  if (done) {
    const attempts: Attempt[] = deck.map((question, i) => ({ question, picked: answers[i] }));
    return <Result attempts={attempts} label={label} lang={lang} onExit={onExit} onRetry={onRetry} onLearn={onLearn} />;
  }

  const answeredCount = answers.filter((a) => a !== null).length;
  const progress = Math.round((answeredCount / deck.length) * 100);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const lowTime = secondsLeft <= 30 && mode === 'exam';
  const isLast = idx === deck.length - 1;
  const isRevealed = mode === 'practice' && revealed[idx];

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 p-5 sm:p-6 animate-fade-in">
      {/* header */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-txt-dim">
        <span className="font-semibold text-txt">{label}</span>
        <span>· {idx + 1} / {deck.length}</span>
        <span className="rounded-full border border-line bg-ink-700 px-2 py-0.5 text-cspv">
          {domainLabel(q.domain, lang === 'both' ? 'mn' : lang)}
        </span>
        <div className="flex-1" />
        {mode === 'exam' && (
          <span className={`rounded-full border px-2.5 py-0.5 font-bold ${lowTime ? 'animate-pulse-fast border-state-err text-state-err' : 'border-line text-cspc'}`}>
            ⏱ {mm}:{ss}
          </span>
        )}
        <button onClick={onExit} className="hover:text-state-err">✕ Гарах</button>
      </div>

      {/* progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
        <div className="h-full bg-cspc transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* question */}
      <div className="mt-1">
        {showEn && <p className="text-lg font-semibold leading-snug text-txt">{q.q}</p>}
        {showMn && <p className="mt-1 text-sm leading-snug text-cspv">{q.qMn}</p>}
      </div>

      {/* options */}
      <div className="flex flex-col gap-2.5">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answer;
          const isPicked = i === answers[idx];
          let cls = 'border-line bg-ink-700 hover:border-cspc';
          if (isRevealed) {
            if (isCorrect) cls = 'border-state-ok bg-state-ok/10 text-state-ok';
            else if (isPicked) cls = 'border-state-err bg-state-err/10 text-state-err';
            else cls = 'border-line bg-ink-700 opacity-60';
          } else if (isPicked) {
            cls = 'border-cspc bg-cspc/10 text-cspc';
          }
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={isRevealed}
              className={`flex items-start gap-3 rounded-none border px-4 py-3 text-left text-sm transition ${cls}`}
            >
              <span className="mt-0.5 font-bold opacity-70">{String.fromCharCode(65 + i)}</span>
              <span className="flex-1">
                {opt}
                {showMn && <span className="mt-0.5 block text-[12px] opacity-70">{q.optionsMn[i]}</span>}
              </span>
              {isRevealed && isCorrect && <span>✓</span>}
              {isRevealed && isPicked && !isCorrect && <span>✗</span>}
            </button>
          );
        })}
      </div>

      {/* explanation (practice) */}
      {isRevealed && (
        <div className="rounded-none border border-line-bright bg-ink-800 p-4 text-sm text-txt-dim animate-fade-in">
          <p><span className="font-semibold text-cspc">Тайлбар:</span> {q.explain}</p>
          {q.whyWrong && (
            <div className="mt-3 border-t border-line pt-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-txt-dim">Бусад хариултууд яагаад буруу вэ</p>
              <ul className="flex flex-col gap-1.5">
                {q.options.map((_, i) =>
                  i === q.answer || !q.whyWrong![i] ? null : (
                    <li key={i} className="flex gap-2 text-[12.5px]">
                      <span className="font-bold text-state-err">{String.fromCharCode(65 + i)}.</span>
                      <span>{q.whyWrong![i]}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* exam navigator */}
      {mode === 'exam' && (
        <div className="flex flex-wrap gap-1.5">
          {deck.map((_, i) => {
            const a = answers[i] !== null;
            const m = marked.has(i);
            const cur = i === idx;
            return (
              <button
                key={i}
                onClick={() => go(i)}
                className={`h-7 w-7 rounded text-[11px] font-bold transition ${
                  cur ? 'ring-2 ring-cspc' : ''
                } ${m ? 'bg-state-warn/30 text-state-warn' : a ? 'bg-cspc/20 text-cspc' : 'bg-ink-700 text-txt-dim'}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* footer */}
      {mode === 'exam' ? (
        <div className="mt-auto flex items-center gap-2 pt-2">
          <button onClick={() => go(idx - 1)} disabled={idx === 0} className="rounded-none border border-line bg-ink-700 px-4 py-2.5 text-sm hover:border-cspc disabled:opacity-30">
            ← Өмнөх
          </button>
          <button onClick={toggleMark} className={`rounded-none border px-4 py-2.5 text-sm ${marked.has(idx) ? 'border-state-warn text-state-warn' : 'border-line text-txt-dim hover:border-cspc'}`}>
            {marked.has(idx) ? '★ Тэмдэглэсэн' : '☆ Тэмдэглэх'}
          </button>
          <div className="flex-1" />
          {isLast ? (
            <button onClick={finish} className="rounded-none bg-state-ok px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              Шалгалт дуусгах ✓
            </button>
          ) : (
            <button onClick={() => go(idx + 1)} className="rounded-none bg-cspc px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              Дараах →
            </button>
          )}
        </div>
      ) : (
        <div className="mt-auto pt-2">
          {isRevealed ? (
            <div className={`flex items-center gap-3 rounded-none border p-3 animate-fade-in ${answers[idx] === q.answer ? 'border-state-ok bg-state-ok/10' : 'border-state-err bg-state-err/10'}`}>
              <span className={`text-lg ${answers[idx] === q.answer ? 'text-state-ok' : 'text-state-err'}`}>{answers[idx] === q.answer ? '✓' : '✗'}</span>
              <span className={`text-sm font-bold ${answers[idx] === q.answer ? 'text-state-ok' : 'text-state-err'}`}>
                {answers[idx] === q.answer ? 'Зөв!' : 'Буруу'}
              </span>
              <div className="flex-1" />
              <button onClick={advance} className="rounded-none bg-cspc px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                {isLast ? 'Дуусгах ✓' : 'Үргэлжлүүлэх'} <span className="opacity-60">↵</span>
              </button>
            </div>
          ) : (
            <div className="text-center text-[11px] text-txt-dim">
              Хариултаа сонго — товчлуур <b className="text-txt">1–4</b> / <b className="text-txt">A–D</b>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Result ──────────────────────────────────────────────────────
function Result({
  attempts,
  label,
  lang,
  onExit,
  onRetry,
  onLearn,
}: {
  attempts: Attempt[];
  label: string;
  lang: 'both' | 'en' | 'mn';
  onExit: () => void;
  onRetry?: () => void;
  onLearn?: (d: Domain) => void;
}) {
  const correct = attempts.filter((a) => a.picked === a.question.answer).length;
  const total = attempts.length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const passed = pct >= PASS_PERCENT;
  const skipped = attempts.filter((a) => a.picked === null).length;

  const byDomain = useMemo(() => {
    const map = new Map<Domain, { correct: number; total: number }>();
    for (const a of attempts) {
      const cur = map.get(a.question.domain) ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (a.picked === a.question.answer) cur.correct += 1;
      map.set(a.question.domain, cur);
    }
    return [...map.entries()].sort((x, y) => x[1].correct / x[1].total - y[1].correct / y[1].total);
  }, [attempts]);

  const wrong = attempts.filter((a) => a.picked !== a.question.answer);
  const showMn = lang !== 'en';

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-5 overflow-y-auto p-6 sm:p-8 animate-fade-in">
      <Confetti show={pct >= 80} />
      <div className="text-center text-xs uppercase tracking-widest text-txt-dim">{label}</div>
      <div className="flex flex-col items-center gap-2 rounded-none border border-line bg-ink-800 p-6">
        <div className={`text-5xl font-bold ${passed ? 'text-state-ok' : 'text-state-err'}`}>{pct}%</div>
        <div className="text-sm text-txt-dim">{correct} / {total} зөв · {skipped} алгассан</div>
        <div className={`rounded-full px-4 py-1 text-sm font-semibold ${passed ? 'bg-state-ok/15 text-state-ok' : 'bg-state-err/15 text-state-err'}`}>
          {passed ? '✓ Сайн байна (≥70%)' : '✗ Дасгал хэрэгтэй (<70%)'}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-dim">Домэйн задаргаа (сул талаас)</h3>
        <div className="flex flex-col gap-2">
          {byDomain.map(([d, s]) => {
            const p = Math.round((s.correct / s.total) * 100);
            const color = p >= 70 ? 'bg-state-ok' : p >= 40 ? 'bg-state-warn' : 'bg-state-err';
            return (
              <div key={d} className="flex items-center gap-3 text-xs">
                <span className="w-40 shrink-0 truncate text-txt-dim">{domainLabel(d, lang === 'both' ? 'mn' : lang)}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-700">
                  <div className={`h-full ${color}`} style={{ width: `${p}%` }} />
                </div>
                <span className="w-14 shrink-0 text-right">{s.correct}/{s.total}</span>
              </div>
            );
          })}
        </div>
        {onLearn && byDomain.length > 0 && byDomain[0][1].correct / byDomain[0][1].total < 0.7 && (
          <button
            onClick={() => onLearn(byDomain[0][0])}
            className="mt-1 self-start rounded-none border border-cspc/40 bg-cspc/10 px-3 py-1.5 text-[11px] text-cspc hover:bg-cspc/20"
          >
            📖 Сул домэйны хичээл унших: {domainLabel(byDomain[0][0], lang === 'both' ? 'mn' : lang)}
          </button>
        )}
      </div>

      {wrong.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-txt-dim">Алдаа дээр ажиллах ({wrong.length})</h3>
          <div className="flex flex-col gap-3">
            {wrong.map((a) => (
              <div key={a.question.id} className="rounded-none border border-line bg-ink-800 p-4 text-sm">
                <p className="font-semibold text-txt">{a.question.q}</p>
                {showMn && <p className="text-[12px] text-cspv">{a.question.qMn}</p>}
                <p className="mt-2 text-state-err">
                  Таны хариулт: {a.picked === null ? '— (хариулаагүй)' : `${String.fromCharCode(65 + a.picked)}. ${a.question.options[a.picked]}`}
                </p>
                <p className="text-state-ok">
                  Зөв: {String.fromCharCode(65 + a.question.answer)}. {a.question.options[a.question.answer]}
                  {showMn && ` — ${a.question.optionsMn[a.question.answer]}`}
                </p>
                {a.picked !== null && a.question.whyWrong?.[a.picked] && (
                  <p className="mt-1 text-state-err/90">
                    <span className="font-semibold">Таны сонголт буруу:</span> {a.question.whyWrong[a.picked]}
                  </p>
                )}
                <p className="mt-2 text-txt-dim">
                  <span className="font-semibold text-cspc">Тайлбар:</span> {a.question.explain}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto flex gap-3 pt-2">
        <button onClick={onExit} className="rounded-none border border-line bg-ink-700 px-4 py-2.5 text-sm hover:border-cspc hover:text-cspc">
          ← Буцах
        </button>
        {onRetry && (
          <button onClick={onRetry} className="flex-1 rounded-none bg-cspc px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
            ↺ Дахин
          </button>
        )}
      </div>
    </div>
  );
}
