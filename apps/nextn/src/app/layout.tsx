import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { EditModeProvider } from '@/contexts/EditModeContext';
import MainLayout from '@/components/MainLayout';
import PageTransition from '@/components/PageTransition';
import { I18nProvider } from '@/contexts/I18nContext';
import MotionProvider from '@/app/providers/MotionProvider';
import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrainsMono',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'PersonalWeb — Portfolio',
    template: '%s · PersonalWeb',
  },
  description:
    'Хувийн , англи · япон · программчлалын хэрэгслүүд бүхий нэгдсэн систем.',
  keywords: [
    'portfolio',
    'developer',
    'Mongolia',
    'англи хэл',
    'япон хэл',
    'программчлал',
  ],
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL('https://personalweb.com'),
  openGraph: {
    title: 'PersonalWeb — Portfolio',
    description:
      'Хувийн , англи · япон · программчлалын хэрэгслүүд бүхий нэгдсэн систем.',
    type: 'website',
    locale: 'mn_MN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PersonalWeb — Portfolio',
    description:
      'Хувийн , англи · япон · программчлалын хэрэгслүүд бүхий нэгдсэн систем.',
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
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="mn"
      suppressHydrationWarning
      className={jetbrainsMono.variable}
    >
      <head>
        {/* Preconnect to critical external resources */}
        <link rel="dns-prefetch" href="https://cdn.simpleicons.org" />
        <link
          rel="dns-prefetch"
          href="https://firebasestorage.googleapis.com"
        />
      </head>
      <body
        className={`min-h-screen bg-background font-mono antialiased`}
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
                <MotionProvider>
                  <MainLayout>{children}</MainLayout>
                  <PageTransition />
                </MotionProvider>
                <Toaster />
              </I18nProvider>
            </EditModeProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
