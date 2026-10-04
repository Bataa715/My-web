import type { EnglishWord, JapaneseWord } from '@/lib/types';
import { WORDS, LEVEL_LABELS, type MLWord } from './mylingo-words';
import { JAPANESE_PACKS } from './japanese';

export interface WordPack<W> {
  id: string;
  title: string;
  /** CEFR for English (A1–C1), JLPT for Japanese (N5/N4) */
  level: string;
  words: Omit<W, 'id' | 'memorized' | 'favorite'>[];
}

type EnglishPackWord = Omit<EnglishWord, 'id' | 'memorized' | 'favorite'>;

const LEVEL_ORDER: MLWord['level'][] = ['A1', 'A2', 'B1', 'B2', 'C1'];

/** English packs: one per CEFR level, built from the MyLingo word list */
export const ENGLISH_PACKS: WordPack<EnglishWord>[] = LEVEL_ORDER.map(level => ({
  id: `en-${level.toLowerCase()}`,
  title: LEVEL_LABELS[level] ?? level,
  level,
  words: WORDS.filter(w => w.level === level).map(
    (w): EnglishPackWord => ({ word: w.word, translation: w.mn, definition: w.example })
  ),
}));

export { JAPANESE_PACKS };

export function packsFor(wordType: 'english' | 'japanese'): WordPack<EnglishWord | JapaneseWord>[] {
  return (wordType === 'english' ? ENGLISH_PACKS : JAPANESE_PACKS) as WordPack<EnglishWord | JapaneseWord>[];
}
