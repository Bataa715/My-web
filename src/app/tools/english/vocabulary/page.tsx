'use client';

import VocabularyManager from '@/components/shared/VocabularyManager';
import { Skeleton } from '@/components/ui/skeleton';

const columns = [
  { key: 'word' as const, header: 'English Word' },
  { key: 'translation' as const, header: 'Монгол орчуулга' },
  { key: 'definition' as const, header: 'Утга' },
];

export default function EnglishVocabularyPage() {
  return (
    <div className="space-y-8">
      <VocabularyManager
        wordType="english"
        columns={columns}
        title="Англи үгс"
      />
    </div>
  );
}
