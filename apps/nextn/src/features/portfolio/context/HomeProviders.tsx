'use client';

import { ReactNode } from 'react';
import { ProjectProvider } from '@/features/portfolio/context/ProjectContext';
import { SkillsProvider } from '@/features/portfolio/context/SkillsContext';
import { EducationProvider } from '@/features/portfolio/context/EducationContext';
import { ExperienceProvider } from '@/features/portfolio/context/ExperienceContext';
import { HobbyProvider } from '@/features/portfolio/context/HobbyContext';

/**
 * HomeProviders — bundles every Firestore-backed context that the home page
 * sections require. Mounted ONLY on the home route, so /login, /signup,
 * /login, /signup, and individual tool routes don't pay the cost of those
 * onSnapshot subscriptions.
 */
export default function HomeProviders({ children }: { children: ReactNode }) {
  return (
    <EducationProvider>
      <ExperienceProvider>
        <ProjectProvider>
          <SkillsProvider>
            <HobbyProvider>{children}</HobbyProvider>
          </SkillsProvider>
        </ProjectProvider>
      </ExperienceProvider>
    </EducationProvider>
  );
}
