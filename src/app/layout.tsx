
import type { Metadata } from "next";
import { AppThemeProvider } from "@/components/AppThemeProvider";
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
    <html lang="mn" suppressHydrationWarning className="dark">
      <head>
      </head>
      <body className="min-h-screen bg-background antialiased">
        <IntroOverlay />
        <AppThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <EditModeProvider>
                <EducationProvider>
                  <ProjectProvider>
                    <SkillsProvider>
                      <HobbyProvider>
                        <MainLayout>
                          <div className="page-container-wrapper">
                            <div className="page-container">
                              <div className="p-4 sm:p-6 lg:p-8">
                                {children}
                              </div>
                            </div>
                          </div>
                        </MainLayout>
                        <Toaster />
                      </HobbyProvider>
                    </SkillsProvider>
                  </ProjectProvider>
                </EducationProvider>
            </EditModeProvider>
          </FirebaseClientProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
