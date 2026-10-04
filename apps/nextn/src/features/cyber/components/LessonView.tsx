'use client';

import { useState } from 'react';
import { DOMAINS, type Domain } from '@/features/cyber/quiz/questions';
import { LESSONS } from '@/features/cyber/curriculum/lessons';
import { DOMAIN_META } from '@/features/cyber/curriculum/domains';
import { DIAGRAMS } from '@/features/cyber/curriculum/diagrams';
import { topicDeck } from '@/features/cyber/curriculum/analytics';
import { useProgress } from '@/features/cyber/store/progress';
import { MiniCheck } from './MiniCheck';
import { Confetti } from './Confetti';
import type { PageProps } from './learnTypes';

export function LessonView({
  domain,
  onBack,
  onOpen,
  launch,
}: {
  domain: Domain;
  onBack: () => void;
  onOpen: (d: Domain) => void;
  launch: PageProps['launch'];
}) {
  const l = LESSONS[domain];
  const meta = DOMAIN_META[domain];
  const done = useProgress((s) => !!s.lessonsDone[domain]);
  const markLessonDone = useProgress((s) => s.markLessonDone);
  const [confetti, setConfetti] = useState(false);

  const dIdx = DOMAINS.indexOf(domain);
  const nextDomain = dIdx >= 0 && dIdx < DOMAINS.length - 1 ? DOMAINS[dIdx + 1] : null;

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <Confetti show={confetti} />

      {/* Header */}
      <div className="rounded-none border border-line bg-white p-5">
        <button onClick={onBack} className="mb-3 text-[12px] text-txt-dim hover:text-cspc">← Бүх хичээл</button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{meta.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-txt">{l.titleMn}</h2>
              {done && <span className="rounded-full bg-state-ok/15 px-2 py-0.5 text-[10px] font-semibold text-state-ok">✓ Судалсан</span>}
            </div>
            <p className="text-sm text-cspc">{l.titleEn} · ~{l.minutes} мин</p>
          </div>
          <span className="text-[11px] text-txt-dim">{dIdx + 1}/{DOMAINS.length}</span>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-txt-dim">{l.intro}</p>
      </div>

      {/* Analogy callout */}
      {l.analogy && (
        <div className="rounded-none border border-cspv/30 bg-cspv/5 p-5">
          <p className="text-[13.5px] leading-relaxed text-txt">{l.analogy}</p>
        </div>
      )}

      {/* Diagrams */}
      {l.diagrams && l.diagrams.map((id) => {
        const d = DIAGRAMS[id];
        return (
          <div key={id} className="rounded-none border border-line bg-ink-800 p-5">
            <div className="mb-3 text-[11px] uppercase tracking-wider text-txt-dim">📊 {d.title}</div>
            <d.Comp />
          </div>
        );
      })}

      {/* Sections */}
      {l.sections.map((sec, i) => (
        <div key={i} className="rounded-none border border-line bg-ink-800 p-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-txt">
            <span>{sec.icon}</span>
            <span>{sec.h}</span>
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-txt-dim">{sec.body}</p>
          {sec.bullets && (
            <ul className="mt-3 flex flex-col gap-1.5 text-[13px] text-txt">
              {sec.bullets.map((b, j) => (
                <li key={j} className="flex gap-2"><span className="text-cspc">▸</span><span>{b}</span></li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {/* Commands */}
      {l.commands && l.commands.length > 0 && (
        <div className="rounded-none border border-line bg-ink-800 p-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-txt">💻 Командууд ба хэрэгсэл</h3>
          <div className="mt-3 flex flex-col gap-2">
            {l.commands.map((c, i) => (
              <div key={i} className="rounded-none border border-line bg-ink-900/60 p-3">
                <code className="text-[12.5px] text-cspc">{c.cmd}</code>
                <p className="mt-1 text-[11.5px] text-txt-dim">{c.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-txt-dim">
            ⚠️ Эдгээр командыг зөвхөн өөрийн эсвэл зөвшөөрөгдсөн лаб орчинд ажиллуул.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-none border border-cspc/30 bg-ink-800 p-5">
        <h3 className="text-base font-bold text-cspc">📌 Гол санаа</h3>
        <ul className="mt-3 flex flex-col gap-1.5 text-[13px] text-txt">
          {l.summary.map((s, i) => (
            <li key={i} className="flex gap-2"><span className="text-state-ok">✓</span><span>{s}</span></li>
          ))}
        </ul>
      </div>

      {/* Understanding check */}
      <MiniCheck
        domain={domain}
        onDone={(passed) => {
          markLessonDone(domain);
          if (passed) setConfetti(true);
        }}
      />

      {/* CTA: full test */}
      <button
        onClick={() => launch({ build: () => ({ deck: topicDeck(domain, 15), mode: 'practice', label: `Дадлага · ${l.titleEn}`, recordMode: 'topic' }) })}
        className="w-full rounded-none border border-line bg-ink-700 px-4 py-3 text-sm font-semibold text-txt transition hover:border-cspc hover:text-cspc"
      >
        🎯 Энэ сэдвээр илүү тест өгөх (15 асуулт)
      </button>

      {/* Next lesson */}
      {nextDomain ? (
        <button
          onClick={() => { markLessonDone(domain); onOpen(nextDomain); }}
          className="w-full rounded-none bg-cspc px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Дараагийн хичээл: {DOMAIN_META[nextDomain].mn} →
        </button>
      ) : (
        <button
          onClick={() => { markLessonDone(domain); onBack(); }}
          className="w-full rounded-none bg-state-ok px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          🎉 Бүх хичээл дууслаа — жагсаалт руу
        </button>
      )}
    </div>
  );
}
