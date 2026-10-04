'use client';

import { useMemo, useState } from 'react';
import type { Domain } from '@/features/cyber/quiz/questions';
import { useProgress, type Lang } from '@/features/cyber/store/progress';
import { QuizSession } from './QuizSession';
import { Home } from './Home';
import { Lessons } from './Lessons';
import { Test } from './Test';
import type { LearnTab, SessionRequest } from './learnTypes';

const TABS: { id: LearnTab; label: string; icon: string }[] = [
  { id: 'lessons', label: 'Хичээл', icon: '📖' },
  { id: 'test', label: 'Тест', icon: '🧠' },
];

const LANGS: { id: Lang; label: string }[] = [
  { id: 'both', label: 'МН+EN' },
  { id: 'en', label: 'EN' },
];

export function Learn() {
  const [tab, setTab] = useState<LearnTab>('home');
  const [lessonDomain, setLessonDomain] = useState<Domain | null>(null);
  const [session, setSession] = useState<{ req: SessionRequest; key: number } | null>(null);
  const lang = useProgress((s) => s.lang);
  const setLang = useProgress((s) => s.setLang);
  const streak = useProgress((s) => s.streak.current);

  const config = useMemo(() => (session ? session.req.build() : null), [session]);

  const pageProps = {
    launch: (req: SessionRequest) => setSession({ req, key: 0 }),
    goTab: setTab,
    goLesson: (d: Domain) => { setLessonDomain(d); setTab('lessons'); },
  };

  // Quiz overlay (full screen)
  if (session && config) {
    return (
      <div className="min-h-[80vh] border border-[#111] bg-white text-txt">
        <QuizSession
          key={session.key}
          config={config}
          onExit={() => setSession(null)}
          onRetry={() => setSession((s) => (s ? { ...s, key: s.key + 1 } : s))}
          onFinish={(pct) => session.req.onFinish?.(pct)}
          onLearn={(d) => { setSession(null); setLessonDomain(d); setTab('lessons'); }}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh] border border-[#111] bg-white text-txt">
{tab === 'home' ? (
        <div className="relative">
          {/* minimal top-right controls on home */}
          <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          <Home goTab={setTab} />
        </div>
      ) : (
        <>
          {/* Top bar */}
          <header className="relative z-10 border-b border-[#111] bg-white">
            <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
              <button onClick={() => setTab('home')} className="flex items-center gap-2">
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-cspc">Cyber</span>
              </button>
              <div className="mx-auto flex gap-1 rounded-none border border-line bg-ink-800 p-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`rounded-none px-4 py-1.5 text-[13px] font-semibold transition ${tab === t.id ? 'bg-cspc/15 text-cspc' : 'text-txt-dim hover:text-txt'}`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-txt-dim sm:inline">🔥 {streak}</span>
                <LangToggle lang={lang} setLang={setLang} />
              </div>
            </div>
          </header>

          {/* Page */}
          <main className="relative mx-auto max-w-3xl px-4 py-7">
            {tab === 'lessons' && <Lessons selected={lessonDomain} setSelected={setLessonDomain} launch={pageProps.launch} />}
            {tab === 'test' && <Test {...pageProps} />}
            <footer className="mt-14 pb-6 text-center text-[10px] text-txt-dim">
              CSP · Cyber Security Practice — боловсролын зорилготой.
            </footer>
          </main>
        </>
      )}
    </div>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex overflow-hidden rounded-none border border-line text-[10px]">
      {LANGS.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          className={`px-2 py-1 transition ${lang === l.id ? 'bg-cspc/20 text-cspc' : 'text-txt-dim hover:text-txt'}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
