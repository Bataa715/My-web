// Complete Hiragana and Katakana data
export interface KanaCharacter {
  character: string;
  romaji: string;
  type:
    | 'vowel'
    | 'consonant'
    | 'combination'
    | 'dakuten'
    | 'handakuten'
    | 'combo';
  row?: string;
}

// All Hiragana characters
export const hiraganaData: KanaCharacter[] = [
  // Vowels (あ行)
  { character: 'あ', romaji: 'a', type: 'vowel', row: 'a' },
  { character: 'い', romaji: 'i', type: 'vowel', row: 'a' },
  { character: 'う', romaji: 'u', type: 'vowel', row: 'a' },
  { character: 'え', romaji: 'e', type: 'vowel', row: 'a' },
  { character: 'お', romaji: 'o', type: 'vowel', row: 'a' },

  // K-row (か行)
  { character: 'か', romaji: 'ka', type: 'consonant', row: 'ka' },
  { character: 'き', romaji: 'ki', type: 'consonant', row: 'ka' },
  { character: 'く', romaji: 'ku', type: 'consonant', row: 'ka' },
  { character: 'け', romaji: 'ke', type: 'consonant', row: 'ka' },
  { character: 'こ', romaji: 'ko', type: 'consonant', row: 'ka' },

  // S-row (さ行)
  { character: 'さ', romaji: 'sa', type: 'consonant', row: 'sa' },
  { character: 'し', romaji: 'shi', type: 'consonant', row: 'sa' },
  { character: 'す', romaji: 'su', type: 'consonant', row: 'sa' },
  { character: 'せ', romaji: 'se', type: 'consonant', row: 'sa' },
  { character: 'そ', romaji: 'so', type: 'consonant', row: 'sa' },

  // T-row (た行)
  { character: 'た', romaji: 'ta', type: 'consonant', row: 'ta' },
  { character: 'ち', romaji: 'chi', type: 'consonant', row: 'ta' },
  { character: 'つ', romaji: 'tsu', type: 'consonant', row: 'ta' },
  { character: 'て', romaji: 'te', type: 'consonant', row: 'ta' },
  { character: 'と', romaji: 'to', type: 'consonant', row: 'ta' },

  // N-row (な行)
  { character: 'な', romaji: 'na', type: 'consonant', row: 'na' },
  { character: 'に', romaji: 'ni', type: 'consonant', row: 'na' },
  { character: 'ぬ', romaji: 'nu', type: 'consonant', row: 'na' },
  { character: 'ね', romaji: 'ne', type: 'consonant', row: 'na' },
  { character: 'の', romaji: 'no', type: 'consonant', row: 'na' },

  // H-row (は行)
  { character: 'は', romaji: 'ha', type: 'consonant', row: 'ha' },
  { character: 'ひ', romaji: 'hi', type: 'consonant', row: 'ha' },
  { character: 'ふ', romaji: 'fu', type: 'consonant', row: 'ha' },
  { character: 'へ', romaji: 'he', type: 'consonant', row: 'ha' },
  { character: 'ほ', romaji: 'ho', type: 'consonant', row: 'ha' },

  // M-row (ま行)
  { character: 'ま', romaji: 'ma', type: 'consonant', row: 'ma' },
  { character: 'み', romaji: 'mi', type: 'consonant', row: 'ma' },
  { character: 'む', romaji: 'mu', type: 'consonant', row: 'ma' },
  { character: 'め', romaji: 'me', type: 'consonant', row: 'ma' },
  { character: 'も', romaji: 'mo', type: 'consonant', row: 'ma' },

  // Y-row (や行)
  { character: 'や', romaji: 'ya', type: 'consonant', row: 'ya' },
  { character: 'ゆ', romaji: 'yu', type: 'consonant', row: 'ya' },
  { character: 'よ', romaji: 'yo', type: 'consonant', row: 'ya' },

  // R-row (ら行)
  { character: 'ら', romaji: 'ra', type: 'consonant', row: 'ra' },
  { character: 'り', romaji: 'ri', type: 'consonant', row: 'ra' },
  { character: 'る', romaji: 'ru', type: 'consonant', row: 'ra' },
  { character: 'れ', romaji: 're', type: 'consonant', row: 'ra' },
  { character: 'ろ', romaji: 'ro', type: 'consonant', row: 'ra' },

  // W-row (わ行)
  { character: 'わ', romaji: 'wa', type: 'consonant', row: 'wa' },
  { character: 'を', romaji: 'wo', type: 'consonant', row: 'wa' },

  // N (ん)
  { character: 'ん', romaji: 'n', type: 'consonant', row: 'n' },

  // Dakuten (゛) - Voiced consonants
  { character: 'が', romaji: 'ga', type: 'dakuten', row: 'ga' },
  { character: 'ぎ', romaji: 'gi', type: 'dakuten', row: 'ga' },
  { character: 'ぐ', romaji: 'gu', type: 'dakuten', row: 'ga' },
  { character: 'げ', romaji: 'ge', type: 'dakuten', row: 'ga' },
  { character: 'ご', romaji: 'go', type: 'dakuten', row: 'ga' },

  { character: 'ざ', romaji: 'za', type: 'dakuten', row: 'za' },
  { character: 'じ', romaji: 'ji', type: 'dakuten', row: 'za' },
  { character: 'ず', romaji: 'zu', type: 'dakuten', row: 'za' },
  { character: 'ぜ', romaji: 'ze', type: 'dakuten', row: 'za' },
  { character: 'ぞ', romaji: 'zo', type: 'dakuten', row: 'za' },

  { character: 'だ', romaji: 'da', type: 'dakuten', row: 'da' },
  { character: 'ぢ', romaji: 'ji', type: 'dakuten', row: 'da' },
  { character: 'づ', romaji: 'zu', type: 'dakuten', row: 'da' },
  { character: 'で', romaji: 'de', type: 'dakuten', row: 'da' },
  { character: 'ど', romaji: 'do', type: 'dakuten', row: 'da' },

  { character: 'ば', romaji: 'ba', type: 'dakuten', row: 'ba' },
  { character: 'び', romaji: 'bi', type: 'dakuten', row: 'ba' },
  { character: 'ぶ', romaji: 'bu', type: 'dakuten', row: 'ba' },
  { character: 'べ', romaji: 'be', type: 'dakuten', row: 'ba' },
  { character: 'ぼ', romaji: 'bo', type: 'dakuten', row: 'ba' },

  // Handakuten (゜) - P-sounds
  { character: 'ぱ', romaji: 'pa', type: 'handakuten', row: 'pa' },
  { character: 'ぴ', romaji: 'pi', type: 'handakuten', row: 'pa' },
  { character: 'ぷ', romaji: 'pu', type: 'handakuten', row: 'pa' },
  { character: 'ぺ', romaji: 'pe', type: 'handakuten', row: 'pa' },
  { character: 'ぽ', romaji: 'po', type: 'handakuten', row: 'pa' },

  // Combination characters (拗音)
  { character: 'きゃ', romaji: 'kya', type: 'combo', row: 'combo' },
  { character: 'きゅ', romaji: 'kyu', type: 'combo', row: 'combo' },
  { character: 'きょ', romaji: 'kyo', type: 'combo', row: 'combo' },
  { character: 'しゃ', romaji: 'sha', type: 'combo', row: 'combo' },
  { character: 'しゅ', romaji: 'shu', type: 'combo', row: 'combo' },
  { character: 'しょ', romaji: 'sho', type: 'combo', row: 'combo' },
  { character: 'ちゃ', romaji: 'cha', type: 'combo', row: 'combo' },
  { character: 'ちゅ', romaji: 'chu', type: 'combo', row: 'combo' },
  { character: 'ちょ', romaji: 'cho', type: 'combo', row: 'combo' },
  { character: 'にゃ', romaji: 'nya', type: 'combo', row: 'combo' },
  { character: 'にゅ', romaji: 'nyu', type: 'combo', row: 'combo' },
  { character: 'にょ', romaji: 'nyo', type: 'combo', row: 'combo' },
  { character: 'ひゃ', romaji: 'hya', type: 'combo', row: 'combo' },
  { character: 'ひゅ', romaji: 'hyu', type: 'combo', row: 'combo' },
  { character: 'ひょ', romaji: 'hyo', type: 'combo', row: 'combo' },
  { character: 'みゃ', romaji: 'mya', type: 'combo', row: 'combo' },
  { character: 'みゅ', romaji: 'myu', type: 'combo', row: 'combo' },
  { character: 'みょ', romaji: 'myo', type: 'combo', row: 'combo' },
  { character: 'りゃ', romaji: 'rya', type: 'combo', row: 'combo' },
  { character: 'りゅ', romaji: 'ryu', type: 'combo', row: 'combo' },
  { character: 'りょ', romaji: 'ryo', type: 'combo', row: 'combo' },
  { character: 'ぎゃ', romaji: 'gya', type: 'combo', row: 'combo' },
  { character: 'ぎゅ', romaji: 'gyu', type: 'combo', row: 'combo' },
  { character: 'ぎょ', romaji: 'gyo', type: 'combo', row: 'combo' },
  { character: 'じゃ', romaji: 'ja', type: 'combo', row: 'combo' },
  { character: 'じゅ', romaji: 'ju', type: 'combo', row: 'combo' },
  { character: 'じょ', romaji: 'jo', type: 'combo', row: 'combo' },
  { character: 'びゃ', romaji: 'bya', type: 'combo', row: 'combo' },
  { character: 'びゅ', romaji: 'byu', type: 'combo', row: 'combo' },
  { character: 'びょ', romaji: 'byo', type: 'combo', row: 'combo' },
  { character: 'ぴゃ', romaji: 'pya', type: 'combo', row: 'combo' },
  { character: 'ぴゅ', romaji: 'pyu', type: 'combo', row: 'combo' },
  { character: 'ぴょ', romaji: 'pyo', type: 'combo', row: 'combo' },
];

