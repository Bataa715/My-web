'use client';

import Link from 'next/link';
import { Home, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';

const mainLinks = [
  { href: '/', label: 'Нүүр' },
  { href: '/about', label: 'Тухай' },
];

const PortfolioHeader = () => {
  const pathname = usePathname();
  const { user, firestore, isUserLoading } = useFirebase();
  const [appName, setAppName] = useState('');

  useEffect(() => {
    const fetchAppName = async () => {
      if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setAppName(data.name || 'Portfolio');
        }
      } else if (!isUserLoading) {
        setAppName('Portfolio');
      }
    };
    fetchAppName();
  }, [user, firestore, isUserLoading]);

  return (
    <header className="sticky top-0 left-0 w-full z-50">
      <div className="relative">
        <div className="mx-3 md:mx-4 mt-3 md:mt-4 grid grid-cols-[1fr_auto_1fr] items-center p-2 px-4 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10">
          <div className="flex justify-self-start items-center gap-4">
            <Link
              href="/"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === '/' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Нүүр
            </Link>
            <Link
              href="/about"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === '/about' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Тухай
            </Link>
          </div>

          <div className="justify-self-center">
            <Link
              href="/"
              className="font-bold text-2xl tracking-tighter text-foreground hover:text-primary transition-colors"
            >
              {appName}
            </Link>
          </div>

          <div className="justify-self-end">{/* Empty for now */}</div>
        </div>
      </div>
    </header>
  );
};

export default PortfolioHeader;
