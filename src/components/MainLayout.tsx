"use client";

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const noHeaderFooterPaths = ['/login', '/signup', '/'];

  const showHeaderFooter = !noHeaderFooterPaths.includes(pathname);

  return (
    <div className="relative flex min-h-screen flex-col">
      {showHeaderFooter && <Header />}
      <main className="flex-1">
         {showHeaderFooter ? (
          <div className="page-container-wrapper rounded-lg mx-2 my-4">
             <div className="page-container p-4 sm:p-6 lg:p-8 rounded-lg">
                {children}
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        )}
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}
