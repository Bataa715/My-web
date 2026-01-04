'use client';

import VocabularyManager from "@/components/shared/VocabularyManager";

const columns = [
  { key: 'word' as const, header: 'Япон үг' },
  { key: 'romaji' as const, header: 'Ромажи' },
  { key: 'meaning' as const, header: 'Утга' },
];

export default function JapaneseVocabularyPage() {
  return (
    <div className="space-y-8">
      <VocabularyManager
        wordType="japanese"
        columns={columns}
        title="Япон үгс"
      />
    </div>
  );
}
