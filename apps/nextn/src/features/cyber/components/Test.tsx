'use client';

import { DOMAINS, QUESTIONS, type Domain } from '@/features/cyber/quiz/questions';
import { useProgress } from '@/features/cyber/store/progress';
import { DOMAIN_META } from '@/features/cyber/curriculum/domains';
import { domainAccuracy, quickDeck, weakDeck, mockDeck, topicDeck, byDomain } from '@/features/cyber/curriculum/analytics';
import type { PageProps } from './learnTypes';

export function Test({ launch }: PageProps) {
  const s = useProgress();
  const accs = new Map(domainAccuracy(s.qstats).map((a) => [a.domain, a]));
  const answered = Object.values(s.qstats).reduce((a, q) => a + q.seen, 0);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-txt">🧠 Тест</h2>
        <p className="mt-1 text-[13px] text-txt-dim">
          {QUESTIONS.length} асуулт, 12 сэдэв. Дадлагад хариулах бүрд тайлбар шууд гарна; шалгалт нь цаг хэмжинэ.
        </p>
      </div>

      {/* Primary modes */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ModeCard
          icon="⚡" title="Хурдан дадлага" sub="10 асуулт · тайлбартай"
          onClick={() => launch({ build: () => ({ deck: quickDeck(10), mode: 'practice', label: 'Хурдан дадлага', recordMode: 'quick' }) })}
        />
        <ModeCard
          icon="⏱️" title="Шалгалт" sub="50 асуулт · цагтай"
          onClick={() => launch({ build: () => ({ deck: mockDeck(50), mode: 'exam', label: 'Шалгалт (50)', recordMode: 'mock' }) })}
        />
        <ModeCard
          icon="🎯" title="Сул талын дасгал" sub="Буруу хариулсан асуултууд"
          disabled={answered < 5}
          onClick={() => launch({ build: () => ({ deck: weakDeck(useProgress.getState(), 20), mode: 'practice', label: 'Сул талын дасгал', recordMode: 'weak' }) })}
        />
      </div>

      {/* By topic */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-txt-dim">Сэдвээр дадлага</h3>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {DOMAINS.map((d: Domain) => {
            const meta = DOMAIN_META[d];
            const acc = accs.get(d);
            const total = byDomain(d).length;
            return (
              <button
                key={d}
                onClick={() => launch({ build: () => ({ deck: topicDeck(d, Math.min(15, total)), mode: 'practice', label: `Дадлага · ${meta.en}`, recordMode: 'topic' }) })}
                className="group flex items-center gap-3 rounded-none border border-line bg-ink-800 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-cspc/50"
              >
                <span className="text-2xl">{meta.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-txt">{meta.mn}</div>
                  <div className="truncate text-[11px] text-txt-dim">{meta.en} · {total} асуулт</div>
                </div>
                {acc && acc.pct >= 0 && (
                  <span className={`text-xs font-bold ${acc.pct >= 70 ? 'text-state-ok' : acc.pct >= 40 ? 'text-state-warn' : 'text-state-err'}`}>{acc.pct}%</span>
                )}
                <span className="text-txt-dim transition group-hover:text-cspc">→</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  icon, title, sub, onClick, disabled,
}: { icon: string; title: string; sub: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex flex-col rounded-none border border-line bg-ink-800 p-5 text-left transition hover:-translate-y-0.5 hover:border-cspc/50  disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
    >
      <span className="text-3xl">{icon}</span>
      <div className="mt-3 text-sm font-bold text-txt">{title}</div>
      <div className="mt-0.5 text-[11px] text-txt-dim">{sub}</div>
    </button>
  );
}
