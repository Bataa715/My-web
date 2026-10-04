import type { Metadata } from 'next';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { SupabaseClientProvider } from '@/supabase/client-provider';
import { EditModeProvider } from '@/providers/EditModeContext';
import MainLayout from '@/components/layout/MainLayout';
import PageTransition from '@/components/layout/PageTransition';
import { I18nProvider } from '@/providers/I18nContext';
import MotionProvider from '@/providers/MotionProvider';
import SiteBackground from '@/components/background/SiteBackground';
import { JetBrains_Mono, Exo_2, Cormorant_Garamond, Noto_Serif_JP } from 'next/font/google';
import { SITE_NAME } from '@/lib/brand';

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

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display-face',
  weight: ['400', '600', '700'],
  display: 'swap',
});

const notoSerifJp = Noto_Serif_JP({
  weight: ['600', '700'],
  subsets: ['latin'],
  variable: '--font-jp',
  display: 'swap',
});

// Display headlines use Exo 2 as well (bold weights) — a separate latin-only
// display face made Mongolian Cyrillic headings fall back to Arial and look
// like a completely different font.

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: 'Хувийн систем — англи · япон · программчлалын хэрэгслүүд.',
  keywords: [SITE_NAME, 'Attack on Titan', 'англи хэл', 'япон хэл', 'программчлал'],
  icons: {
    icon: '/icons/icon-512.jpg',
    apple: '/icons/apple-touch-icon.jpg',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: SITE_NAME,
  },
  metadataBase: new URL('https://personalweb.com'),
  openGraph: {
    title: SITE_NAME,
    description: 'Хувийн систем — англи · япон · программчлалын хэрэгслүүд.',
    type: 'website',
    locale: 'mn_MN',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: 'Хувийн систем — англи · япон · программчлалын хэрэгслүүд.',
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
    { media: '(prefers-color-scheme: light)', color: '#f3f1ee' },
    { media: '(prefers-color-scheme: dark)', color: '#f3f1ee' },
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
      className={`${exo2.variable} ${jetbrainsMono.variable} ${cormorant.variable} ${notoSerifJp.variable}`}
    >
      <head>
        {/* Preconnect to critical external resources */}
        <link rel="dns-prefetch" href="https://cdn.simpleicons.org" />
        <link
          rel="dns-prefetch"
          href="https://rhytjlzvowjrwwchkoao.supabase.co"
        />
        {/* Apply the saved palette before first paint to avoid a theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute('data-theme','aot');`,
          }}
        />
      </head>
      <body className={`min-h-screen font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Palette-aware persistent backdrop — lives behind every page */}
          <SiteBackground />
          <SupabaseClientProvider>
            <EditModeProvider>
              <I18nProvider>
                <MotionProvider>
                  <MainLayout>{children}</MainLayout>
                  <PageTransition />
                </MotionProvider>
                <Toaster />
              </I18nProvider>
            </EditModeProvider>
          </SupabaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
