'use client';

import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSupabase } from '@/supabase';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import IntroOverlay from '@/components/layout/IntroOverlay';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useSupabase();

  const isPublicPath = useMemo(() => {
    return (
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname.startsWith('/portfolio')
    );
  }, [pathname]);

  // Hard-cap auth wait at 2.5s. If Supabase hasn't responded by then,
  // assume signed-out and redirect — prevents infinite spinner.
  const [authTimedOut, setAuthTimedOut] = useState(false);
  useEffect(() => {
    if (!isUserLoading) return;
    const t = setTimeout(() => setAuthTimedOut(true), 2500);
    return () => clearTimeout(t);
  }, [isUserLoading]);

  const stillWaitingForAuth = isUserLoading && !authTimedOut;

  useEffect(() => {
    if (stillWaitingForAuth) return;

    if (!user && !isPublicPath) {
      router.push('/login');
      return;
    }

    if (user && (pathname === '/login' || pathname === '/signup')) {
      // Don't cut the signup onboarding dialog short.
      if (pathname === '/signup' && sessionStorage.getItem('signup-onboarding')) {
        return;
      }
      router.push('/');
      return;
    }
  }, [stillWaitingForAuth, user, isPublicPath, router, pathname]);

  if ((stillWaitingForAuth || !user) && !isPublicPath) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="h-8 w-8 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (isPublicPath) {
    return <>{children}</>;
  }

  /* Transparent shell — the fixed AOT plate (z −10) is the backdrop. */
  return (
    <>
      <IntroOverlay />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
      >
        Үндсэн агуулга руу очих
      </a>
      <div className="relative min-h-screen">
        {/* Barely-there grid overlay for structure over the starfield */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative z-50">
          <Header />
        </div>
        <main id="main-content" className="portal-page relative z-10">
          <AnimatePresence mode="wait" initial={false}>
            {children}
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </>
  );
}
