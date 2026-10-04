'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Menu,
  PencilRuler,
  Eye,
  Settings,
  LogOut,
  Check,
  Home,
  Globe,
  ArrowLeft,
} from 'lucide-react';
import { useEditMode } from '@/providers/EditModeContext';
import { useState, useEffect, useRef, useCallback, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabase } from '@/supabase';
import { signOut } from '@/supabase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/providers/I18nContext';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { isEditMode, setIsEditMode, toggleEditMode } = useEditMode();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hash, setHash] = useState('');
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage, languages } = useLanguage();
  // --- Back button -------------------------------------------------------
  // Counts in-app navigations so we can use real history when it exists and
  // fall back to the parent route when the page was opened directly.
  const navCountRef = useRef(0);
  const lastPathRef = useRef(pathname);
  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      navCountRef.current += 1;
      lastPathRef.current = pathname;
    }
  }, [pathname]);

  const parentPath = (() => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.length <= 1 ? '/' : '/' + parts.slice(0, -1).join('/');
  })();
  const showBack = pathname !== '/';

  const handleBack = useCallback(() => {
    if (navCountRef.current > 0) router.back();
    else router.push(parentPath);
  }, [router, parentPath]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [pathname]);

  const mainLinks = [{ href: '/', label: t('common.home'), icon: Home }];

  const isLinkActive = (href: string) => pathname === '/' && hash !== '#tools';

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (pathname !== '/' || href !== '/') return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.replaceState(null, '', '/');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    setHash('');
    setIsOpen(false);
  };

  const { user, isUserLoading, auth } = useSupabase();

  useEffect(() => {
    if (!user) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyE') {
        e.preventDefault();
        toggleEditMode();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [user, toggleEditMode]);

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
        setIsEditMode(false);
        toast({ title: 'Амжилттай гарлаа.' });
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: 'Гарахад алдаа гарлаа.', variant: 'destructive' });
    }
  };


  return (
    <header className="sticky top-0 left-0 w-full z-50 pt-[env(safe-area-inset-top,0px)]">
      <div className="relative">
        <div
          className={cn(
            'grid grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8 h-16 md:h-20 border-b transition-colors duration-300',
            isScrolled
              ? 'bg-[#f3f1ee]/95 border-[#111]/15'
              : 'bg-transparent border-transparent'
          )}
        >
          <div className="flex justify-self-start items-center gap-1 sm:gap-2">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                onMouseEnter={() => router.prefetch(parentPath)}
                aria-label={t('common.back', { defaultValue: 'Буцах' })}
                title={t('common.back', { defaultValue: 'Буцах' })}
                className="group shrink-0 rounded-xl animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              </Button>
            )}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <SheetHeader>
                  <SheetTitle>
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className="flex items-center space-x-2 text-left pl-4"
                      >
                        <span className="brand-mark text-xl">進撃の巨人</span>
                      </Link>
                    </SheetClose>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-2 mt-6 pl-4">
                  {mainLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={event => handleNavClick(event, link.href)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-lg transition-colors hover:text-primary',
                        isLinkActive(link.href)
                          ? 'bg-muted text-primary font-semibold'
                          : 'text-muted-foreground'
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <nav className="hidden md:flex items-center gap-1">
              {mainLinks.map(link => {
                const isActive = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={event => handleNavClick(event, link.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'relative px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200',
                      isActive
                        ? 'text-[#111]'
                        : 'text-[#111]/50 hover:text-[#111]'
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-px bg-primary" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="justify-self-center min-w-0 px-2">
            <Link
              href="/"
              className="brand-mark block text-base text-[#111] hover:text-[#c41212] sm:text-lg md:text-xl"
            >
              進撃の巨人
            </Link>
          </div>

          <div className="justify-self-end">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('relative', isEditMode && 'badge-pulse')}
                >
                  <SplitChoiceIcon
                    className={cn(
                      'h-5 w-5 transition-colors duration-200',
                      isEditMode && 'text-primary'
                    )}
                  />
                  <span className="sr-only">{t('common.settings')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px]">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Globe className="h-4 w-4" />
                    Хэл солих
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="min-w-[180px]">
                    {languages.map(lang => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={cn(
                          'flex items-center gap-3',
                          language === lang.code && 'bg-primary/15'
                        )}
                      >
                        <span
                          className="text-xl leading-none font-emoji"
                          style={{
                            fontFamily:
                              '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                          }}
                        >
                          {lang.flag}
                        </span>
                        <span className="flex-1">{lang.name}</span>
                        {language === lang.code && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {user && !isUserLoading && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Settings className="h-4 w-4" />
                      Тохиргоо
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[200px]">
                      <DropdownMenuItem onClick={() => setIsEditMode(!isEditMode)}>
                        {isEditMode ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <PencilRuler className="h-4 w-4" />
                        )}
                        <span className="flex-1">
                          {isEditMode ? t('common.view') : t('common.edit')}
                        </span>
                        <kbd className="rounded border border-border/60 px-1.5 text-[10px] font-mono text-muted-foreground">
                          Alt+E
                        </kbd>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        <span>{t('common.logout')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

function SplitChoiceIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M4 8h16" />
      <path d="M4 16h16" />
      <path d="M7.5 4.5 16.5 19.5" />
      <path d="M16.5 4.5 7.5 19.5" />
    </svg>
  );
}

export default Header;
