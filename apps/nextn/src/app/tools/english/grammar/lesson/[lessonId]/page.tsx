'use client';

import { use } from 'react';
import Link from 'next/link';
import ToolPageShell from '@/features/tools/ToolPageShell';
import LessonView from '@/features/language/components/curriculum/LessonView';
import { getLesson } from '@/features/language/curriculum';

export default function EnglishLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = use(params);
  const lesson = getLesson('english', lessonId);

  return (
    <ToolPageShell
      title={lesson?.title ?? 'Хичээл'}
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Англи хэл', href: '/tools/english' },
        { label: 'Дүрэм', href: '/tools/english/grammar' },
        { label: lesson?.title ?? 'Хичээл' },
      ]}
    >
      {lesson ? (
        <LessonView lang="english" lesson={lesson} basePath="/tools/english/grammar" />
      ) : (
        <p className="py-16 text-center text-sm text-[#c41212]">
          Хичээл олдсонгүй.{' '}
          <Link href="/tools/english/grammar" className="underline">
            Жагсаалт руу буцах
          </Link>
        </p>
      )}
    </ToolPageShell>
  );
}
