import type { Metadata } from 'next';
import PortfolioHeader from './PortfolioHeader';
import PortfolioFooter from './PortfolioFooter';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { SkillsProvider } from '@/contexts/SkillsContext';
import { EducationProvider } from '@/contexts/EducationContext';
import { HobbyProvider } from '@/contexts/HobbyContext';
import { ExperienceProvider } from '@/contexts/ExperienceContext';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }> | { userId: string };
}): Promise<Metadata> {
  const resolved =
    'then' in (params as any) ? await (params as Promise<any>) : (params as any);
  const userId = resolved?.userId ?? '';
  const title = 'Portfolio';
  const description =
    'Хувийн портфолио — туршлага, төслүүд, ур чадвар, боловсрол.';
  return {
    title,
    description,
    openGraph: {
      title: `${title} · PersonalWeb`,
      description,
      type: 'profile',
      url: `/portfolio/${userId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · PersonalWeb`,
      description,
    },
    alternates: {
      canonical: `/portfolio/${userId}`,
    },
  };
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="default"
      enableSystem={false}
      disableTransitionOnChange
    >
      <EducationProvider>
        <ExperienceProvider>
          <ProjectProvider>
            <SkillsProvider>
              <HobbyProvider>
                <div className="min-h-screen p-3 md:p-4 lg:p-6 bg-background">
                  <div className="animated-border-wrapper">
                    <div className="relative z-10 flex min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)] flex-col rounded-[1.6rem] bg-background overflow-hidden shadow-2xl shadow-primary/5">
                      {/* Minimal Gradient Background */}
                      <div className="absolute inset-0 -z-10">
                        {/* Subtle gradient base */}
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-background" />

                        {/* Single soft animated orb */}
                        <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob" />

                        {/* Radial fade from center */}
                        <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/30 to-background" />
                      </div>

                      <div className="relative z-10">
                        <PortfolioHeader />
                      </div>
                      <main className="relative z-10 flex-1">{children}</main>
                      <PortfolioFooter />
                    </div>
                  </div>
                </div>
                <Toaster />
              </HobbyProvider>
            </SkillsProvider>
          </ProjectProvider>
        </ExperienceProvider>
      </EducationProvider>
    </ThemeProvider>
  );
}
