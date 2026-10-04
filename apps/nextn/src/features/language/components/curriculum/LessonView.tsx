'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Volume2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CURRICULA,
  neighbours,
  type CurriculumLang,
  type GrammarLessonData,
} from '@/features/language/curriculum';
import { useCurriculumProgress } from './useCurriculumProgress';

interface Props {
  lang: CurriculumLang;
  lesson: GrammarLessonData;
  /** e.g. /tools/english/grammar */
  basePath: string;
}

const SPEECH_LANG: Record<CurriculumLang, string> = { english: 'en-US', japanese: 'ja-JP' };

function speak(text: string, lang: CurriculumLang) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  // Strip the "→ …" re-statement and quote marks so only the sentence is read
  const clean = text.split('→')[0].replace(/["“”]/g, '').trim();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = SPEECH_LANG[lang];
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

const SectionTitle = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2
    id={id}
    className="mb-5 scroll-mt-36 border-b border-[#111] pb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c41212]"
  >
    {children}
  </h2>
);

export default function LessonView({ lang, lesson, basePath }: Props) {
  const { done, complete, uncomplete } = useCurriculumProgress(lang);
  const level = CURRICULA[lang].levels.find(l => l.id === lesson.level)!;
  const { prev, next } = neighbours(lang, lesson.id);
  const finished = lesson.id in done;
  const [showReading, setShowReading] = useState(true);
  const hasReading = lesson.examples.some(e => e.r);

  const sections = [
    { id: 'explain', label: 'Тайлбар' },
    ...((lesson.patterns?.length ?? 0) > 0 ? [{ id: 'patterns', label: 'Бүтэц' }] : []),
    ...((lesson.tables?.length ?? 0) > 0 ? [{ id: 'tables', label: 'Хүснэгт' }] : []),
    { id: 'examples', label: 'Жишээ' },
    ...((lesson.mistakes?.length ?? 0) > 0 ? [{ id: 'mistakes', label: 'Алдаа' }] : []),
    { id: 'quiz', label: 'Дасгал' },
  ];

  return (
    <article className="mx-auto max-w-3xl">
      {/* Header */}
      <header className="mb-8">
        <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.22em]">
          <span className="text-[#c41212]">
            {level.label} · {level.scale}
          </span>
          <span className="text-[#111]/40">{lesson.category}</span>
          {finished && (
            <span className="flex items-center gap-1 text-[#15803d]">
              <Check className="h-3.5 w-3.5" aria-hidden /> Дууссан
            </span>
          )}
        </p>
        <h1 className="text-3xl leading-tight sm:text-4xl">{lesson.title}</h1>
        <p className="mt-1 text-base text-[#111]/60">{lesson.titleMn}</p>
        <p className="mt-4 border-l-2 border-[#c41212] pl-4 text-sm">
          <span className="text-[#111]/50">Энэ хичээлээр: </span>
          {lesson.summary}
        </p>
      </header>

      {/* Section jump nav */}
      <nav
        aria-label="Хичээлийн хэсгүүд"
        className="sticky top-16 z-20 md:top-20 -mx-4 mb-10 flex gap-1 overflow-x-auto border-b border-[#111] bg-[#f3f1ee]/95 px-4 py-2 sm:mx-0 sm:px-0"
      >
        {sections.map(s => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="shrink-0 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111]/60 transition-colors hover:text-[#c41212]"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="space-y-14">
        {/* Explanation */}
        <section>
          <SectionTitle id="explain">Тайлбар</SectionTitle>
          <div className="space-y-4 text-[15px] leading-relaxed">
            {lesson.explain.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* Patterns */}
        {lesson.patterns && lesson.patterns.length > 0 && (
          <section>
            <SectionTitle id="patterns">Бүтэц</SectionTitle>
            <ul className="grid gap-px border border-[#111] bg-[#111]">
              {lesson.patterns.map((p, i) => (
                <li key={i} className="grid gap-1 bg-white p-4 sm:grid-cols-[110px_1fr] sm:gap-5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c41212]">
                    {p.label}
                  </span>
                  <span>
                    <span className="block font-semibold">{p.formula}</span>
                    <span className="mt-1 block text-sm text-[#111]/65">{p.example}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tables */}
        {lesson.tables && lesson.tables.length > 0 && (
          <section>
            <SectionTitle id="tables">Хүснэгт</SectionTitle>
            <div className="space-y-8">
              {lesson.tables.map((t, i) => (
                <div key={i}>
                  {t.title && <p className="mb-2 text-sm font-semibold">{t.title}</p>}
                  <div className="overflow-x-auto border border-[#111] bg-white">
                    <table className="w-full min-w-[420px] border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#111] text-left text-white">
                          {t.headers.map((h, j) => (
                            <th key={j} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.rows.map((row, r) => (
                          <tr key={r} className="border-t border-[#111]/15 align-top">
                            {row.map((cell, c) => (
                              <td key={c} className={cn('px-3 py-2.5', c === 0 && 'font-semibold')}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Examples */}
        <section>
          <SectionTitle id="examples">Жишээ</SectionTitle>
          {hasReading && (
            <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 text-xs text-[#111]/60">
              <input
                type="checkbox"
                checked={showReading}
                onChange={e => setShowReading(e.target.checked)}
                className="accent-[#c41212]"
              />
              Ромажи уншлага харуулах
            </label>
          )}
          <ul className="divide-y divide-[#111]/15 border-y border-[#111]">
            {lesson.examples.map((e, i) => (
              <li key={i} className="flex items-start gap-3 py-4">
                <button
                  type="button"
                  onClick={() => speak(e.t, lang)}
                  aria-label="Сонсох"
                  className="mt-0.5 shrink-0 p-1 text-[#111]/45 transition-colors hover:text-[#c41212]"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <p className="text-lg leading-snug">{e.t}</p>
                  {e.r && showReading && <p className="text-xs italic text-[#111]/45">{e.r}</p>}
                  <p className="mt-1 text-sm text-[#111]/65">{e.mn}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Mistakes */}
        {lesson.mistakes && lesson.mistakes.length > 0 && (
          <section>
            <SectionTitle id="mistakes">Түгээмэл алдаа</SectionTitle>
            <ul className="space-y-4">
              {lesson.mistakes.map((m, i) => (
                <li key={i} className="border border-[#111] bg-white p-4 text-sm">
                  <p className="flex gap-2 text-[#b91c1c]">
                    <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span className="line-through decoration-[#b91c1c]/50">{m.wrong}</span>
                  </p>
                  <p className="mt-1 flex gap-2 text-[#15803d]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span className="font-semibold">{m.right}</span>
                  </p>
                  <p className="mt-2 text-[#111]/60">{m.why}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tips */}
        {lesson.tips && lesson.tips.length > 0 && (
          <aside className="border border-[#111] bg-white p-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
              Санаж яв
            </p>
            <ul className="list-disc space-y-1.5 pl-5 text-sm">
              {lesson.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </aside>
        )}

        {/* Quiz */}
        <section>
          <SectionTitle id="quiz">Дасгал</SectionTitle>
          <Quiz
            key={lesson.id}
            lesson={lesson}
            onFinish={pct => complete(lesson.id, pct)}
            nextHref={next ? `${basePath}/lesson/${next.id}` : undefined}
          />
        </section>
      </div>

      {/* Footer controls */}
      <footer className="mt-16 space-y-6 border-t border-[#111] pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {finished ? (
            <button
              type="button"
              onClick={() => uncomplete(lesson.id)}
              className="text-xs text-[#111]/55 underline-offset-4 hover:text-[#c41212] hover:underline"
            >
              Дууссан тэмдэглэгээг цуцлах
            </button>
          ) : (
            <button
              type="button"
              onClick={() => complete(lesson.id, null)}
              className="border border-[#111] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-[#111] hover:text-white"
            >
              Дууссан гэж тэмдэглэх
            </button>
          )}
          <Link href={basePath} className="text-xs text-[#111]/55 hover:text-[#c41212]">
            Бүх хичээл →
          </Link>
        </div>
        <div className="grid gap-px border border-[#111] bg-[#111] sm:grid-cols-2">
          {prev ? (
            <Link href={`${basePath}/lesson/${prev.id}`} className="group flex items-center gap-3 bg-white p-4 transition-colors hover:bg-[#f3f1ee]">
              <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
              <span className="min-w-0">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#111]/45">Өмнөх</span>
                <span className="block truncate text-sm">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <span className="hidden bg-white sm:block" />
          )}
          {next ? (
            <Link href={`${basePath}/lesson/${next.id}`} className="group flex items-center justify-end gap-3 bg-white p-4 text-right transition-colors hover:bg-[#f3f1ee]">
              <span className="min-w-0">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#111]/45">Дараагийн</span>
                <span className="block truncate text-sm">{next.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <span className="bg-white" />
          )}
        </div>
      </footer>
    </article>
  );
}

/* ───────────────────────── Quiz ───────────────────────── */

function Quiz({
  lesson,
  onFinish,
  nextHref,
}: {
  lesson: GrammarLessonData;
  onFinish: (pct: number) => void;
  nextHref?: string;
}) {
  const [picked, setPicked] = useState<(number | null)[]>(() => lesson.quiz.map(() => null));
  const answered = picked.filter(p => p !== null).length;
  const total = lesson.quiz.length;
  const correct = picked.filter((p, i) => p === lesson.quiz[i].answer).length;
  const complete = answered === total;
  const reported = useRef(false);

  useEffect(() => {
    if (complete && !reported.current) {
      reported.current = true;
      onFinish(Math.round((correct / total) * 100));
    }
  }, [complete, correct, total, onFinish]);

  const reset = () => {
    reported.current = false;
    setPicked(lesson.quiz.map(() => null));
  };

  return (
    <div className="space-y-6">
      {lesson.quiz.map((q, qi) => {
        const choice = picked[qi];
        const isDone = choice !== null;
        return (
          <fieldset key={qi} className="border border-[#111] bg-white p-4 sm:p-5">
            <legend className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c41212]">
              Асуулт {qi + 1} / {total}
            </legend>
            <p className="mb-3 text-base">{q.q}</p>
            <div className="grid gap-2">
              {q.options.map((opt, oi) => {
                const isRight = oi === q.answer;
                const isPicked = choice === oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={isDone}
                    onClick={() => setPicked(p => p.map((v, i) => (i === qi ? oi : v)))}
                    className={cn(
                      'flex items-center justify-between gap-3 border px-3 py-2.5 text-left text-sm transition-colors',
                      !isDone && 'border-[#111]/30 hover:border-[#111] hover:bg-[#f3f1ee]',
                      isDone && isRight && 'border-[#15803d] bg-[#15803d]/10',
                      isDone && isPicked && !isRight && 'border-[#b91c1c] bg-[#b91c1c]/10',
                      isDone && !isRight && !isPicked && 'border-[#111]/15 text-[#111]/40'
                    )}
                  >
                    <span>{opt}</span>
                    {isDone && isRight && <Check className="h-4 w-4 shrink-0 text-[#15803d]" aria-hidden />}
                    {isDone && isPicked && !isRight && <X className="h-4 w-4 shrink-0 text-[#b91c1c]" aria-hidden />}
                  </button>
                );
              })}
            </div>
            {isDone && (
              <p
                className={cn(
                  'mt-3 text-sm',
                  choice === q.answer ? 'text-[#15803d]' : 'text-[#b91c1c]'
                )}
                role="status"
              >
                {choice === q.answer ? 'Зөв! ' : 'Буруу. '}
                <span className="text-[#111]/70">{q.why}</span>
              </p>
            )}
          </fieldset>
        );
      })}

      {complete && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111] p-5 text-white">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Үр дүн</p>
            <p className="text-2xl tabular-nums">
              {correct} / {total}
              <span className="ml-2 text-sm text-white/60">
                {correct === total ? 'Төгс!' : correct / total >= 0.6 ? 'Сайн байна' : 'Тайлбарыг дахин уншаад оролд'}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-2 border border-white/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-white hover:text-[#111]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Дахин
            </button>
            {nextHref && (
              <Link
                href={nextHref}
                className="flex items-center gap-2 bg-[#c41212] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-90"
              >
                Дараагийнх <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
