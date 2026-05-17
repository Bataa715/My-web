'use client';

import { ReactNode } from 'react';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { SkillsProvider } from '@/contexts/SkillsContext';
import { EducationProvider } from '@/contexts/EducationContext';
import { ExperienceProvider } from '@/contexts/ExperienceContext';
import { HobbyProvider } from '@/contexts/HobbyContext';

/**
 * HomeProviders — bundles every Firestore-backed context that the home page
 * sections require. Mounted ONLY on the home route, so /login, /signup,
 * /tools, /about etc. don't pay the cost of 4 onSnapshot subscriptions.
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
