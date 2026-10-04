'use client';

import ToolPageShell from '@/features/tools/ToolPageShell';
import CurriculumBrowser from '@/features/language/components/curriculum/CurriculumBrowser';
import CustomGrammarNotes from '@/features/language/components/curriculum/CustomGrammarNotes';

export default function JapaneseGrammarPage() {
  return (
    <ToolPageShell
      title="Дүрэм"
      description="JLPT N5–N4 дүрмийг тайлбар, жишээ, дасгалтайгаар алхам алхмаар сур."
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Япон хэл', href: '/tools/japanese' },
        { label: 'Дүрэм' },
      ]}
    >
      <CurriculumBrowser lang="japanese" basePath="/tools/japanese/grammar" />
      <CustomGrammarNotes lang="japanese" />
    </ToolPageShell>
  );
}