// All Katakana characters
export const katakanaData: KanaCharacter[] = [
  // Vowels (ア行)
  { character: 'ア', romaji: 'a', type: 'vowel', row: 'a' },
  { character: 'イ', romaji: 'i', type: 'vowel', row: 'a' },
  { character: 'ウ', romaji: 'u', type: 'vowel', row: 'a' },
  { character: 'エ', romaji: 'e', type: 'vowel', row: 'a' },
  { character: 'オ', romaji: 'o', type: 'vowel', row: 'a' },

  // K-row (カ行)
  { character: 'カ', romaji: 'ka', type: 'consonant', row: 'ka' },
  { character: 'キ', romaji: 'ki', type: 'consonant', row: 'ka' },
  { character: 'ク', romaji: 'ku', type: 'consonant', row: 'ka' },
  { character: 'ケ', romaji: 'ke', type: 'consonant', row: 'ka' },
  { character: 'コ', romaji: 'ko', type: 'consonant', row: 'ka' },

  // S-row (サ行)
  { character: 'サ', romaji: 'sa', type: 'consonant', row: 'sa' },
  { character: 'シ', romaji: 'shi', type: 'consonant', row: 'sa' },
  { character: 'ス', romaji: 'su', type: 'consonant', row: 'sa' },
  { character: 'セ', romaji: 'se', type: 'consonant', row: 'sa' },
  { character: 'ソ', romaji: 'so', type: 'consonant', row: 'sa' },

  // T-row (タ行)
  { character: 'タ', romaji: 'ta', type: 'consonant', row: 'ta' },
  { character: 'チ', romaji: 'chi', type: 'consonant', row: 'ta' },
  { character: 'ツ', romaji: 'tsu', type: 'consonant', row: 'ta' },
  { character: 'テ', romaji: 'te', type: 'consonant', row: 'ta' },
  { character: 'ト', romaji: 'to', type: 'consonant', row: 'ta' },

  // N-row (ナ行)
  { character: 'ナ', romaji: 'na', type: 'consonant', row: 'na' },
  { character: 'ニ', romaji: 'ni', type: 'consonant', row: 'na' },
  { character: 'ヌ', romaji: 'nu', type: 'consonant', row: 'na' },
  { character: 'ネ', romaji: 'ne', type: 'consonant', row: 'na' },
  { character: 'ノ', romaji: 'no', type: 'consonant', row: 'na' },

  // H-row (ハ行)
  { character: 'ハ', romaji: 'ha', type: 'consonant', row: 'ha' },
  { character: 'ヒ', romaji: 'hi', type: 'consonant', row: 'ha' },
  { character: 'フ', romaji: 'fu', type: 'consonant', row: 'ha' },
  { character: 'ヘ', romaji: 'he', type: 'consonant', row: 'ha' },
  { character: 'ホ', romaji: 'ho', type: 'consonant', row: 'ha' },

  // M-row (マ行)
  { character: 'マ', romaji: 'ma', type: 'consonant', row: 'ma' },
  { character: 'ミ', romaji: 'mi', type: 'consonant', row: 'ma' },
  { character: 'ム', romaji: 'mu', type: 'consonant', row: 'ma' },
  { character: 'メ', romaji: 'me', type: 'consonant', row: 'ma' },
  { character: 'モ', romaji: 'mo', type: 'consonant', row: 'ma' },

  // Y-row (ヤ行)
  { character: 'ヤ', romaji: 'ya', type: 'consonant', row: 'ya' },
  { character: 'ユ', romaji: 'yu', type: 'consonant', row: 'ya' },
  { character: 'ヨ', romaji: 'yo', type: 'consonant', row: 'ya' },

  // R-row (ラ行)
  { character: 'ラ', romaji: 'ra', type: 'consonant', row: 'ra' },
  { character: 'リ', romaji: 'ri', type: 'consonant', row: 'ra' },
  { character: 'ル', romaji: 'ru', type: 'consonant', row: 'ra' },
  { character: 'レ', romaji: 're', type: 'consonant', row: 'ra' },
  { character: 'ロ', romaji: 'ro', type: 'consonant', row: 'ra' },

  // W-row (ワ行)
  { character: 'ワ', romaji: 'wa', type: 'consonant', row: 'wa' },
  { character: 'ヲ', romaji: 'wo', type: 'consonant', row: 'wa' },

  // N (ン)
  { character: 'ン', romaji: 'n', type: 'consonant', row: 'n' },

  // Dakuten (゛)
  { character: 'ガ', romaji: 'ga', type: 'dakuten', row: 'ga' },
  { character: 'ギ', romaji: 'gi', type: 'dakuten', row: 'ga' },
  { character: 'グ', romaji: 'gu', type: 'dakuten', row: 'ga' },
  { character: 'ゲ', romaji: 'ge', type: 'dakuten', row: 'ga' },
  { character: 'ゴ', romaji: 'go', type: 'dakuten', row: 'ga' },

  { character: 'ザ', romaji: 'za', type: 'dakuten', row: 'za' },
  { character: 'ジ', romaji: 'ji', type: 'dakuten', row: 'za' },
  { character: 'ズ', romaji: 'zu', type: 'dakuten', row: 'za' },
  { character: 'ゼ', romaji: 'ze', type: 'dakuten', row: 'za' },
  { character: 'ゾ', romaji: 'zo', type: 'dakuten', row: 'za' },

  { character: 'ダ', romaji: 'da', type: 'dakuten', row: 'da' },
  { character: 'ヂ', romaji: 'ji', type: 'dakuten', row: 'da' },
  { character: 'ヅ', romaji: 'zu', type: 'dakuten', row: 'da' },
  { character: 'デ', romaji: 'de', type: 'dakuten', row: 'da' },
  { character: 'ド', romaji: 'do', type: 'dakuten', row: 'da' },

  { character: 'バ', romaji: 'ba', type: 'dakuten', row: 'ba' },
  { character: 'ビ', romaji: 'bi', type: 'dakuten', row: 'ba' },
  { character: 'ブ', romaji: 'bu', type: 'dakuten', row: 'ba' },
  { character: 'ベ', romaji: 'be', type: 'dakuten', row: 'ba' },
  { character: 'ボ', romaji: 'bo', type: 'dakuten', row: 'ba' },

  // Handakuten (゜)
  { character: 'パ', romaji: 'pa', type: 'handakuten', row: 'pa' },
  { character: 'ピ', romaji: 'pi', type: 'handakuten', row: 'pa' },
  { character: 'プ', romaji: 'pu', type: 'handakuten', row: 'pa' },
  { character: 'ペ', romaji: 'pe', type: 'handakuten', row: 'pa' },
  { character: 'ポ', romaji: 'po', type: 'handakuten', row: 'pa' },

  // Combination characters
  { character: 'キャ', romaji: 'kya', type: 'combo', row: 'combo' },
  { character: 'キュ', romaji: 'kyu', type: 'combo', row: 'combo' },
  { character: 'キョ', romaji: 'kyo', type: 'combo', row: 'combo' },
  { character: 'シャ', romaji: 'sha', type: 'combo', row: 'combo' },
  { character: 'シュ', romaji: 'shu', type: 'combo', row: 'combo' },
  { character: 'ショ', romaji: 'sho', type: 'combo', row: 'combo' },
  { character: 'チャ', romaji: 'cha', type: 'combo', row: 'combo' },
  { character: 'チュ', romaji: 'chu', type: 'combo', row: 'combo' },
  { character: 'チョ', romaji: 'cho', type: 'combo', row: 'combo' },
  { character: 'ニャ', romaji: 'nya', type: 'combo', row: 'combo' },
  { character: 'ニュ', romaji: 'nyu', type: 'combo', row: 'combo' },
  { character: 'ニョ', romaji: 'nyo', type: 'combo', row: 'combo' },
  { character: 'ヒャ', romaji: 'hya', type: 'combo', row: 'combo' },
  { character: 'ヒュ', romaji: 'hyu', type: 'combo', row: 'combo' },
  { character: 'ヒョ', romaji: 'hyo', type: 'combo', row: 'combo' },
  { character: 'ミャ', romaji: 'mya', type: 'combo', row: 'combo' },
  { character: 'ミュ', romaji: 'myu', type: 'combo', row: 'combo' },
  { character: 'ミョ', romaji: 'myo', type: 'combo', row: 'combo' },
  { character: 'リャ', romaji: 'rya', type: 'combo', row: 'combo' },
  { character: 'リュ', romaji: 'ryu', type: 'combo', row: 'combo' },
  { character: 'リョ', romaji: 'ryo', type: 'combo', row: 'combo' },
  { character: 'ギャ', romaji: 'gya', type: 'combo', row: 'combo' },
  { character: 'ギュ', romaji: 'gyu', type: 'combo', row: 'combo' },
  { character: 'ギョ', romaji: 'gyo', type: 'combo', row: 'combo' },
  { character: 'ジャ', romaji: 'ja', type: 'combo', row: 'combo' },
  { character: 'ジュ', romaji: 'ju', type: 'combo', row: 'combo' },
  { character: 'ジョ', romaji: 'jo', type: 'combo', row: 'combo' },
  { character: 'ビャ', romaji: 'bya', type: 'combo', row: 'combo' },
  { character: 'ビュ', romaji: 'byu', type: 'combo', row: 'combo' },
  { character: 'ビョ', romaji: 'byo', type: 'combo', row: 'combo' },
  { character: 'ピャ', romaji: 'pya', type: 'combo', row: 'combo' },
  { character: 'ピュ', romaji: 'pyu', type: 'combo', row: 'combo' },
  { character: 'ピョ', romaji: 'pyo', type: 'combo', row: 'combo' },
];

