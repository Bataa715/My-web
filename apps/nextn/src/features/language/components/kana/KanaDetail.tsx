'use client';

import { Check, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KanaCharacter } from '@/features/language/data/kana';
import { examplesFor } from '@/features/language/data/kana-examples';

interface Props {
  kana?: KanaCharacter;
  script: 'hiragana' | 'katakana';
  /** The same sound in the other script, if any */
  counterpart?: KanaCharacter;
  memorized: boolean;
  onToggleMemorized: () => void;
  onPlay: (text: string) => void;
}

const TYPE_LABEL: Record<KanaCharacter['type'], string> = {
  vowel: 'Эгшиг',
  consonant: 'Үндсэн дуу',
  combination: 'Нийлмэл',
  dakuten: 'Дакутэн (゛) — дуу чанга',
  handakuten: 'Хандакутэн (゜) — П дуу',
  combo: 'Нийлмэл дуу (拗音)',
};

export default function KanaDetail({ kana, script, counterpart, memorized, onToggleMemorized, onPlay }: Props) {
  if (!kana) {
    return (
      <div className="flex min-h-[160px] items-center justify-center border border-dashed border-[#111]/40 p-6 text-center text-sm text-[#111]/55">
        Хүснэгтээс үсэг дарж сонго — уншилт, жишээ үг, сонсох товч энд гарна.
      </div>
    );
  }
  const example = examplesFor(script)[kana.character];

  return (
    <div className="grid grid-cols-[104px_1fr] gap-px border border-[#111] bg-[#111] sm:grid-cols-[180px_1fr]">
      <div className="flex flex-col items-center justify-center gap-1 bg-white p-3 sm:p-6">
        <span className="text-5xl leading-none sm:text-8xl">{kana.character}</span>
        <span className="mt-1 text-lg sm:mt-2 sm:text-xl">{kana.romaji}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c41212]">
          {script === 'hiragana' ? 'Хирагана' : 'Катакана'}
        </span>
      </div>

      <div className="flex flex-col gap-3 bg-white p-3 sm:gap-4 sm:p-5">
        <p className="text-[11px] text-[#111]/55">
          {TYPE_LABEL[kana.type]}
          {counterpart && (
            <>
              {' · '}
              {script === 'hiragana' ? 'Катакана' : 'Хирагана'}:{' '}
              <span className="text-base text-[#111]">{counterpart.character}</span>
            </>
          )}
        </p>

        {example ? (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c41212]">
              Санахад туслах үг
            </p>
            <p className="mt-1 text-xl sm:text-2xl">{example.word}</p>
            <p className="text-sm text-[#111]/55">
              {example.reading} — {example.mn}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[#111]/55">
            Нийлмэл дуу нь жижиг や・ゆ・よ-тэй хамт нэг үе болж уншигдана.
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onPlay(example?.word ?? kana.character)}
            className="flex items-center gap-2 border border-[#111] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-[#111] hover:text-white"
          >
            <Volume2 className="h-4 w-4" aria-hidden /> Сонсох
          </button>
          <button
            type="button"
            onClick={onToggleMemorized}
            aria-pressed={memorized}
            className={cn(
              'flex items-center gap-2 border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors',
              memorized
                ? 'border-[#c41212] bg-[#c41212] text-white'
                : 'border-[#111] hover:border-[#c41212] hover:text-[#c41212]'
            )}
          >
            <Check className="h-4 w-4" aria-hidden />
            {memorized ? 'Цээжилсэн' : 'Цээжилсэн гэж тэмдэглэх'}
          </button>
        </div>
      </div>
    </div>
  );
}
