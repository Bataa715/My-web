'use client';

import { DOMAINS, type Domain } from '@/features/cyber/quiz/questions';
import { LESSONS } from '@/features/cyber/curriculum/lessons';
import { DOMAIN_META } from '@/features/cyber/curriculum/domains';
import { useProgress } from '@/features/cyber/store/progress';
import { domainAccuracy } from '@/features/cyber/curriculum/analytics';
import { LessonView } from './LessonView';
import type { PageProps } from './learnTypes';

export function Lessons({
  selected,
  setSelected,
  launch,
}: {
  selected: Domain | null;
  setSelected: (d: Domain | null) => void;
} & Pick<PageProps, 'launch'>) {
  const qstats = useProgress((s) => s.qstats);
  const lessonsDone = useProgress((s) => s.lessonsDone);
  const accs = domainAccuracy(qstats);
  const accMap = new Map(accs.map((a) => [a.domain, a]));

  if (selected) {
    return <LessonView domain={selected} onBack={() => setSelected(null)} onOpen={setSelected} launch={launch} />;
  }

  const doneCount = DOMAINS.filter((d) => lessonsDone[d]).length;
  const pct = Math.round((doneCount / DOMAINS.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-txt">📖 Хичээлүүд</h2>
        <p className="text-[12px] text-txt-dim">12 сэдэв: юу вэ → яагаад → хэрхэн → халдлага → илрүүлэх → хамгаалах. Жишээ зүйрлэл, диаграмтай.</p>
      </div>

      {/* Progress */}
      <div className="rounded-none border border-line bg-ink-800 p-4">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-txt-dim">Судалсан хичээл</span>
          <span className="font-bold text-cspc">{doneCount} / {DOMAINS.length}</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-700">
          <div className="h-full bg-cspc transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {DOMAINS.map((d: Domain, i) => {
          const meta = DOMAIN_META[d];
          const l = LESSONS[d];
          const acc = accMap.get(d);
          const isDone = !!lessonsDone[d];
          return (
            <button
              key={d}
              onClick={() => setSelected(d)}
              className={`group flex flex-col rounded-none border p-5 text-left transition hover:-translate-y-0.5  ${isDone ? 'border-state-ok/30 bg-state-ok/[0.04]' : 'border-line bg-ink-800 hover:border-cspc/50'}`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-none bg-ink-700 text-[11px] font-bold text-txt-dim">{i + 1}</span>
                <span className="text-2xl">{meta.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="truncate text-sm font-bold text-txt">{l.titleMn}</div>
                    {isDone && <span className="text-state-ok">✓</span>}
                  </div>
                  <div className="truncate text-[11px] text-cspc">{l.titleEn}</div>
                </div>
                {acc && acc.pct >= 0 && (
                  <span className={`text-xs font-bold ${acc.pct >= 70 ? 'text-state-ok' : acc.pct >= 40 ? 'text-state-warn' : 'text-state-err'}`}>{acc.pct}%</span>
                )}
              </div>
              <p className="mt-3 flex-1 text-[12px] leading-relaxed text-txt-dim">{meta.blurb}</p>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="text-txt-dim">~{l.minutes} мин · {l.sections.length} хэсэг</span>
                <span className="font-semibold text-cspc opacity-80 transition group-hover:opacity-100">{isDone ? 'Дахин унших →' : 'Унших →'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
