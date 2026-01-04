
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
import IntroOverlay from "@/components/IntroOverlay";
import { JetBrains_Mono } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrainsMono',
})

export const metadata: Metadata = {
  title: "Kaizen",
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
          <AnimatePresence mode="wait">
            <motion.div>
                <IntroOverlay />
                <FirebaseClientProvider>
                    <EditModeProvider>
                        <EducationProvider>
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
                        </EducationProvider>
                    </EditModeProvider>
                </FirebaseClientProvider>
             </motion.div>
          </AnimatePresence>
        </ThemeProvider>
      </body>
    </html>
  );
}
