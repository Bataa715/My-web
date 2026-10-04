'use client';

import { useMemo, useState } from 'react';
import ToolPageShell from '@/features/tools/ToolPageShell';
import { cn } from '@/lib/utils';
import {
  hiraganaData,
  katakanaData,
  kanaRows,
  kanaRowsKatakana,
  type KanaCharacter,
} from '@/features/language/data/kana';
import KanaChart, { buildGroups } from '@/features/language/components/kana/KanaChart';
import KanaDetail from '@/features/language/components/kana/KanaDetail';
import KanaQuiz from '@/features/language/components/kana/KanaQuiz';
import FlashcardGame from '../components/FlashcardGame';
import { useSyncedState } from '@/hooks/use-synced-state';

type Script = 'hiragana' | 'katakana';
type Mode = 'chart' | 'quiz' | 'cards';

const SCRIPTS: { id: Script; jp: string; label: string; use: string }[] = [
  { id: 'hiragana', jp: 'ひらがな', label: 'Хирагана', use: 'Япон өөрийн үг, дүрмийн дагавар' },
  { id: 'katakana', jp: 'カタカナ', label: 'Катакана', use: 'Гадаад үг, нэр, дуу авиа' },
];

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'chart', label: 'Хүснэгт', hint: 'Сур, уншилтыг үз' },
  { id: 'quiz', label: 'Таних тест', hint: '4 хариултаас сонго' },
  { id: 'cards', label: 'Flashcard', hint: 'Карт эргүүл' },
];

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

