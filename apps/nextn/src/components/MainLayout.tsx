'use client';

import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useFirebase } from '@/firebase';
import { useEffect, useMemo, useState } from 'react';
import { Home, User, Wrench } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import IntroOverlay from './IntroOverlay';

const FloatingNav = () => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, 'change', current => {
    if (typeof current === 'number') {
      let direction = current! - scrollYProgress.getPrevious()!;
      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  const pathname = usePathname();
  const navItems = [
    {
      name: 'Нүүр',
      link: '/',
      icon: <Home className="h-5 w-5" />,
      active: pathname === '/',
    },
    {
      name: 'Тухай',
      link: '/about',
      icon: <User className="h-5 w-5" />,
      active: pathname === '/about',
    },
    {
      name: 'Хэрэгсэл',
      link: '/tools',
      icon: <Wrench className="h-5 w-5" />,
      active: pathname.startsWith('/tools'),
    },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: 100,
        }}
        animate={{
          y: visible ? 0 : 100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] inset-x-0 max-w-xs mx-auto z-50 flex items-center justify-center"
      >
        <nav
          aria-label="Үндсэн навигац"
          className="flex items-center justify-center p-1.5 rounded-full border border-border/60 bg-background/70 backdrop-blur-xl shadow-2xl shadow-primary/10"
        >
          <TooltipProvider>
            {navItems.map(navItem => (
              <Tooltip key={navItem.link}>
                <TooltipTrigger asChild>
                  <Link
                    href={navItem.link}
                    aria-label={navItem.name}
                    aria-current={navItem.active ? 'page' : undefined}
                    className={cn(
                      'relative flex items-center justify-center w-11 h-11 rounded-full text-sm font-medium transition-colors duration-300',
                      navItem.active
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {navItem.active && (
                      <motion.span
                        className="absolute inset-0 z-0 bg-primary rounded-full shadow-lg shadow-primary/40"
                        layoutId="active-nav-item"
                        transition={{
                          type: 'spring',
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{navItem.icon}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{navItem.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </motion.div>
    </AnimatePresence>
  );
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useFirebase();

  const isPublicPath = useMemo(() => {
    return (
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname.startsWith('/portfolio')
    );
  }, [pathname]);

  // Hard-cap auth wait at 2.5s. If Firebase hasn't responded by then,
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

  /* The page shell is fully transparent — the fixed CosmosBackground canvas
     (z −10) provides the backdrop. Content floats above it in glass layers. */
  return (
    <>
      <IntroOverlay />
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
        <main className="relative z-10 pb-28 sm:pb-4">
          <AnimatePresence mode="wait" initial={false}>
            {children}
          </AnimatePresence>
        </main>
        <Footer />
        <FloatingNav />
      </div>
    </>
  );
}
