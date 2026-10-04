'use client';

import ToolPageShell from '@/features/tools/ToolPageShell';
import CurriculumBrowser from '@/features/language/components/curriculum/CurriculumBrowser';
import CustomGrammarNotes from '@/features/language/components/curriculum/CustomGrammarNotes';

export default function EnglishGrammarPage() {
  return (
    <ToolPageShell
      title="Grammar"
      description="Анхан болон дунд шатны дүрмийг тайлбар, жишээ, дасгалтайгаар алхам алхмаар сур."
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Англи хэл', href: '/tools/english' },
        { label: 'Дүрэм' },
      ]}
    >
      <CurriculumBrowser lang="english" basePath="/tools/english/grammar" />
      <CustomGrammarNotes lang="english" />
    </ToolPageShell>
  );
}
