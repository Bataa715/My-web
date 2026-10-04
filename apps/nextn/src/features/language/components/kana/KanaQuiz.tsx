'use client';

import { useMemo, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KanaCharacter } from '@/features/language/data/kana';

type PoolId = 'basic' | 'voiced' | 'combo' | 'all' | 'weak';

const POOLS: { id: PoolId; label: string; hint: string }[] = [
  { id: 'basic', label: 'Үндсэн 46', hint: 'あ〜ん' },
  { id: 'voiced', label: 'Дакутэн / Хандакутэн', hint: 'が ぱ …' },
  { id: 'combo', label: 'Нийлмэл дуу', hint: 'きゃ しゅ …' },
  { id: 'all', label: 'Бүгд', hint: 'бүх үсэг' },
  { id: 'weak', label: 'Цээжлээгүй', hint: 'тэмдэглээгүй үсгүүд' },
];

const QUESTION_COUNT = 10;

const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

interface Q {
  kana: KanaCharacter;
  options: string[];
}

function makeQuestions(pool: KanaCharacter[], all: KanaCharacter[]): Q[] {
  return shuffle(pool)
    .slice(0, QUESTION_COUNT)
    .map(kana => {
      const wrong = shuffle(all.filter(k => k.romaji !== kana.romaji))
        .map(k => k.romaji)
        .filter((r, i, arr) => arr.indexOf(r) === i)
        .slice(0, 3);
      return { kana, options: shuffle([kana.romaji, ...wrong]) };
    });
}

interface Props {
  data: KanaCharacter[];
  memorized: Set<string>;
  onFinish?: (correctChars: string[]) => void;
}

export default function KanaQuiz({ data, memorized, onFinish }: Props) {
  const [pool, setPool] = useState<PoolId | null>(null);
  const [qs, setQs] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [misses, setMisses] = useState<KanaCharacter[]>([]);
  const [hits, setHits] = useState<string[]>([]);

  const pools = useMemo(
    () => ({
      basic: data.filter(k => k.type === 'vowel' || k.type === 'consonant'),
      voiced: data.filter(k => k.type === 'dakuten' || k.type === 'handakuten'),
      combo: data.filter(k => k.type === 'combo'),
      all: data,
      weak: data.filter(k => !memorized.has(k.character)),
    }),
    [data, memorized]
  );

  const start = (id: PoolId) => {
    setPool(id);
    setQs(makeQuestions(pools[id], data));
    setIdx(0);
    setPicked(null);
    setMisses([]);
    setHits([]);
  };

  /* ── Setup ── */
  if (!pool) {
    return (
      <div>
        <p className="mb-4 text-sm text-[#111]/60">
          Үсэг гарна — зөв уншлагыг {QUESTION_COUNT} асуултаас сонгоно. Ямар үсгээр шалгуулахаа сонго:
        </p>
        <div className="grid gap-px border border-[#111] bg-[#111] sm:grid-cols-2">
          {POOLS.map(p => {
            const n = pools[p.id].length;
            return (
              <button
                key={p.id}
                type="button"
                disabled={n < 4}
                onClick={() => start(p.id)}
                className="flex items-center justify-between gap-3 bg-white p-4 text-left transition-colors enabled:hover:bg-[#111] enabled:hover:text-white disabled:opacity-40"
              >
                <span>
                  <span className="block text-base">{p.label}</span>
                  <span className="block text-xs opacity-55">{p.hint}</span>
                </span>
                <span className="text-sm tabular-nums opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const done = idx >= qs.length;

  /* ── Result ── */
  if (done) {
    const score = hits.length;
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111] p-6 text-white">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Үр дүн</p>
            <p className="text-3xl tabular-nums">
              {score} / {qs.length}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => start(pool)}
              className="flex items-center gap-2 border border-white/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] hover:bg-white hover:text-[#111]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Дахин
            </button>
            <button
              type="button"
              onClick={() => setPool(null)}
              className="bg-[#c41212] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] hover:opacity-90"
            >
              Өөр сэдэв
            </button>
          </div>
        </div>
        {misses.length > 0 ? (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c41212]">
              Давтах үсгүүд
            </p>
            <ul className="flex flex-wrap gap-2">
              {misses.map(k => (
                <li key={k.character} className="border border-[#b91c1c] bg-white px-4 py-2 text-center">
                  <span className="block text-2xl">{k.character}</span>
                  <span className="text-xs text-[#111]/55">{k.romaji}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-[#15803d]">Бүгдийг зөв хариуллаа!</p>
        )}
        {hits.length > 0 && onFinish && (
          <button
            type="button"
            onClick={() => onFinish(hits)}
            className="border border-[#111] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] hover:bg-[#111] hover:text-white"
          >
            Зөв хариулсан {hits.length} үсгийг цээжилсэн гэж тэмдэглэх
          </button>
        )}
      </div>
    );
  }

  /* ── Question ── */
  const q = qs[idx];
  const answered = picked !== null;
  const choose = (opt: string) => {
    if (answered) return;
    setPicked(opt);
    if (opt === q.kana.romaji) setHits(h => [...h, q.kana.character]);
    else setMisses(m => [...m, q.kana]);
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex items-center justify-between text-xs text-[#111]/55">
        <span className="tabular-nums">
          {idx + 1} / {qs.length}
        </span>
        <button type="button" onClick={() => setPool(null)} className="hover:text-[#c41212]">
          ✕ Гарах
        </button>
      </div>
      <div className="mb-1 h-1 bg-[#111]/10" aria-hidden>
        <div className="h-full bg-[#c41212] transition-all" style={{ width: `${(idx / qs.length) * 100}%` }} />
      </div>

      <div className="my-8 flex flex-col items-center border border-[#111] bg-white py-10">
        <span className="text-8xl leading-none">{q.kana.character}</span>
        <span className="mt-4 text-xs text-[#111]/45">Яаж уншигдах вэ?</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {q.options.map(opt => {
          const right = opt === q.kana.romaji;
          const isPicked = picked === opt;
          return (
            <button
              key={opt}
              type="button"
              disabled={answered}
              onClick={() => choose(opt)}
              className={cn(
                'flex items-center justify-center gap-2 border py-3 text-lg transition-colors',
                !answered && 'border-[#111]/30 bg-white hover:border-[#111]',
                answered && right && 'border-[#15803d] bg-[#15803d]/10',
                answered && isPicked && !right && 'border-[#b91c1c] bg-[#b91c1c]/10',
                answered && !right && !isPicked && 'border-[#111]/15 text-[#111]/35'
              )}
            >
              {opt}
              {answered && right && <Check className="h-4 w-4 text-[#15803d]" aria-hidden />}
              {answered && isPicked && !right && <X className="h-4 w-4 text-[#b91c1c]" aria-hidden />}
            </button>
          );
        })}
      </div>

      {answered && (
        <button
          type="button"
          onClick={() => {
            setIdx(i => i + 1);
            setPicked(null);
          }}
          className="mt-4 w-full bg-[#111] py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#c41212]"
          autoFocus
        >
          {idx + 1 === qs.length ? 'Үр дүн харах' : 'Дараагийнх →'}
        </button>
      )}
    </div>
  );
}
