import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { SkillsProvider } from '@/contexts/SkillsContext';
import MainLayout from '@/components/MainLayout';
import { EducationProvider } from '@/contexts/EducationContext';
import { HobbyProvider } from '@/contexts/HobbyContext';
import { ExperienceProvider } from '@/contexts/ExperienceContext';
import IntroOverlay from '@/components/IntroOverlay';
import { I18nProvider } from '@/contexts/I18nContext';
import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrainsMono',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'PersonalWeb',
  description: 'Англи • Япон • Программчлал сурах хувийн систем',
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL('https://personalweb.com'),
  openGraph: {
    title: 'PersonalWeb',
    description: 'Англи • Япон • Программчлал сурах хувийн систем',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical external resources */}
        <link rel="dns-prefetch" href="https://cdn.simpleicons.org" />
        <link
          rel="dns-prefetch"
          href="https://firebasestorage.googleapis.com"
        />
      </head>
      <body
        className={`${jetbrainsMono.variable} min-h-screen bg-background font-body antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <EditModeProvider>
              <I18nProvider>
                <EducationProvider>
                  <ExperienceProvider>
                    <ProjectProvider>
                      <SkillsProvider>
                        <HobbyProvider>
                          <MainLayout>{children}</MainLayout>
                          <Toaster />
                        </HobbyProvider>
                      </SkillsProvider>
                    </ProjectProvider>
                  </ExperienceProvider>
                </EducationProvider>
              </I18nProvider>
            </EditModeProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
