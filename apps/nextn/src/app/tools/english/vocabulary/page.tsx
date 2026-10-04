'use client';

import VocabularyManager from '@/features/language/components/VocabularyManager';
import type { EnglishWord } from '@/lib/types';
import ToolPageShell from '@/features/tools/ToolPageShell';

const columns: { key: keyof EnglishWord; header: string }[] = [
  { key: 'word', header: 'English Word' },
  { key: 'translation', header: 'Монгол орчуулга' },
  { key: 'definition', header: 'Жишээ өгүүлбэр' },
];

export default function EnglishVocabularyPage() {
  return (
    <ToolPageShell
      title="Vocabulary"
      description="Бэлэн сангаас үг нэм, өөрийн үгээ бич, дараа нь карт, тест, холбох тоглоомоор цээжил."
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Англи хэл', href: '/tools/english' },
        { label: 'Үгс' },
      ]}
    >
      <VocabularyManager<EnglishWord>
        wordType="english"
        columns={columns}
        title="Англи үгс"
      />
    </ToolPageShell>
  );
}
