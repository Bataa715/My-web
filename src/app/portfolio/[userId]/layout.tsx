
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { SkillsProvider } from "@/contexts/SkillsContext";
import { EducationProvider } from "@/contexts/EducationContext";
import { HobbyProvider } from "@/contexts/HobbyContext";
import { ExperienceProvider } from "@/contexts/ExperienceContext";
import { JetBrains_Mono } from "next/font/google";
import PortfolioHeader from "./PortfolioHeader";
import PortfolioFooter from "./PortfolioFooter";

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrainsMono',
})

export const metadata: Metadata = {
  title: "Portfolio",
  description: "A personal portfolio.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function PortfolioLayout({
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
          <EditModeProvider>
            <EducationProvider>
            <ExperienceProvider>
            <ProjectProvider>
                <SkillsProvider>
                <HobbyProvider>
                    <div className="min-h-screen p-3 md:p-4 lg:p-6 bg-neutral-950">
                        <div className="animated-border-wrapper">
                            <div className="relative z-10 flex min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)] flex-col rounded-[1.6rem] bg-background overflow-hidden shadow-2xl shadow-primary/5">
                                <div className="relative z-10">
                                    <PortfolioHeader />
                                </div>
                                <main className="relative z-10 flex-1">
                                    {children}
                                </main>
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
          </EditModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
