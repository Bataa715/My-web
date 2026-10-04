'use client';

import { LESSONS } from '@/features/cyber/curriculum/lessons';
import { QUESTIONS, DOMAINS } from '@/features/cyber/quiz/questions';
import { useProgress } from '@/features/cyber/store/progress';
import { readiness } from '@/features/cyber/curriculum/analytics';
import type { PageProps } from './learnTypes';

export function Home({ goTab }: Pick<PageProps, 'goTab'>) {
  const s = useProgress();
  const rd = readiness(s);
  const answered = Object.values(s.qstats).reduce((a, q) => a + q.seen, 0);
  const lessonCount = Object.keys(LESSONS).length;
  const lessonsDone = DOMAINS.filter((d) => s.lessonsDone[d]).length;
  const hasProgress = answered > 0 || lessonsDone > 0;

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center px-6 pb-12 pt-10">
      <p className="max-w-md text-center text-[15px] leading-relaxed text-txt-dim">
        Кибер аюулгүй байдлыг <span className="text-txt">эхнээс нь, өндөр түвшинд</span> эзэмш.
        Гүнзгий хичээл сурч, {QUESTIONS.length}+ асуултаар мэдлэгээ бат болго.
      </p>

      {/* Progress strip */}
      {hasProgress && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-none border border-line bg-ink-800/60 px-6 py-3">
          <Stat value={`${rd.score}%`} label="Бэлэн байдал" color={rd.color} />
          <div className="h-8 w-px bg-line" />
          <Stat value={`${lessonsDone}/${lessonCount}`} label="Хичээл" color="text-cspc" />
          <div className="h-8 w-px bg-line" />
          <Stat value={`🔥 ${s.streak.current}`} label="Дараалсан хоног" color="text-txt" />
        </div>
      )}

      {/* Two entry cards */}
      <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
        <EntryCard
          icon="📖"
          title="Хичээл"
          subtitle="Lessons"
          desc={`${lessonCount} гүнзгий сэдэв — жишээ зүйрлэл, диаграм, халдлага→илрүүлэх→хамгаалах.`}
          cspc=""
          onClick={() => goTab('lessons')}
        />
        <EntryCard
          icon="🧠"
          title="Тест"
          subtitle="Test"
          desc={`${QUESTIONS.length} асуулт — сэдвээр дадлага, цаг хэмжсэн шалгалт, тайлбартай.`}
          cspc=""
          onClick={() => goTab('test')}
        />
      </div>

      <p className="mt-auto pt-14 text-center text-[11px] text-txt-dim">
        Боловсролын зорилготой. Явц энэ төхөөрөмжид хадгалагдана.
      </p>
    </div>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-txt-dim">{label}</div>
    </div>
  );
}

function EntryCard({
  icon, title, subtitle, desc, cspc, onClick, href, cta = 'Эхлэх', className = '',
}: {
  icon: string; title: string; subtitle: string; desc: string; cspc: string;
  onClick?: () => void; href?: string; cta?: string; className?: string;
}) {
  const inner = (
    <>
      <span className="text-5xl">{icon}</span>
      <div className="mt-4 flex items-baseline gap-2">
        <h2 className="text-xl font-bold text-txt">{title}</h2>
        <span className="text-xs text-txt-dim">{subtitle}</span>
      </div>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-txt-dim">{desc}</p>
      <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-cspc opacity-80 transition group-hover:gap-3 group-hover:opacity-100">
        {cta} <span>→</span>
      </div>
    </>
  );
  const cls = `group flex flex-col rounded-none border bg-white border-[#111] hover:border-cspc p-6 text-left transition-all hover:-translate-y-1  ${cspc} ${className}`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
