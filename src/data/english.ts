import type { EnglishWord, GrammarRule } from '@/lib/types';

export const initialEnglishWords: Omit<
  EnglishWord,
  'id' | 'memorized' | 'favorite'
>[] = [];

export const initialEnglishRule: Omit<GrammarRule, 'id' | 'createdAt'> = {
  title: 'Present Simple Tense',
  category: 'Tense',
  introduction:
    'Тогтмол давтагддаг үйлдэл, үнэн баримт, хуваарь, дүрэм журам, ерөнхий зан байдал, байнгын байдал зэргийг илэрхийлэхэд хэрэглэгддэг.',
  usage: [
    {
      condition: 'Тогтмол давтагддаг, зуршил болсон үйлдэл',
      example: 'I work every day.',
    },
    {
      condition: 'Байгалийн хууль, ерөнхий үнэн баримт',
      example: 'The Earth revolves around the Sun.',
    },
    {
      condition: 'Хуваарийн дагуух үйл явдал',
      example: 'The train leaves at 8 AM.',
    },
  ],
  form: {
    regular:
      "Ихэнх үйл үгэнд **-s** залгана: `works`, `plays`, `reads`.\n\n`-s, -sh, -ch, -x, -o` төгсгөлтэй бол **-es** залгана: `goes`, `watches`, `fixes`.\n\nГийгүүлэгч + `y`-ээр төгссөн бол 'y' үсгийг 'i' болгож **-ies** залгана: `study` -> `studies`.",
    irregular:
      '`Have` -> `has`.\n\n`Be` үйл үг нь `am, is, are` болж хувирдаг.',
  },
  structure: {
    positive: {
      formula:
        '| Subject | Verb |\n| --- | --- |\n| I/You/We/They | verb (үндсэн хэлбэр) |\n| He/She/It | verb + **s/es** |',
      examples: ['I work every day.', 'She plays the piano.'],
    },
    negative: {
      formula:
        "| Subject | do/does + not | Verb |\n| --- | --- | --- |\n| I/You/We/They | **do not (don't)** | base form |\n| He/She/It | **does not (doesn't)** | base form (s байхгүй!) |",
      examples: ['I don’t like tea.', 'He doesn’t eat meat.'],
    },
    question: {
      formula:
        '| Do/Does | Subject | Verb |\n| --- | --- | --- |\n| Do | I/you/we/they | verb | \n| Does | he/she/it | verb |',
      examples: ['Do you play tennis?', 'Does she like coffee?'],
    },
  },
  timeExpressions: [
    { word: 'always', translation: 'үргэлж' },
    { word: 'usually', translation: 'ихэвчлэн' },
    { word: 'often', translation: 'байнга' },
    { word: 'sometimes', translation: 'заримдаа' },
    { word: 'never', translation: 'хэзээ ч' },
    { word: 'every day/week/year', translation: 'өдөр/долоо хоног/жил бүр' },
    { word: 'on Mondays', translation: 'Даваа гарагт' },
    { word: 'in the morning', translation: 'өглөө' },
  ],
  practice: [
    {
      question: 'She ____ to school every day.',
      options: ['go', 'goes', 'is going'],
      correctAnswer: 'goes',
      explanation:
        '“She” гэдэг нь “he/she/it” тул үйл үгэнд “-es” нэмэгдэнэ: go → goes',
    },
    {
      question: 'I ____ breakfast at 7 AM.',
      options: ['has', 'is having', 'have'],
      correctAnswer: 'have',
      explanation:
        '“I” гэх үед үйл үг үндсэн хэлбэрээрээ хэрэглэгдэнэ. “has” зөвхөн he/she/it-д хэрэглэгдэнэ.',
    },
    {
      question: '____ they live in Paris?',
      options: ['Do', 'Does', 'Are'],
      correctAnswer: 'Do',
      explanation:
        '“They” бол олон тооны субъект тул "Do" туслах үйл үг ашиглана. “Does” зөвхөн he/she/it-д.',
    },
    {
      question: 'My brother ____ football on Sundays.',
      options: ['play', 'plays', 'is playing'],
      correctAnswer: 'plays',
      explanation:
        '“My brother” нь “he” гэсэнтэй ижил тул “play” → “plays” болно.',
    },
    {
      question: 'He ____ like chocolate.',
      options: ["don't", "doesn't", "isn't"],
      correctAnswer: "doesn't",
      explanation:
        '“He” дээр үгүйсгэсэн хэлбэрт “doesn’t” хэрэглэнэ. Үйл үг “like” үндсэн хэлбэрээрээ байна.',
    },
    {
      question: 'We ____ our homework after school.',
      options: ['is doing', 'does', 'do'],
      correctAnswer: 'do',
      explanation:
        '“We” үед үйл үг “do” хэвээр байна, ямар нэгэн -s нэмэгдэхгүй.',
    },
    {
      question: 'What time ____ the train leave?',
      options: ['do', 'is', 'does'],
      correctAnswer: 'does',
      explanation:
        '“The train” → “it” учраас “does” хэрэглэнэ. Үйл үг “leave” үндсэн хэлбэртэй байна.',
    },
    {
      question: 'They ____ go to the gym on weekends.',
      options: ['usually', 'is', 'are'],
      correctAnswer: 'usually',
      explanation:
        '“Usually” бол Present Simple-д хэрэглэдэг давтамж илэрхийлэгч үг.',
    },
    {
      question: 'My friend and I ____ tennis every Saturday.',
      options: ['play', 'plays', 'are playing'],
      correctAnswer: 'play',
      explanation:
        '“My friend and I” = “we” → “play” нь үндсэн хэлбэрээр байна.',
    },
    {
      question: 'Does she ____ coffee in the morning?',
      options: ['drinks', 'drink', 'is drinking'],
      correctAnswer: 'drink',
      explanation:
        '“Does” байгаа учраас үйл үг “drink” үндсэн хэлбэрээр хэрэглэгдэнэ. “drinks” бол буруу.',
    },
  ],
};
