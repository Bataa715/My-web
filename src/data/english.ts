import type { EnglishWord } from '@/lib/types';

export const initialEnglishWords: Omit<EnglishWord, 'id' | 'memorized'>[] = [
  { word: 'apple', meaning: 'алим' },
  { word: 'book', meaning: 'ном' },
  { word: 'car', meaning: 'машин' },
  { word: 'dog', meaning: 'нохой' },
  { word: 'house', meaning: 'байшин' },
  { word: 'computer', meaning: 'компьютер' },
  { word: 'water', meaning: 'ус' },
  { word: 'friend', meaning: 'найз' },
  { word: 'work', meaning: 'ажил' },
  { word: 'school', meaning: 'сургууль' },
];
