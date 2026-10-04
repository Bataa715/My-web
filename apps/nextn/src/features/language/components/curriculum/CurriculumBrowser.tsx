'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CURRICULA,
  groupByCategory,
  type CurriculumLang,
  type LessonLevel,
} from '@/features/language/curriculum';
import { useCurriculumProgress } from './useCurriculumProgress';

interface Props {
  lang: CurriculumLang;
  /** base path of the grammar tool, e.g. /tools/english/grammar */
  basePath: string;
}

export default function CurriculumBrowser({ lang, basePath }: Props) {
  const curriculum = CURRICULA[lang];
  const { done, ready } = useCurriculumProgress(lang);
  const [level, setLevel] = useState<LessonLevel>('beginner');
  const [query, setQuery] = useState('');

  const total = curriculum.lessons.length;
  const doneCount = curriculum.lessons.filter(l => l.id in done).length;
  const nextLesson = curriculum.lessons.find(l => !(l.id in done)) ?? curriculum.lessons[0];

  const levelStats = useMemo(
    () =>
      curriculum.levels.map(lv => {
        const lessons = curriculum.lessons.filter(l => l.level === lv.id);
        return { ...lv, total: lessons.length, done: lessons.filter(l => l.id in done).length };
      }),
    [curriculum, done]
  );

  const q = query.trim().toLowerCase();
  const visible = curriculum.lessons.filter(l => {
    if (q) {
      return (
        l.title.toLowerCase().includes(q) ||
        l.titleMn.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
      );
    }
    return l.level === level;
  });
  const groups = groupByCategory(visible);
  const indexOf = (id: string) => curriculum.lessons.findIndex(l => l.id === id) + 1;

  return (
    <div className="space-y-10">
      {/* Summary + continue */}
      <section className="grid gap-px border border-[#111] bg-[#111] sm:grid-cols-[1fr_auto]">
        <div className="bg-white p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
            Таны ахиц
          </p>
          <p className="mt-2 text-3xl tabular-nums">
            {ready ? doneCount : '–'}
            <span className="text-base text-[#111]/45"> / {total} хичээл</span>
          </p>
          <div className="mt-3 h-1.5 w-full bg-[#111]/10" aria-hidden>
            <div
              className="h-full bg-[#c41212] transition-all"
              style={{ width: `${ready ? (doneCount / total) * 100 : 0}%` }}
            />
          </div>
        </div>
        <Link
          href={`${basePath}/lesson/${nextLesson.id}`}
          className="group flex flex-col justify-center gap-1 bg-[#111] p-5 text-white transition-colors hover:bg-[#c41212] sm:min-w-[260px] sm:p-6"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
            {doneCount === 0 ? 'Эндээс эхэл' : doneCount >= total ? 'Дахин давт' : 'Үргэлжлүүл'}
          </span>
          <span className="flex items-center justify-between gap-3 text-base">
            <span className="min-w-0 truncate">{nextLesson.title}</span>
            <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      {/* Level tabs */}
      <div
        role="tablist"
        aria-label="Түвшин"
        className="grid gap-px border border-[#111] bg-[#111] sm:grid-cols-2"
      >
        {levelStats.map(lv => {
          const active = lv.id === level && !q;
          return (
            <button
              key={lv.id}
              role="tab"
              aria-selected={active}
              onClick={() => {
                setLevel(lv.id);
                setQuery('');
              }}
              className={cn(
                'flex flex-col gap-1 p-4 text-left transition-colors sm:p-5',
                active ? 'bg-[#111] text-white' : 'bg-white hover:bg-[#f3f1ee]'
              )}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-lg">{lv.label}</span>
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-[0.2em]',
                    active ? 'text-white/60' : 'text-[#c41212]'
                  )}
                >
                  {lv.scale}
                </span>
              </span>
              <span className={cn('text-xs', active ? 'text-white/65' : 'text-[#111]/55')}>
                {lv.blurb}
              </span>
              <span
                className={cn(
                  'mt-1 text-[11px] tabular-nums',
                  active ? 'text-white/70' : 'text-[#111]/45'
                )}
              >
                {ready ? lv.done : 0} / {lv.total} дууссан
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <label className="flex items-center gap-3 border-b border-[#111]/40 pb-2 focus-within:border-[#c41212]">
        <Search className="h-4 w-4 shrink-0 text-[#111]/50" aria-hidden />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Хичээл хайх… (жишээ нь: past, て-хэлбэр)"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[#111]/35"
          aria-label="Хичээл хайх"
        />
      </label>

      {/* Lessons grouped by topic */}
      {groups.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#111]/45">
          Хайлтад тохирох хичээл олдсонгүй.
        </p>
      ) : (
        <div className="space-y-10">
          {groups.map(g => (
            <section key={g.category}>
              <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
                {g.category}
              </h3>
              <ul className="divide-y divide-[#111]/15 border-y border-[#111]">
                {g.lessons.map(l => {
                  const finished = l.id in done;
                  const score = done[l.id];
                  return (
                    <li key={l.id}>
                      <Link
                        href={`${basePath}/lesson/${l.id}`}
                        className="group flex items-center gap-4 py-4 sm:gap-6"
                      >
                        <span className="w-8 shrink-0 text-xs tabular-nums text-[#111]/35">
                          {String(indexOf(l.id)).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-base sm:text-lg">{l.title}</span>
                          <span className="block text-xs text-[#111]/55">
                            {l.titleMn} — {l.summary}
                          </span>
                        </span>
                        {finished ? (
                          <span className="flex shrink-0 items-center gap-1 text-xs text-[#15803d]">
                            <Check className="h-4 w-4" aria-hidden />
                            {typeof score === 'number' ? `${score}%` : 'Дууссан'}
                          </span>
                        ) : (
                          <span className="hidden shrink-0 text-[11px] text-[#111]/40 sm:inline">
                            {l.quiz.length} асуулт
                          </span>
                        )}
                        <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
