'use client';

import { useState } from 'react';
import { Check, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WordPack } from '@/features/language/data/packs';

export type GameMode = 'flashcard' | 'test' | 'matching';

/* ───────────── Progress overview ───────────── */

export function VocabOverview({
  total,
  memorized,
  favorites,
}: {
  total: number;
  memorized: number;
  favorites: number;
}) {
  const pct = total ? Math.round((memorized / total) * 100) : 0;
  return (
    <section aria-label="Таны ахиц" className="border border-[#111] bg-white">
      <div className="grid grid-cols-3 divide-x divide-[#111]/15">
        {[
          { v: total, l: 'Нийт үг' },
          { v: memorized, l: 'Цээжилсэн' },
          { v: favorites, l: 'Онцолсон' },
        ].map(s => (
          <div key={s.l} className="px-3 py-4 text-center">
            <div className="text-2xl tabular-nums">{s.v}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#111]/45">
              {s.l}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 border-t border-[#111]/15 px-4 py-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c41212]">
          Цээжлэлтийн явц
        </span>
        <div className="h-1.5 flex-1 bg-[#111]/10" aria-hidden>
          <div className="h-full bg-[#c41212] transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm tabular-nums text-[#111]/60">{pct}%</span>
      </div>
    </section>
  );
}

/* ───────────── Practice modes ───────────── */

const MODES: { id: GameMode; title: string; what: string; min: number }[] = [
  { id: 'flashcard', title: 'Flashcard', what: 'Картыг эргүүлж, мэддэг эсэхээ тэмдэглэнэ.', min: 1 },
  { id: 'test', title: 'Тест', what: '4 хариултаас зөвийг нь сонгоно.', min: 4 },
  { id: 'matching', title: 'Холбох тоглоом', what: 'Үг ба утгыг хооронд нь холбоно.', min: 5 },
];

export function PracticeModes({
  available,
  scopeLabel,
  onStart,
}: {
  /** Number of words the practice would use (current filter) */
  available: number;
  scopeLabel: string;
  onStart: (mode: GameMode) => void;
}) {
  return (
    <section aria-labelledby="practice-h">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="practice-h" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
          Дасгал хийх
        </h2>
        <p className="text-xs text-[#111]/50">
          {scopeLabel} — <span className="tabular-nums">{available}</span> үгээр
        </p>
      </div>
      <div className="grid gap-px border border-[#111] bg-[#111] sm:grid-cols-3">
        {MODES.map(m => {
          const enough = available >= m.min;
          return (
            <button
              key={m.id}
              type="button"
              disabled={!enough}
              onClick={() => onStart(m.id)}
              className="group flex flex-col gap-1 bg-white p-4 text-left transition-colors enabled:hover:bg-[#111] enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-lg">{m.title}</span>
              <span className="text-xs opacity-60">{m.what}</span>
              {!enough && (
                <span className="mt-1 text-[11px] text-[#b91c1c]">
                  Дор хаяж {m.min} үг хэрэгтэй
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────── Ready-made packs ───────────── */

export function PackList<W>({
  packs,
  hasWord,
  onAdd,
  defaultOpen,
}: {
  packs: WordPack<W>[];
  /** True when the user's list already contains this word */
  hasWord: (w: WordPack<W>['words'][number]) => boolean;
  onAdd: (pack: WordPack<W>, fresh: WordPack<W>['words']) => Promise<void>;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [busyId, setBusyId] = useState<string | null>(null);

  return (
    <section aria-labelledby="packs-h" className="border border-[#111] bg-white">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
      >
        <span>
          <span id="packs-h" className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
            Бэлэн сангууд
          </span>
          <span className="block text-xs text-[#111]/55">
            Сэдвээр, түвшнээр бэлтгэсэн үгсийг нэг товчоор өөрийн санд нэм.
          </span>
        </span>
        <span className="text-sm text-[#111]/50">{open ? 'Хаах' : 'Нээх'}</span>
      </button>

      {open && (
        <ul className="divide-y divide-[#111]/15 border-t border-[#111]/15">
          {packs.map(pack => {
            const fresh = pack.words.filter(w => !hasWord(w));
            const complete = fresh.length === 0;
            const busy = busyId === pack.id;
            return (
              <li key={pack.id} className="flex items-center gap-4 px-4 py-3">
                <span className="w-10 shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c41212]">
                  {pack.level}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">{pack.title}</span>
                  <span className="block text-[11px] tabular-nums text-[#111]/45">
                    {pack.words.length} үг
                    {!complete && fresh.length < pack.words.length && ` · ${fresh.length} шинэ`}
                  </span>
                </span>
                {complete ? (
                  <span className="flex items-center gap-1 text-xs text-[#15803d]">
                    <Check className="h-4 w-4" aria-hidden /> Нэмэгдсэн
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={busy || busyId !== null}
                    onClick={async () => {
                      setBusyId(pack.id);
                      try {
                        await onAdd(pack, fresh);
                      } finally {
                        setBusyId(null);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-1.5 border border-[#111] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors',
                      'hover:bg-[#111] hover:text-white disabled:opacity-50'
                    )}
                  >
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Plus className="h-3.5 w-3.5" aria-hidden />}
                    {fresh.length} үг нэмэх
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
