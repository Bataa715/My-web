'use client';

import VocabularyManager from '@/components/shared/VocabularyManager';
import type { EnglishWord } from '@/lib/types';

const columns: { key: keyof EnglishWord; header: string }[] = [
  { key: 'word', header: 'English Word' },
  { key: 'translation', header: 'Монгол орчуулга' },
  { key: 'definition', header: 'Утга' },
];

export default function EnglishVocabularyPage() {
  return (
    <div className="space-y-8">
      <VocabularyManager<EnglishWord>
        wordType="english"
        columns={columns}
        title="Англи үгс"
      />
    </div>
  );
}
