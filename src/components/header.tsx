'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from './ui/sheet';
import {
  Menu,
  PencilRuler,
  Eye,
  Settings,
  LogOut,
  Palette,
  Check,
  Home,
  User,
  Wrench,
  QrCode,
  Copy,
} from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { themes } from '@/lib/themes';
import { Input } from './ui/input';

const mainLinks = [
  { href: '/', label: 'Нүүр', icon: Home },
  { href: '/about', label: 'Тухай', icon: User },
  { href: '/tools', label: 'Хэрэгсэл', icon: Wrench },
];

const Header = () => {
  const { isEditMode, setIsEditMode } = useEditMode();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const { user, isUserLoading, auth, firestore } = useFirebase();
  const [appName, setAppName] = useState('');

  const { theme, setTheme } = useTheme();

  const portfolioUrl =
    typeof window !== 'undefined' && user
      ? `${window.location.origin}/portfolio/${user.uid}`
      : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(portfolioUrl);
    toast({ title: 'Хуулагдлаа', description: 'Портфолио холбоосыг хууллаа.' });
  };

  useEffect(() => {
    const fetchAppName = async () => {
      if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setAppName(data.name || 'Batmyagmar');
        }
      } else if (!isUserLoading) {
        setAppName('Batmyagmar');
      }
    };
    fetchAppName();
  }, [user, firestore, isUserLoading]);

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

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 left-0 w-full z-50">
      <div className="relative">
        <div className="mx-3 md:mx-4 mt-3 md:mt-4 grid grid-cols-[1fr_auto_1fr] items-center p-2 px-4 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10">
          <div className="flex justify-self-start items-center gap-2">
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
                        <span className="font-bold text-2xl">{appName}</span>
                      </Link>
                    </SheetClose>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-2 mt-6 pl-4">
                  {mainLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-lg transition-colors hover:text-primary',
                        (pathname.startsWith(link.href) && link.href !== '/') ||
                          pathname === link.href
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

            <nav className="hidden md:flex items-center gap-4">
              {mainLinks.map(link => {
                const isActive =
                  (pathname.startsWith(link.href) && link.href !== '/') ||
                  pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="justify-self-center">
            <Link
              href="/"
              className="font-bold text-2xl tracking-tighter text-foreground hover:text-primary transition-colors"
            >
              {appName}
            </Link>
          </div>

          <div className="justify-self-end flex items-center">
            {user && !isUserLoading && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Тохиргоо</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditMode(!isEditMode)}>
                    {isEditMode ? (
                      <Eye className="mr-2 h-4 w-4" />
                    ) : (
                      <PencilRuler className="mr-2 h-4 w-4" />
                    )}
                    <span>{isEditMode ? 'Харах' : 'Засварлах'}</span>
                  </DropdownMenuItem>
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={e => e.preventDefault()}>
                        <QrCode className="mr-2 h-4 w-4" />
                        <span>Портфолио QR</span>
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Портфолиогоо хуваалцах</DialogTitle>
                        <DialogDescription>
                          Энэхүү QR кодыг уншуулж эсвэл холбоосыг хуулж бусадтай
                          хуваалцаарай.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center space-y-4 p-4">
                        <div className="p-2 bg-white rounded-lg">
                          <Image
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${portfolioUrl}`}
                            alt="Portfolio QR Code"
                            width={200}
                            height={200}
                          />
                        </div>
                        <div className="flex w-full items-center space-x-2">
                          <Input
                            id="portfolio-link"
                            value={portfolioUrl}
                            readOnly
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={copyToClipboard}
                          >
                            <span className="sr-only">Хуулах</span>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Palette className="mr-2 h-4 w-4" />
                      <span>Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {themes.map(themeOption => (
                        <DropdownMenuItem
                          key={themeOption.name}
                          onClick={() => handleThemeChange(themeOption.name)}
                        >
                          <span
                            className="mr-2 h-4 w-4 rounded-full"
                            style={{
                              backgroundColor: `hsl(${themeOption.primary})`,
                            }}
                          />
                          <span>
                            {themeOption.name.charAt(0).toUpperCase() +
                              themeOption.name.slice(1)}
                          </span>
                          {theme === themeOption.name && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Гарах</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
