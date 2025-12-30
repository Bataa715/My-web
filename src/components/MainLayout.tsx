"use client";

import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useUser } from '@/firebase';
import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

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
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}
