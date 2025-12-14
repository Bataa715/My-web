export interface EnglishWord {
  id: string;
  word: string;
  meaning: string;
  memorized: boolean;
}

export interface JapaneseWord {
  id: string;
  word: string;
  romaji: string;
  meaning: string;
  memorized: boolean;
}

export interface GrammarRule {
  title: string;
  explanation: string;
  examples: string[];
}

export interface Kana {
  character: string;
  romaji: string;
}

export interface ProgrammingConcept {
  id: string;
  title: string;
  emoji: string;
  explanation: string;
}

export interface CheatSheetItem {
  id: string;
  title: string;
  snippet: string;
}

export interface ProgressItem {
  id: string;
  label: string;
  learned: boolean;
  practicing: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  live?: string;
  category: string;
  createdAt: Date;
}

export interface Skill {
    id: string;
    category: string;
    skills: string[];
    createdAt: Date;
}

export interface OrbitInfo {
  id: string;
  icon: string;
  title: string;
  content: string;
  type?: 'info' | 'audio';
  backgroundImage?: string;
  youtubeVideoId?: string;
}
