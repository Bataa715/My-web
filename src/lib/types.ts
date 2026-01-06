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

export interface ReadingNote {
  id?: string;
  readingMaterialId: string;
  selectedText: string;
  note: string;
  createdAt?: Date | Timestamp;
}

export interface Kana {
  id?: string;
  character: string;
  romaji: string;
}

export interface Language {
  id?: string;
  name: string;
  iconUrl: string;
  primaryColor: string;
  progress: number;
  createdAt?: Date | Timestamp;
}

export interface Chapter {
  id?: string;
  title: string;
  order: number;
  createdAt?: Date | Timestamp;
}

export type Education = {
  id?: string;
  degree: string;
  school: string;
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  score?: string;
  createdAt?: Date | Timestamp;
};

export type Hobby = {
  id?: string;
  title: string;
  description: string;
  image: string;
  imageHint: string;
  emoji?: string;
  createdAt?: Date | Timestamp;
};

export type Project = {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  live?: string;
  category: string;
  image?: string;
  createdAt?: Date | Timestamp;
};

export type Skill = {
  id: string;
  name: string;
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
  type: 'info' | 'audio';
  youtubeVideoId?: string;
};

export type PersonalInfoItem = {
  label: string;
  value: string;
  icon?: string;
};

export type UserProfile = {
  appName?: string;
  name: string;
  bio: string;
  profileImage: string;
  personalInfo?: PersonalInfoItem[];
  homeHeroImage?: string;
  aboutHeroImage?: string;
  toolsHeroImage?: string;
  backgroundImage?: string;
  orbitInfo: OrbitInfo[];
  github?: string;
  instagram?: string;
  facebook?: string;
  email?: string;
  cvUrl?: string;
};

export type Note = {
  id?: string;
  title: string;
  content: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
};

export type Todo = {
  id?: string;
  task: string;
  completed: boolean;
  createdAt?: Date | Timestamp;
};

export type Exercise = {
  id?: string;
  name: string;
  category: string;
  createdAt?: Date | Timestamp;
};

export type WorkoutLog = {
  id?: string;
  exerciseId: string;
  exerciseName: string;
  duration: number; // in minutes
  repetitions: number;
  date: Date | Timestamp;
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

export interface GeneratedWord {
  word: string;
  translation: string;
  definition?: string;
}

export type AIAction = 'translate' | 'correct' | null;

export interface AIResponse {
  correction?: string;
  explanation?: string;
  translation?: string;
}

export interface ProgrammingConcept {
  id?: string;
  title: string;
  emoji: string;
  explanation: string;
  createdAt?: Date | Timestamp;
}

export interface CheatSheetItem {
  id?: string;
  title: string;
  snippet: string;
  createdAt?: Date | Timestamp;
}
