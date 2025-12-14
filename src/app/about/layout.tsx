"use client";

import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { SkillsProvider } from '@/contexts/SkillsContext';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <div className="page-container-wrapper">
              <div className="page-container">
                <EditModeProvider>
                  <ProjectProvider>
                    <SkillsProvider>
                      {children}
                    </SkillsProvider>
                  </ProjectProvider>
                </EditModeProvider>
                <Toaster />
              </div>
            </div>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}