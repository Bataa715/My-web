import type { Metadata } from "next";
import { AppThemeProvider } from "@/components/AppThemeProvider";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export const metadata: Metadata = {
  title: "LinguaCore",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-body antialiased">
        <AppThemeProvider>
          <FirebaseClientProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