// Row labels for grouping
export const kanaRows = {
  a: 'あ行 (Vowels)',
  ka: 'か行 (K)',
  sa: 'さ行 (S)',
  ta: 'た行 (T)',
  na: 'な行 (N)',
  ha: 'は行 (H)',
  ma: 'ま行 (M)',
  ya: 'や行 (Y)',
  ra: 'ら行 (R)',
  wa: 'わ行 (W)',
  n: 'ん (N)',
  ga: 'が行 (G)',
  za: 'ざ行 (Z)',
  da: 'だ行 (D)',
  ba: 'ば行 (B)',
  pa: 'ぱ行 (P)',
  combo: '拗音 (Combinations)',
};

export const kanaRowsKatakana = {
  a: 'ア行 (Vowels)',
  ka: 'カ行 (K)',
  sa: 'サ行 (S)',
  ta: 'タ行 (T)',
  na: 'ナ行 (N)',
  ha: 'ハ行 (H)',
  ma: 'マ行 (M)',
  ya: 'ヤ行 (Y)',
  ra: 'ラ行 (R)',
  wa: 'ワ行 (W)',
  n: 'ン (N)',
  ga: 'ガ行 (G)',
  za: 'ザ行 (Z)',
  da: 'ダ行 (D)',
  ba: 'バ行 (B)',
  pa: 'パ行 (P)',
  combo: '拗音 (Combinations)',
};
