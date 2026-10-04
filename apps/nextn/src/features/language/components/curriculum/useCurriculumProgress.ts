'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CurriculumLang } from '@/features/language/curriculum';

/** lessonId → best quiz score (0-100), or null when only marked as read */
export type ProgressMap = Record<string, number | null>;

const storageKey = (lang: CurriculumLang) => `curriculum:${lang}:v1`;

export function useCurriculumProgress(lang: CurriculumLang) {
  const [done, setDone] = useState<ProgressMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(lang));
      if (raw) setDone(JSON.parse(raw).done ?? {});
    } catch {
      /* storage unavailable — start empty */
    }
    setReady(true);
  }, [lang]);

  const persist = useCallback(
    (next: ProgressMap) => {
      try {
        localStorage.setItem(storageKey(lang), JSON.stringify({ done: next }));
      } catch {
        /* ignore */
      }
    },
    [lang]
  );

  /** Record a finished lesson. `score` = quiz percentage, or null for "marked read". */
  const complete = useCallback(
    (id: string, score: number | null) => {
      setDone(prev => {
        const old = prev[id];
        const best =
          score === null ? (old === undefined ? null : old) : Math.max(old ?? 0, score);
        const next = { ...prev, [id]: best };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const uncomplete = useCallback(
    (id: string) => {
      setDone(prev => {
        const next = { ...prev };
        delete next[id];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { done, ready, complete, uncomplete };
}
