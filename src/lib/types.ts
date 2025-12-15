
import type { Timestamp } from 'firebase/firestore';

export interface EnglishWord {
  id?: string;
  word: string;
  translation: string;
  definition?: string;
  memorized: boolean;
  favorite?: boolean;
}

export interface JapaneseWord {
  id?: string;
  word: string;
  romaji: string;
  meaning: string;
  memorized: boolean;
  favorite?: boolean;
}

export interface GrammarRuleUsage {
  condition: string;
  example: string;
}

export interface GrammarRuleForm {
  regular: string;
  irregular: string;
}

export interface GrammarRuleStructure {
  positive: { formula: string; examples: string[] };
  negative: { formula: string; examples: string[] };
  question: { formula: string; examples: string[] };
}

export interface GrammarTimeExpression {
  word: string;
  translation: string;
}

export interface GrammarPracticeQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GrammarRule {
  id?: string;
  title: string;
  category: string;
  introduction: string;
  usage: GrammarRuleUsage[];
  form: GrammarRuleForm;
  structure: GrammarRuleStructure;
  timeExpressions: GrammarTimeExpression[];
  practice: GrammarPracticeQuestion[];
  createdAt?: Date | Timestamp;
}

export interface ReadingMaterial {
  id?: string;
  title: string;
  content: string;
  source?: string;
  createdAt?: Date | Timestamp;
}


export interface Kana {
  id?: string;
  character: string;
  romaji: string;
}

export interface ProgrammingConcept {
  id?: string;
  title: string;
  emoji: string;
  explanation: string;
}

export interface CheatSheetItem {
  id?: string;
  title: string;
  snippet: string;
}

export interface ProgressItem {
  id?: string;
  label: string;
  learned: boolean;
  practicing: boolean;
}

export type Project = {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  live?: string;
  category: string;
  createdAt?: Date | Timestamp;
};

export type Skill = {
    id: string;
    name:string;
    icon: string; // Icon name as string
    items: string[];
    createdAt?: Date | Timestamp;
};

export type OrbitInfo = {
  id: string;
  icon: string;
  title: string;
  content: string;
  backgroundImage?: string;
  type?: 'info' | 'audio';
  audioUrl?: string;
  youtubeVideoId?: string;
};

export type UserProfile = {
    name: string;
    bio: string;
    profileImage: string;
    homeHeroImage?: string;
    aboutHeroImage?: string;
    toolsHeroImage?: string;
    orbitInfo: OrbitInfo[];
    github?: string;
    instagram?: string;
    email?: string;
};

export interface GeneratedMCQ {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GeneratedWritingTask {
  instruction: string;
  exampleAnswer: string;
}

export interface GeneratedExercises {
  multipleChoiceQuestions: GeneratedMCQ[];
  writingTasks: GeneratedWritingTask[];
}
