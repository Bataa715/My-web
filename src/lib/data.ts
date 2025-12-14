import type { EnglishWord, JapaneseWord, GrammarRule, Kana, ProgrammingConcept, CheatSheetItem, ProgressItem, OrbitInfo } from './types';

export const initialEnglishWords: EnglishWord[] = [
  { id: '1', word: 'Perseverance', meaning: 'Тууштай байдал', memorized: true },
  { id: '2', word: 'Ubiquitous', meaning: 'Хаа сайгүй байдаг', memorized: false },
  { id: '3', word: 'Eloquent', meaning: 'Уран цэцэн', memorized: false },
];

export const englishGrammar: GrammarRule[] = [
  {
    title: 'Present Perfect',
    explanation: 'The present perfect tense is used to describe actions that happened at an unspecified time in the past or actions that started in the past and continue to the present.',
    examples: [
      'I have visited Paris three times.',
      'She has lived here for ten years.',
      'They have just finished their homework.',
    ],
  },
  {
    title: 'Conditional (Type 2)',
    explanation: 'The second conditional is used to talk about hypothetical or unreal situations in the present or future.',
    examples: [
      'If I had a million dollars, I would buy a big house.',
      'If she were the president, she would change many things.',
      'What would you do if you won the lottery?',
    ],
  },
];

export const hiragana: Kana[] = [
  { character: 'あ', romaji: 'a' }, { character: 'い', romaji: 'i' }, { character: 'う', romaji: 'u' }, { character: 'え', romaji: 'e' }, { character: 'お', romaji: 'o' },
  { character: 'か', romaji: 'ka' }, { character: 'き', romaji: 'ki' }, { character: 'く', romaji: 'ku' }, { character: 'け', romaji: 'ke' }, { character: 'こ', romaji: 'ko' },
  { character: 'さ', romaji: 'sa' }, { character: 'し', romaji: 'shi' }, { character: 'す', romaji: 'su' }, { character: 'せ', romaji: 'se' }, { character: 'そ', romaji: 'so' },
];

export const katakana: Kana[] = [
  { character: 'ア', romaji: 'a' }, { character: 'イ', romaji: 'i' }, { character: 'ウ', romaji: 'u' }, { character: 'エ', romaji: 'e' }, { character: 'オ', romaji: 'o' },
  { character: 'カ', romaji: 'ka' }, { character: 'キ', romaji: 'ki' }, { character: 'ク', romaji: 'ku' }, { character: 'ケ', romaji: 'ke' }, { character: 'コ', romaji: 'ko' },
  { character: 'サ', romaji: 'sa' }, { character: 'シ', romaji: 'shi' }, { character: 'ス', romaji: 'su' }, { character: 'セ', romaji: 'se' }, { character: 'ソ', romaji: 'so' },
];

export const initialJapaneseWords: JapaneseWord[] = [
  { id: '1', word: 'こんにちは', romaji: 'Konnichiwa', meaning: 'Сайн байна уу', memorized: true },
  { id: '2', word: 'ありがとう', romaji: 'Arigatou', meaning: 'Баярлалаа', memorized: false },
  { id: '3', word: '日本語', romaji: 'Nihongo', meaning: 'Япон хэл', memorized: false },
];

export const japaneseGrammar: GrammarRule[] = [
  {
    title: 'N5: です (desu)',
    explanation: 'Used at the end of a sentence to be polite. It is the equivalent of "am," "is," or "are."',
    examples: ['わたしは学生です。 (Watashi wa gakusei desu.) - I am a student.'],
  },
  {
    title: 'N4: ～ことができる (~koto ga dekiru)',
    explanation: 'This grammar point is used to express that someone "can" or "is able to" do something.',
    examples: ['わたしは日本語を話すことができます。 (Watashi wa nihongo o hanasu koto ga dekimasu.) - I can speak Japanese.'],
  },
];

export const programmingConcepts: ProgrammingConcept[] = [
  {
    id: 'js',
    title: 'JavaScript',
    emoji: '📜',
    explanation: 'The core programming language of the web, enabling interactive and dynamic content on websites.'
  },
  {
    id: 'html-css',
    title: 'HTML / CSS',
    emoji: '뼈️',
    explanation: 'The building blocks of web pages. HTML provides the structure, and CSS handles the styling and layout.'
  },
  {
    id: 'react',
    title: 'React',
    emoji: '⚛️',
    explanation: 'A popular JavaScript library for building user interfaces, especially single-page applications.'
  },
];

export const cheatSheetItems: CheatSheetItem[] = [
    {
      id: '1',
      title: 'React Functional Component',
      snippet: `import React from 'react';

const MyComponent = () => {
  return (
    <div>
      <h1>Hello, World!</h1>
    </div>
  );
};

export default MyComponent;`,
    },
    {
      id: '2',
      title: 'JavaScript Arrow Function',
      snippet: `const add = (a, b) => a + b;

console.log(add(5, 3)); // Output: 8`,
    },
];

export const initialProgressItems: ProgressItem[] = [
  { id: '1', label: 'HTML Basics', learned: true, practicing: false },
  { id: '2', label: 'CSS Flexbox', learned: true, practicing: true },
  { id: '3', label: 'JavaScript Variables', learned: false, practicing: true },
  { id: '4', label: 'React Components', learned: false, practicing: false },
];

export const personalInfo = {
    name: "Б.Батмягмар",
    bio: "Би програм хангамж хөгжүүлэлт, хиймэл оюун ухаан, өгөгдлийн шинжлэх ухааны чиглэлээр ажилладаг.",
    github: "https://github.com/batmyagmar",
    instagram: "https://instagram.com/batmyagmar",
    email: "batmyagmar.b@gmail.com",
};

export const initialOrbitInfo: OrbitInfo[] = [
    { id: 'about', icon: 'User', title: 'Миний тухай', content: 'Би 20 настай, Мэдээллийн технологийн инженер мэргэжлээр суралцдаг. Вэб болон програм хангамж хөгжүүлэлтээр дагнаж, сүүлийн үеийн технологиудыг судлах сонирхолтой.' },
    { id: 'hobbies', icon: 'Gamepad2', title: 'Хобби', content: 'Чөлөөт цагаараа би код бичих, шинэ технологи судлах, мөн уран зөгнөлт ном унших дуртай.' },
    { id: 'song', icon: 'Music', title: 'Дуу', content: 'Одоогоор сонсож буй дуртай дуу.', type: 'audio', youtubeVideoId: 'dQw4w9WgXcQ' },
];