export default function KanaPage() {
  const [script, setScript] = useState<Script>('hiragana');
  const [mode, setMode] = useState<Mode>('chart');
  const [selected, setSelected] = useState<KanaCharacter | undefined>();
  // Saved to Supabase (with a localStorage cache) so ticks survive redeploys
  // and show up on every device.
  const [memorizedList, setMemorizedList] = useSyncedState<string[]>('kana-memorized', []);
  const memorized = useMemo(() => new Set(memorizedList), [memorizedList]);

  const data = script === 'hiragana' ? hiraganaData : katakanaData;
  const other = script === 'hiragana' ? katakanaData : hiraganaData;
  const rowLabels = script === 'hiragana' ? kanaRows : kanaRowsKatakana;

  const sections = useMemo(
    () => [
      {
        id: 'basic',
        title: 'Үндсэн 46 үсэг',
        note: 'Эхлээд эдгээрийг сур. Мөр бүрийг а-и-у-э-о дарааллаар уншина.',
        groups: buildGroups(data, ['vowel', 'consonant'], rowLabels),
      },
      {
        id: 'voiced',
        title: 'Дакутэн ба Хандакутэн (゛ ゜)',
        note: '゛ нэмбэл дуу чанга болно (か → が). ゜ нэмбэл П дуу болно (は → ぱ).',
        groups: buildGroups(data, ['dakuten', 'handakuten'], rowLabels),
      },
      {
        id: 'combo',
        title: 'Нийлмэл дуу (拗音)',
        note: 'И-үсэг + жижиг や・ゆ・よ нийлж нэг үе болно (き + ゃ = きゃ "кя").',
        groups: buildGroups(data, ['combo'], rowLabels),
      },
    ],
    [data, rowLabels]
  );

  const basic = data.filter(k => k.type === 'vowel' || k.type === 'consonant');
  const memorizedAll = data.filter(k => memorized.has(k.character)).length;
  const memorizedBasic = basic.filter(k => memorized.has(k.character)).length;

  const toggle = (char: string) =>
    setMemorizedList(prev => (prev.includes(char) ? prev.filter(c => c !== char) : [...prev, char]));

  const markAll = (chars: string[]) =>
    setMemorizedList(prev => Array.from(new Set([...prev, ...chars])));

  const counterpart = selected
    ? other.find(k => k.romaji === selected.romaji && k.type === selected.type && k.row === selected.row)
    : undefined;

  const switchScript = (s: Script) => {
    setScript(s);
    setSelected(undefined);
  };

  const meta = SCRIPTS.find(s => s.id === script)!;

  return (
    <ToolPageShell
      title={script === 'hiragana' ? 'Hiragana' : 'Katakana'}
      description="Эхлээд хүснэгтээс үсгээ сур, дараа нь тест болон карт ашиглан шалга."
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Япон хэл', href: '/tools/japanese' },
        { label: 'Кана' },
      ]}
    >
      {/* What is kana + how to study */}
      <section className="mb-10 grid gap-px border border-[#111] bg-[#111] md:grid-cols-2">
        <div className="bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">Кана гэж юу вэ?</p>
          <p className="mt-2 text-sm leading-relaxed">
            Япон хэлний дуу авиаг бичдэг хоёр цуврал үсэг. Тус бүр 46 үндсэн дуутай.{' '}
            <strong>Хирагана</strong>-г эхлээд сур (япон үг, дүрмийн дагавар), дараа нь <strong>Катакана</strong>
            -г (гадаад гаралтай үг).
          </p>
        </div>
        <ol className="space-y-1.5 bg-white p-5 text-sm">
          <li><span className="mr-2 text-[#c41212]">1</span>Хүснэгтээс үсэг дарж уншилт, жишээ үгийг үз.</li>
          <li><span className="mr-2 text-[#c41212]">2</span>Сурсан үсгээ "Цээжилсэн" гэж тэмдэглэ.</li>
          <li><span className="mr-2 text-[#c41212]">3</span>Таних тест, Flashcard-аар шалга.</li>
        </ol>
      </section>

      {/* Script switch */}
      <div role="tablist" aria-label="Үсгийн төрөл" className="mb-3 grid gap-px border border-[#111] bg-[#111] sm:grid-cols-2">
        {SCRIPTS.map(s => (
          <button
            key={s.id}
            role="tab"
            aria-selected={script === s.id}
            onClick={() => switchScript(s.id)}
            className={cn(
              'flex items-center gap-4 p-4 text-left transition-colors',
              script === s.id ? 'bg-[#111] text-white' : 'bg-white hover:bg-[#f3f1ee]'
            )}
          >
            <span className="text-3xl">{s.jp}</span>
            <span>
              <span className="block text-base">{s.label}</span>
              <span className={cn('block text-xs', script === s.id ? 'text-white/65' : 'text-[#111]/55')}>{s.use}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c41212]">
          {meta.label} — цээжлэлтийн явц
        </span>
        <div className="h-1.5 min-w-[120px] flex-1 bg-[#111]/10" aria-hidden>
          <div
            className="h-full bg-[#c41212] transition-all"
            style={{ width: `${(memorizedAll / data.length) * 100}%` }}
          />
        </div>
        <span className="tabular-nums text-[#111]/60">
          Үндсэн {memorizedBasic}/{basic.length} · Бүгд {memorizedAll}/{data.length}
        </span>
      </div>

      {/* Mode switch */}
      <div role="tablist" aria-label="Горим" className="mb-8 flex flex-wrap gap-2">
        {MODES.map(m => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              'border px-4 py-2 text-left transition-colors',
              mode === m.id ? 'border-[#c41212] bg-[#c41212] text-white' : 'border-[#111]/40 hover:border-[#111]'
            )}
          >
            <span className="block text-sm font-semibold">{m.label}</span>
            <span className={cn('block text-[11px]', mode === m.id ? 'text-white/75' : 'text-[#111]/50')}>{m.hint}</span>
          </button>
        ))}
      </div>

      {mode === 'chart' && (
        <div className="space-y-12">
          <div className="sticky top-16 z-20 -mx-4 bg-[#f3f1ee] px-4 pb-3 pt-2 md:top-20 sm:mx-0 sm:px-0">
            <KanaDetail
              kana={selected}
              script={script}
              counterpart={counterpart}
              memorized={selected ? memorized.has(selected.character) : false}
              onToggleMemorized={() => selected && toggle(selected.character)}
              onPlay={speak}
            />
          </div>

          {sections.map(sec => (
            <section key={sec.id}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg">{sec.title}</h2>
                  <p className="text-xs text-[#111]/55">{sec.note}</p>
                </div>
                <button
                  type="button"
                  onClick={() => markAll(sec.groups.flatMap(g => g.chars.map(c => c.character)))}
                  className="text-xs text-[#111]/50 underline-offset-4 hover:text-[#c41212] hover:underline"
                >
                  Бүгдийг цээжилсэн гэж тэмдэглэх
                </button>
              </div>
              <KanaChart
                groups={sec.groups}
                memorized={memorized}
                selected={selected?.character}
                onSelect={setSelected}
              />
            </section>
          ))}
        </div>
      )}

      {mode === 'quiz' && (
        <KanaQuiz
          key={script}
          data={data}
          memorized={memorized}
          onFinish={chars => markAll(chars)}
        />
      )}

      {mode === 'cards' && (
        <div className="border border-[#111] bg-white p-4 sm:p-6">
          <FlashcardGame key={script} type={script} onClose={() => setMode('chart')} />
        </div>
      )}
    </ToolPageShell>
  );
}
