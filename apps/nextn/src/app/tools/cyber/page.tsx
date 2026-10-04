'use client';

import ToolPageShell from '@/features/tools/ToolPageShell';
import { Learn } from '@/features/cyber/components/Learn';

export default function CyberLearningPage() {
  return (
    <ToolPageShell
      title="Cyber Security"
      description="Кибер аюулгүй байдлын хичээл, тест, дадлага."
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Cyber Security' },
      ]}
    >
      <Learn />
    </ToolPageShell>
  );
}
