'use client';

import { useMemo, useState } from 'react';
import { shuffle, type Domain, type Question } from '@/features/cyber/quiz/questions';
import { byDomain } from '@/features/cyber/curriculum/analytics';
import { useProgress } from '@/features/cyber/store/progress';

/**
 * Хичээлийн төгсгөлийн "Ойлгосон уу?" 3 асуултын хурдан шалгалт.
 * Идэвхтэй санах ой (active recall)-г дэмжинэ. Дуусахад onDone(passed) дуудна.
 */
export function MiniCheck({ domain, onDone }: { domain: Domain; onDone: (passed: boolean) => void }) {
  const lang = useProgress((s) => s.lang);
  const recordQuiz = useProgress((s) => s.recordQuiz);
  const showMn = lang !== 'en';

  const deck = useMemo<Question[]>(() => shuffle(byDomain(domain)).slice(0, 3), [domain]);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(() => deck.map(() => null));
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = deck[idx];
  const isLast = idx === deck.length - 1;

  function pick(i: number) {
    if (revealed) return;
    const next = [...picks];
    next[idx] = i;
    setPicks(next);
    setRevealed(true);
  }

  function nextQ() {
    if (isLast) {
      const attempts = deck.map((question, i) => ({ question, picked: picks[i] }));
      recordQuiz({ mode: 'lesson', label: `Хичээлийн шалгалт · ${domain}`, seconds: 0, attempts });
      const correct = attempts.filter((a) => a.picked === a.question.answer).length;
      setFinished(true);
      onDone(correct === deck.length);
      return;
    }
    setIdx(idx + 1);
    setRevealed(false);
  }

  if (finished) {
    const correct = deck.filter((question, i) => picks[i] === question.answer).length;
    const all = correct === deck.length;
    return (
      <div className={`rounded-none border p-5 text-center ${all ? 'border-state-ok/40 bg-state-ok/10' : 'border-line bg-ink-800'}`}>
        <div className="text-3xl">{all ? '🎉' : '👍'}</div>
        <p className={`mt-2 text-sm font-bold ${all ? 'text-state-ok' : 'text-txt'}`}>
          {correct} / {deck.length} зөв
        </p>
        <p className="mt-1 text-[12px] text-txt-dim">
          {all ? 'Гоё! Энэ сэдвийг сайн ойлгожээ.' : 'Сайн байна — тайлбарыг дахин уншиж бататга.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-none border border-line bg-ink-800 p-5">
      <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-widest text-txt-dim">
        <span>✅ Ойлгосон уу?</span>
        <span>{idx + 1} / {deck.length}</span>
      </div>
      <p className="text-[15px] font-semibold leading-snug text-txt">{q.q}</p>
      {showMn && <p className="mt-1 text-[12px] text-cspv">{q.qMn}</p>}

      <div className="mt-3 flex flex-col gap-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answer;
          const isPicked = i === picks[idx];
          let cls = 'border-line bg-ink-700 hover:border-cspc';
          if (revealed) {
            if (isCorrect) cls = 'border-state-ok bg-state-ok/10 text-state-ok';
            else if (isPicked) cls = 'border-state-err bg-state-err/10 text-state-err';
            else cls = 'border-line bg-ink-700 opacity-60';
          }
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={revealed}
              className={`flex items-start gap-2.5 rounded-none border px-3 py-2.5 text-left text-[13px] transition ${cls}`}
            >
              <span className="mt-0.5 font-bold opacity-70">{String.fromCharCode(65 + i)}</span>
              <span className="flex-1">
                {opt}
                {showMn && <span className="mt-0.5 block text-[11px] opacity-70">{q.optionsMn[i]}</span>}
              </span>
              {revealed && isCorrect && <span>✓</span>}
              {revealed && isPicked && !isCorrect && <span>✗</span>}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-3 rounded-none border border-line-bright bg-ink-900/50 p-3 text-[12.5px] text-txt-dim animate-fade-in">
          <span className="font-semibold text-cspc">Тайлбар:</span> {q.explain}
        </div>
      )}

      {revealed && (
        <div className="mt-3 flex justify-end">
          <button onClick={nextQ} className="rounded-none bg-cspc px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">
            {isLast ? 'Дуусгах ✓' : 'Дараах →'}
          </button>
        </div>
      )}
    </div>
  );
}
