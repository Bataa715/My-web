"use client";

import { ProjectProvider } from '@/contexts/ProjectContext';
import { SkillsProvider } from '@/contexts/SkillsContext';

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProjectProvider>
        <SkillsProvider>
            {children}
        </SkillsProvider>
    </ProjectProvider>
  );
}
