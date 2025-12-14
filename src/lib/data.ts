import type { EnglishWord, JapaneseWord, GrammarRule, Kana, ProgrammingConcept, CheatSheetItem, ProgressItem, OrbitInfo, Project, Skill } from './types';

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
  name: "Б. Батмягмар",
  bio: "IT инженерийн чиглэлээр суралцаж буй оюутан, програмчлал, вэб хөгжүүлэлт, машин сургалт сонирхдог. Ирээдүйд програм хангамжийн инженер болно.",
  email: "bbatmyagmar7@gmail.com",
  instagram: "https://www.instagram.com/ka1__zen/",
  github: "https://github.com/Bataa715",
  facebook: "https://www.facebook.com/profile.php?id=100010513223018",
  resume: "/resume.pdf"
};

export const initialOrbitInfo: OrbitInfo[] = [
    { id: 'goal', type: 'info', icon: 'Target', title: 'Зорилго', content: 'Дэлхийн түвшний програм хангамжийн инженер болох', backgroundImage: 'https://picsum.photos/seed/goal/400/400' },
    { id: 'sport', type: 'info', icon: 'Dribbble', title: 'Дуртай спорт', content: 'Сагсан бөмбөг', backgroundImage: 'https://picsum.photos/seed/sport/400/400' },
    { id: 'song', type: 'audio', icon: 'Music', title: 'Дуртай дуу', content: 'J.Cole - No Role Modelz', youtubeVideoId: '90sMyx92_4M' },
    { id: 'anime', type: 'info', icon: 'Film', title: 'Дуртай анимэ', content: 'Attack on Titan', backgroundImage: 'https://picsum.photos/seed/anime/400/400' },
    { id: 'motto', type: 'info', icon: 'Quote', title: 'Ишлэл', content: 'Өдөр бүр өөрийнхөө хамгийн сайн хувилбар бай', backgroundImage: 'https://picsum.photos/seed/quote/400/400' },
    { id: 'crush', type: 'info', icon: 'Heart', title: 'Crush', content: 'Нууц', backgroundImage: 'https://picsum.photos/seed/heart/400/400' },
    { id: 'principle', type: 'info', icon: 'Milestone', title: 'Амьдралын зарчим', content: 'Энгийн байх', backgroundImage: 'https://picsum.photos/seed/milestone/400/400' },
    { id: 'hobby', type: 'info', icon: 'Gamepad2', title: 'Дуртай тоглоом', content: 'Компьютер тоглоом тоглох', backgroundImage: 'https://picsum.photos/seed/game/400/400' }
];

export const initialSkills: Omit<Skill, 'id' | 'createdAt'>[] = [
    {
        name: "Програмчлалын хэл",
        icon: 'Code',
        items: ["C++", "Python", "JavaScript", "Java"],
    },
    {
        name: "Вэб хөгжүүлэлт",
        icon: 'Tv',
        items: ["HTML", "CSS", "React", "Next.js", "Node.js"],
    },
    {
        name: "Өгөгдлийн сан",
        icon: 'Database',
        items: ["MongoDB", "MySQL"],
    },
    {
        name: "Бусад",
        icon: 'BrainCircuit',
        items: ["Machine Learning", "Data Processing", "REST API"],
    },
    {
        name: "Хэрэгслүүд",
        icon: 'Cog',
        items: ["Linux", "Git", "VS Code", "Docker"],
    },
];

export const initialProjects: Omit<Project, 'id' | 'createdAt'>[] = [
    {
        name: "Mongol Speech Filter",
        description: "Дууг текст болгон хөрвүүлэх, нэр ба бүдүүлэг үг шүүх Python програм.",
        technologies: ["Python", "SpeechRecognition", "NLP"],
        link: "https://github.com/Bataa715/mongol-speech-filter",
        category: "Machine Learning"
    },
    {
        name: "Checkers Game",
        description: "C болон Raylib ашиглан шатрын тоглоом бүтээсэн.",
        technologies: ["C", "Raylib"],
        link: "https://github.com/Bataa715/checkers-game",
        category: "Game Development"
    },
    {
        name: "Portfolio Website",
        description: "Өөрийн вэб портфолио болон лабораторийн тайлангийн сайт хөгжүүлсэн.",
        technologies: ["Next.js", "React", "Tailwind CSS", "Firebase"],
        link: "https://github.com/Bataa715/my-cv",
        live: "https://my-cv-batmyagmar.vercel.app/",
        category: "Web Development"
    }
];
