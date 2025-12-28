
'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from './ui/sheet';
import { Menu, PencilRuler, Eye, Settings, LogOut, Palette, Check, Home, User, Wrench } from 'lucide-react';
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
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { useTheme } from 'next-themes';
import { themes } from '@/lib/themes';


const mainLinks = [
  { href: "/", label: "Нүүр", icon: Home },
  { href: "/about", label: "Тухай", icon: User },
  { href: "/tools", label: "Хэрэгсэл", icon: Wrench },
];


const Header = () => {
    const { isEditMode, setIsEditMode } = useEditMode();
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const pathname = usePathname();
    const router = useRouter();
    
    const { user, isUserLoading, auth, firestore } = useFirebase();
    const [appName, setAppName] = useState("");
    
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const fetchAppName = async () => {
            if (user && firestore) {
                const userDocRef = doc(firestore, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as UserProfile;
                     setAppName(data.appName || "Kaizen");
                }
            } else if (!isUserLoading) {
                 setAppName("Kaizen");
            }
        };
        fetchAppName();
    }, [user, firestore, isUserLoading]);
    
    const handleLogout = async () => {
      try {
        if (auth) {
            await signOut(auth);
            setIsEditMode(false);
            toast({ title: "Амжилттай гарлаа." });
            router.push('/login');
        }
      } catch (error) {
        console.error("Logout error:", error);
        toast({ title: "Гарахад алдаа гарлаа.", variant: 'destructive' });
      }
    };
    
    const handleThemeChange = (newTheme: string) => {
      setTheme(newTheme);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    };

    return (
      <>
        {/* Mobile Menu Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-[60] md:hidden bg-background/50 backdrop-blur-sm">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
                <SheetHeader>
                    <SheetTitle>
                        <SheetClose asChild>
                            <Link href="/" className="flex items-center space-x-2 text-left pl-4">
                                <span className="font-bold text-2xl">{appName}</span>
                            </Link>
                        </SheetClose>
                    </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-2 mt-6 pl-4">
                    {mainLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-lg transition-colors hover:text-primary",
                            (pathname.startsWith(link.href) && link.href !== '/') || pathname === link.href ? "bg-muted text-primary font-semibold" : "text-muted-foreground"
                        )}
                    >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                    </Link>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
        
        {/* Settings Dropdown */}
        {user && !isUserLoading && (
            <div className="fixed top-4 left-4 z-[60] hidden md:block">
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-background/50 backdrop-blur-sm">
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Тохиргоо</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                     <DropdownMenuItem onClick={() => setIsEditMode(!isEditMode)}>
                        {isEditMode ? <Eye className="mr-2 h-4 w-4" /> : <PencilRuler className="mr-2 h-4 w-4" />}
                        <span>{isEditMode ? "Харах" : "Засварлах"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Palette className="mr-2 h-4 w-4" />
                        <span>Theme</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {themes.map((themeOption) => (
                           <DropdownMenuItem key={themeOption.name} onClick={() => handleThemeChange(themeOption.name)}>
                             <span className="mr-2 h-4 w-4 rounded-full" style={{ backgroundColor: `hsl(${themeOption.primary})` }} />
                            <span>{themeOption.name.charAt(0).toUpperCase() + themeOption.name.slice(1)}</span>
                            {theme === themeOption.name && <Check className="ml-auto h-4 w-4" />}
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
            </div>
        )}

        {/* Desktop Centered Navigation */}
        <header className="header-list hidden md:block">
            <nav>
                <ul className="ul-list">
                    {mainLinks.map(link => {
                        const isActive = (pathname.startsWith(link.href) && link.href !== '/') || pathname === link.href;
                        return (
                             <li key={link.href} className={cn(isActive && 'active')}>
                                <Link href={link.href} className="flex items-center gap-2">
                                    <link.icon className="h-4 w-4"/>
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </header>
      </>
    );
};

export default Header;
