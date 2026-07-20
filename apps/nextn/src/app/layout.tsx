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
import CosmosBackground from '@/components/cosmos/CosmosBackground';
import { JetBrains_Mono, Exo_2 } from 'next/font/google';

// Code / numeric contexts only (kept for pre, code, kbd, samp)
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrainsMono',
  display: 'swap',
  preload: false,
});

// Main body font — futuristic sans with full Cyrillic support (Mongolian!)
const exo2 = Exo_2({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-exo',
  display: 'swap',
  preload: true,
});

// Display headlines use Exo 2 as well (bold weights) — a separate latin-only
// display face made Mongolian Cyrillic headings fall back to Arial and look
// like a completely different font.

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
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  // iPhone: Safari → Share → "Add to Home Screen" installs this as an app
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PersonalWeb',
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
    { media: '(prefers-color-scheme: light)', color: '#05050a' },
    { media: '(prefers-color-scheme: dark)', color: '#05050a' },
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
      className={`${exo2.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Preconnect to critical external resources */}
        <link rel="dns-prefetch" href="https://cdn.simpleicons.org" />
        <link
          rel="dns-prefetch"
          href="https://firebasestorage.googleapis.com"
        />
      </head>
      <body className={`min-h-screen font-sans antialiased`}>
        {/* Persistent 3D deep-space backdrop — lives behind every page */}
        <CosmosBackground />
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
