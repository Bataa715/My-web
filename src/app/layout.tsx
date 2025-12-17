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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-body antialiased page-border-glow">
        <AppThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <EditModeProvider>
                <EducationProvider>
                  <ProjectProvider>
                    <SkillsProvider>
                       <MainLayout>
                            {children}
                        </MainLayout>
                      <Toaster />
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
