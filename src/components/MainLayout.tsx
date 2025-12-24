"use client";

import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const noAuthRequiredPaths = ['/login', '/signup'];
  const isPublicPath = noAuthRequiredPaths.includes(pathname);

  useEffect(() => {
    if (!isUserLoading && !user && !isPublicPath) {
      router.push('/login');
    }
  }, [isUserLoading, user, isPublicPath, router]);

  if (isUserLoading && !isPublicPath) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const showHeaderFooter = !noAuthRequiredPaths.includes(pathname);

  // If user is not logged in and it's not a public path, we show nothing until redirect happens
  if (!user && !isPublicPath) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {showHeaderFooter && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}
