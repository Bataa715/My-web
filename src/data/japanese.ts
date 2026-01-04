import type { JapaneseWord } from '@/lib/types';

export const initialJapaneseWords: Omit<JapaneseWord, 'id' | 'memorized' | 'favorite'>[] = [];
