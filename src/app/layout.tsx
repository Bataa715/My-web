import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { SkillsProvider } from "@/contexts/SkillsContext";
import MainLayout from "@/components/MainLayout";
import { EducationProvider } from "@/contexts/EducationContext";
import { HobbyProvider } from "@/contexts/HobbyContext";
import { ExperienceProvider } from "@/contexts/ExperienceContext";
import IntroOverlay from "@/components/IntroOverlay";
import { JetBrains_Mono } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrainsMono',
})

export const metadata: Metadata = {
  title: "Batmyagmar",
  description: "Англи • Япон • Программчлал сурах хувийн систем",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${jetbrainsMono.variable} min-h-screen bg-background font-body antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="default"
            enableSystem={false}
            disableTransitionOnChange
        >
          <IntroOverlay />
          <FirebaseClientProvider>
              <EditModeProvider>
                  <EducationProvider>
                  <ExperienceProvider>
                  <ProjectProvider>
                      <SkillsProvider>
                      <HobbyProvider>
                          <MainLayout>
                            {children}
                          </MainLayout>
                          <Toaster />
                      </HobbyProvider>
                      </SkillsProvider>
                  </ProjectProvider>
                  </ExperienceProvider>
                  </EducationProvider>
              </EditModeProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
