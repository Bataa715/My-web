"use client";

import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useFirebase } from '@/firebase';
import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useFirebase();

  const isPublicPath = useMemo(() => {
    return pathname === '/login' || pathname === '/signup';
  }, [pathname]);

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    
    if (!user && !isPublicPath) {
      router.push('/login');
      return;
    }

    if (user && isPublicPath) {
      router.push('/');
      return;
    }
  }, [isUserLoading, user, isPublicPath, router]);

  if (isUserLoading && !isPublicPath) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !isPublicPath) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isPublicPath) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen p-3 md:p-4 lg:p-6 bg-neutral-950">
      {/* Animated border wrapper */}
      <div className="animated-border-wrapper">
        <div className="relative z-10 flex min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)] flex-col rounded-3xl bg-background overflow-hidden shadow-2xl shadow-primary/5">
          
          {/* Background pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }}
            />
            {/* Gradient orbs */}
            <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute top-1/3 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
          </div>
          
          {/* Header - z-10 so it's above background but background shows through */}
          <div className="relative z-10">
            <Header />
          </div>
          <main className="relative z-10 flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
