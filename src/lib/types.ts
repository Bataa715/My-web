import type { Timestamp } from 'firebase/firestore';

export interface EnglishWord {
  id?: string;
  word: string;
  meaning: string;
  memorized: boolean;
}

export interface JapaneseWord {
  id?: string;
  word: string;
  romaji: string;
  meaning: string;
  memorized: boolean;
}

export interface GrammarRule {
  id?: string;
  title: string;
  explanation: string;
  examples: string[];
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
