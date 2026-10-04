import type { Curriculum, CurriculumLang, GrammarLessonData, LessonLevel } from './types';
import { ENGLISH_BEGINNER } from './english-beginner';
import { ENGLISH_INTERMEDIATE } from './english-intermediate';
import { JAPANESE_BEGINNER } from './japanese-beginner';
import { JAPANESE_INTERMEDIATE } from './japanese-intermediate';
import { EXTRA_QUIZ } from './extra-quiz';

export * from './types';

/** Merge the separately-authored extra practice questions into each lesson */
const withExtras = (lessons: GrammarLessonData[]): GrammarLessonData[] =>
  lessons.map(l => (EXTRA_QUIZ[l.id] ? { ...l, quiz: [...l.quiz, ...EXTRA_QUIZ[l.id]] } : l));

export const CURRICULA: Record<CurriculumLang, Curriculum> = {
  english: {
    lang: 'english',
    levels: [
      { id: 'beginner', label: 'Анхан шат', scale: 'A1–A2', blurb: 'Өдөр тутмын энгийн өгүүлбэр, үндсэн цагууд.' },
      { id: 'intermediate', label: 'Дунд шат', scale: 'B1–B2', blurb: 'Нарийн цагууд, нөхцөл, хэв, нийлмэл өгүүлбэр.' },
    ],
    lessons: withExtras([...ENGLISH_BEGINNER, ...ENGLISH_INTERMEDIATE]),
  },
  japanese: {
    lang: 'japanese',
    levels: [
      { id: 'beginner', label: 'Анхан шат', scale: 'JLPT N5', blurb: 'です/ます, бөөм, үйл үг, тэмдэг нэрийн үндэс.' },
      { id: 'intermediate', label: 'Дунд шат', scale: 'JLPT N4', blurb: 'て/た-хэлбэр, нөхцөл, хэв, эелдэг хэлний үндэс.' },
    ],
    lessons: withExtras([...JAPANESE_BEGINNER, ...JAPANESE_INTERMEDIATE]),
  },
};

export function getLesson(lang: CurriculumLang, id: string): GrammarLessonData | undefined {
  return CURRICULA[lang].lessons.find(l => l.id === id);
}

export function lessonsByLevel(lang: CurriculumLang, level: LessonLevel): GrammarLessonData[] {
  return CURRICULA[lang].lessons.filter(l => l.level === level);
}

/** Lessons grouped by category, preserving authoring order */
export function groupByCategory(lessons: GrammarLessonData[]): { category: string; lessons: GrammarLessonData[] }[] {
  const out: { category: string; lessons: GrammarLessonData[] }[] = [];
  for (const l of lessons) {
    const g = out.find(x => x.category === l.category);
    if (g) g.lessons.push(l);
    else out.push({ category: l.category, lessons: [l] });
  }
  return out;
}

export function neighbours(lang: CurriculumLang, id: string) {
  const all = CURRICULA[lang].lessons;
  const i = all.findIndex(l => l.id === id);
  return { prev: i > 0 ? all[i - 1] : undefined, next: i >= 0 && i < all.length - 1 ? all[i + 1] : undefined };
}
