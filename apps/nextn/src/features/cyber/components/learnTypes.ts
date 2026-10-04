import type { SessionConfig } from './QuizSession';
import type { Domain } from '@/features/cyber/quiz/questions';

export type LearnTab = 'home' | 'lessons' | 'test';

export interface SessionRequest {
  build: () => SessionConfig;
  onFinish?: (pct: number) => void;
}

export type Launch = (req: SessionRequest) => void;

export interface PageProps {
  launch: Launch;
  goTab: (t: LearnTab) => void;
  goLesson: (d: Domain) => void;
}
