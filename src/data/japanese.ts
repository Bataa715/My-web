import type { JapaneseWord } from '@/lib/types';

export const initialJapaneseWords: Omit<JapaneseWord, 'id' | 'memorized'>[] = [
  { word: 'こんにちは', romaji: 'Konnichiwa', meaning: 'Сайн уу' },
  { word: 'ありがとう', romaji: 'Arigatou', meaning: 'Баярлалаа' },
  { word: 'はい', romaji: 'Hai', meaning: 'Тийм' },
  { word: 'いいえ', romaji: 'Iie', meaning: 'Үгүй' },
  { word: '日本', romaji: 'Nihon', meaning: 'Япон' },
  { word: '私', romaji: 'Watashi', meaning: 'Би' },
  { word: '食べる', romaji: 'Taberu', meaning: 'Идэх' },
  { word: '飲む', romaji: 'Nomu', meaning: 'Уух' },
  { word: '学校', romaji: 'Gakkou', meaning: 'Сургууль' },
  { word: '友達', romaji: 'Tomodachi', meaning: 'Найз' },
];
