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
    // If auth state is still loading, don't do anything yet.
    if (isUserLoading) {
      return;
    }
    
    // After loading, if there's no user and we are on a protected path, redirect to login.
    if (!user && !isPublicPath) {
      router.push('/login');
    }

    // After loading, if there is a user and we are on a public path (login/signup), redirect to home.
    if (user && isPublicPath) {
        router.push('/');
    }

  }, [isUserLoading, user, isPublicPath]);

  // While the auth state is loading and we are on a protected path, show a spinner.
  if (isUserLoading && !isPublicPath) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If there's no user and we're on a protected path, the useEffect will trigger a redirect,
  // so we can render a loader until the redirect happens.
  if (!user && !isPublicPath) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const showHeaderFooter = !noAuthRequiredPaths.includes(pathname);

  // Render the page content.
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
