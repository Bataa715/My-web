'use client';

import React from 'react';
import ToolPageShell from '@/components/shared/ToolPageShell';
import SubToolCard from '@/components/tools/SubToolCard';

const japaneseTools = [
  {
    id: 'kana',
    title: 'Кана үсэг',
    description: 'Хирагана, Катакана сурах',
    href: '/tools/japanese/kana',
    accent: '#f43f5e',
    glow: '244, 63, 94',
  },
  {
    id: 'vocabulary',
    title: 'Үгсийн сан',
    description: 'Үгсийн сангаа баяжуулах',
    href: '/tools/japanese/vocabulary',
    accent: '#a855f7',
    glow: '168, 85, 247',
  },
  {
    id: 'grammar',
    title: 'Дүрэм',
    description: 'Дүрмийн мэдлэгээ бататгах',
    href: '/tools/japanese/grammar',
    accent: '#3b82f6',
    glow: '59, 130, 246',
  },
];

export default function JapaneseToolsPage() {
  return (
    <ToolPageShell
      title="Япон хэл"
      eyebrow="Хэл сурах"
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/tools' },
        { label: 'Япон хэл' },
      ]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 max-w-4xl mx-auto">
        {japaneseTools.map((tool, index) => (
          <SubToolCard key={tool.id} {...tool} index={index} />
        ))}
      </div>
    </ToolPageShell>
  );
}
