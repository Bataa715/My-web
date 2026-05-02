'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';
import ToolPageShell from '@/components/shared/ToolPageShell';
import SubToolCard from '@/components/tools/SubToolCard';

const englishSkillsConfig = [
  {
    id: 'mylingo',
    title: 'MyLingo',
    description: '10,000 үгийн тоглоомт суралцал',
    href: '/tools/english/mylingo',
    accent: '#22d3ee',
    glow: '34, 211, 238',
  },
  {
    id: 'vocabulary',
    title: 'Vocabulary',
    description: 'Үгсийн сангаа баяжуулах',
    href: '/tools/english/vocabulary',
    accent: '#a855f7',
    glow: '168, 85, 247',
  },
  {
    id: 'irregular-verbs',
    title: 'Irregular Verbs',
    description: 'Дүрмийн бус үйл үгс',
    href: '/tools/english/irregular-verbs',
    accent: '#f97316',
    glow: '249, 115, 22',
  },
  {
    id: 'grammar',
    title: 'Grammar',
    description: 'Дүрмийн мэдлэгээ бататгах',
    href: '/tools/english/grammar',
    accent: '#3b82f6',
    glow: '59, 130, 246',
  },
];

export default function EnglishDashboardPage() {
  return (
    <ToolPageShell
      title="English Dashboard"
      eyebrow="Хэл сурах"
      icon={<GraduationCap className="h-8 w-8" />}
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/tools' },
        { label: 'Англи хэл' },
      ]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 max-w-4xl mx-auto">
        {englishSkillsConfig.map((skill, index) => (
          <SubToolCard key={skill.id} {...skill} index={index} />
        ))}
      </div>
    </ToolPageShell>
  );
}
