"use client";

import { ProjectProvider } from '@/contexts/ProjectContext';
import { SkillsProvider } from '@/contexts/SkillsContext';
import { EditModeProvider } from '@/contexts/EditModeContext';

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <EditModeProvider>
      <ProjectProvider>
        <SkillsProvider>
          {children}
        </SkillsProvider>
      </ProjectProvider>
    </EditModeProvider>
  );
}
