'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CURRICULA, type CurriculumLang } from '@/features/language/curriculum';
import { useCurriculumProgress } from './useCurriculumProgress';

export interface HubStep {
  id: string;
  title: string;
  /** What you do here */
  what: string;
  /** Why it matters / when to use */
  why: string;
  href: string;
  /** Marks the step whose progress is the grammar curriculum */
  grammar?: boolean;
}

interface Props {
  lang: CurriculumLang;
  intro: string;
  steps: HubStep[];
}

export default function LanguageHub({ lang, intro, steps }: Props) {
  const { done, ready } = useCurriculumProgress(lang);
  const lessons = CURRICULA[lang].lessons;
  const doneCount = lessons.filter(l => l.id in done).length;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-10 border-l-2 border-[#c41212] pl-4 text-sm leading-relaxed text-[#111]/70">
        {intro}
      </p>

      <ol className="divide-y divide-[#111] border-y border-[#111]">
        {steps.map((s, i) => (
          <li key={s.id}>
            <Link href={s.href} className="group grid grid-cols-[auto_1fr_auto] items-start gap-4 py-6 sm:gap-6">
              <span className="w-8 pt-1 text-2xl tabular-nums text-[#111]/25 sm:w-10 sm:text-3xl">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-xl">{s.title}</span>
                <span className="mt-1 block text-sm">{s.what}</span>
                <span className="mt-1 block text-xs text-[#111]/50">{s.why}</span>
                {s.grammar && (
                  <span className="mt-3 flex items-center gap-3">
                    <span className="h-1 w-32 bg-[#111]/10" aria-hidden>
                      <span
                        className="block h-full bg-[#c41212] transition-all"
                        style={{ width: `${ready ? (doneCount / lessons.length) * 100 : 0}%` }}
                      />
                    </span>
                    <span className="text-[11px] tabular-nums text-[#111]/50">
                      {ready ? doneCount : 0} / {lessons.length} хичээл
                    </span>
                  </span>
                )}
              </span>
              <ArrowRight className="mt-2 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
