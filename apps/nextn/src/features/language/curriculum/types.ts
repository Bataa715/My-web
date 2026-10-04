/**
 * Built-in grammar curriculum — authored in code (no database needed).
 * Same shape for English and Japanese so one UI renders both.
 */
export type LessonLevel = 'beginner' | 'intermediate';
export type CurriculumLang = 'english' | 'japanese';

export interface LevelMeta {
  id: LessonLevel;
  label: string;
  /** Common scale label: CEFR for English, JLPT for Japanese */
  scale: string;
  blurb: string;
}

export interface LessonExample {
  /** The sentence in the target language */
  t: string;
  /** Reading aid — hiragana/romaji for Japanese (optional for English) */
  r?: string;
  /** Mongolian translation */
  mn: string;
}

export interface LessonTable {
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface LessonPattern {
  /** e.g. "Эерэг", "Асуух", "Үгүйсгэх" */
  label: string;
  /** The formula, e.g. "S + am/is/are + noun" */
  formula: string;
  example: string;
}

export interface LessonMistake {
  wrong: string;
  right: string;
  why: string;
}

export interface LessonQuestion {
  q: string;
  options: string[];
  /** Index into options */
  answer: number;
  why: string;
}

export interface GrammarLessonData {
  id: string;
  level: LessonLevel;
  /** Topic group shown as a section heading in the list */
  category: string;
  /** Target-language title, e.g. "Present Simple" / "は — Topic marker" */
  title: string;
  /** Mongolian title shown under it */
  titleMn: string;
  /** One-sentence "what you will be able to do" */
  summary: string;
  /** Explanation paragraphs, in Mongolian */
  explain: string[];
  patterns?: LessonPattern[];
  tables?: LessonTable[];
  examples: LessonExample[];
  mistakes?: LessonMistake[];
  tips?: string[];
  quiz: LessonQuestion[];
}

export interface Curriculum {
  lang: CurriculumLang;
  levels: LevelMeta[];
  lessons: GrammarLessonData[];
}
