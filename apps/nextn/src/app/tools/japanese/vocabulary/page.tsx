'use client';

import VocabularyManager from '@/features/language/components/VocabularyManager';
import type { JapaneseWord } from '@/lib/types';
import ToolPageShell from '@/features/tools/ToolPageShell';

const columns: { key: keyof JapaneseWord; header: string }[] = [
  { key: 'word', header: 'Япон үг' },
  { key: 'romaji', header: 'Ромажи' },
  { key: 'meaning', header: 'Утга' },
];

export default function JapaneseVocabularyPage() {
  return (
    <ToolPageShell
      title="Vocabulary"
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Япон хэл', href: '/tools/japanese' },
        { label: 'Үгс' },
      ]}
    >
      <VocabularyManager<JapaneseWord>
        wordType="japanese"
        columns={columns}
        title="Япон үгс"
      />
    </ToolPageShell>
  );
}
