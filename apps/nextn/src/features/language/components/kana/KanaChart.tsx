'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KanaCharacter } from '@/features/language/data/kana';

const COLS = ['a', 'i', 'u', 'e', 'o'] as const;
const VOWEL_COL: Record<string, number> = { a: 0, i: 1, u: 2, e: 3, o: 4 };

/** Place kana in the 5 vowel columns (や・ゆ・よ and combos leave gaps, like a real chart) */
function placeInRow(chars: KanaCharacter[]): (KanaCharacter | null)[] {
  const slots: (KanaCharacter | null)[] = [null, null, null, null, null];
  for (const k of chars) {
    const last = k.romaji.slice(-1);
    const col = VOWEL_COL[last] ?? 0; // ん → first column
    slots[col] = k;
  }
  return slots;
}

export interface ChartGroup {
  id: string;
  label: string;
  chars: KanaCharacter[];
}

export function buildGroups(
  data: KanaCharacter[],
  types: KanaCharacter['type'][],
  rowLabels: Record<string, string>
): ChartGroup[] {
  const groups: ChartGroup[] = [];
  for (const k of data) {
    if (!types.includes(k.type)) continue;
    // combos are grouped by their consonant prefix (kya/kyu/kyo → "ky")
    const key = k.type === 'combo' ? `combo-${k.romaji.slice(0, -1)}` : (k.row ?? 'other');
    let g = groups.find(x => x.id === key);
    if (!g) {
      g = {
        id: key,
        label: k.type === 'combo' ? `${k.romaji.slice(0, -1)}–` : (rowLabels[k.row ?? ''] ?? key),
        chars: [],
      };
      groups.push(g);
    }
    g.chars.push(k);
  }
  return groups;
}

interface Props {
  groups: ChartGroup[];
  memorized: Set<string>;
  selected?: string;
  onSelect: (k: KanaCharacter) => void;
}

export default function KanaChart({ groups, memorized, selected, onSelect }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-separate border-spacing-1 text-center">
        <thead>
          <tr>
            <th className="w-24 sm:w-28" />
            {COLS.map(c => (
              <th key={c} className="pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#111]/40">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map(g => (
            <tr key={g.id}>
              <th
                scope="row"
                className="pr-2 text-right text-[11px] font-semibold leading-tight text-[#c41212]"
              >
                {g.label}
              </th>
              {placeInRow(g.chars).map((k, i) => (
                <td key={i} className="p-0">
                  {k ? (
                    <button
                      type="button"
                      onClick={() => onSelect(k)}
                      aria-pressed={selected === k.character}
                      aria-label={`${k.character} — ${k.romaji}${memorized.has(k.character) ? ', цээжилсэн' : ''}`}
                      className={cn(
                        'relative flex h-14 w-full flex-col items-center justify-center border transition-colors sm:h-16',
                        selected === k.character
                          ? 'border-[#111] bg-[#111] text-white'
                          : memorized.has(k.character)
                            ? 'border-[#c41212] bg-[#c41212]/8 hover:bg-[#c41212]/15'
                            : 'border-[#111]/25 bg-white hover:border-[#111]'
                      )}
                    >
                      {memorized.has(k.character) && selected !== k.character && (
                        <span className="absolute right-0 top-0 flex h-3.5 w-3.5 items-center justify-center bg-[#c41212]">
                          <Check className="h-2.5 w-2.5 text-white" aria-hidden />
                        </span>
                      )}
                      <span className="text-xl leading-none sm:text-2xl">{k.character}</span>
                      <span className={cn('mt-0.5 text-[10px]', selected === k.character ? 'text-white/70' : 'text-[#111]/45')}>
                        {k.romaji}
                      </span>
                    </button>
                  ) : (
                    <span className="block h-14 sm:h-16" aria-hidden />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
