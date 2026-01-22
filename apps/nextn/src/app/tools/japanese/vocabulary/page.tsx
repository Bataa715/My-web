'use client';

import VocabularyManager from '@/components/shared/VocabularyManager';
import type { JapaneseWord } from '@/lib/types';

const columns: { key: keyof JapaneseWord; header: string }[] = [
  { key: 'word', header: 'Япон үг' },
  { key: 'romaji', header: 'Ромажи' },
  { key: 'meaning', header: 'Утга' },
];

export default function JapaneseVocabularyPage() {
  return (
    <div className="space-y-8">
      <VocabularyManager<JapaneseWord>
        wordType="japanese"
        columns={columns}
        title="Япон үгс"
      />
    </div>
  );
}
