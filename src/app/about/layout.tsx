"use client";

import { ProjectProvider } from '@/contexts/ProjectContext';
import { SkillsProvider } from '@/contexts/SkillsContext';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FirebaseClientProvider>
        <EditModeProvider>
            <ProjectProvider>
                <SkillsProvider>
                    {children}
                </SkillsProvider>
            </ProjectProvider>
        </EditModeProvider>
    </FirebaseClientProvider>
  );
}
