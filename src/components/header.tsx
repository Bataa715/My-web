
'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from './ui/sheet';
import { Menu, PencilRuler, Eye, Save, Loader2, LogOut, XCircle, Pencil, Settings, Sun, Moon } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const mainLinks = [
  { href: "/home", label: "Нүүр" },
  { href: "/about", label: "Миний тухай" },
  { href: "/tools", label: "Хэрэгсэл" },
];


const Header = () => {
    const { isEditMode, setIsEditMode } = useEditMode();
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const pathname = usePathname();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    
    const { user, isUserLoading, auth, firestore } = useFirebase();
    const [appName, setAppName] = useState("Kaizen");
    const [isEditingAppName, setIsEditingAppName] = useState(false);
    const [editedAppName, setEditedAppName] = useState(appName);
    
    const [mounted, setMounted] = useState(false);
    const { setTheme } = useEditMode().isEditMode ? { setTheme: () => {} } : require("next-themes");

    useEffect(() => {
        setMounted(true);
    }, []);


    useEffect(() => {
        const fetchAppName = async () => {
            if (user && firestore) {
                const userDocRef = doc(firestore, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as UserProfile;
                    if (data.appName) {
                        setAppName(data.appName);
                        setEditedAppName(data.appName);
                    }
                }
            }
        };
        if(user) fetchAppName();
    }, [user, firestore]);
    
    const handleLogout = async () => {
      try {
        if (auth) {
            await signOut(auth);
            setIsEditMode(false);
            toast({ title: "Амжилттай гарлаа." });
            router.push('/');
        }
      } catch (error) {
        console.error("Logout error:", error);
        toast({ title: "Гарахад алдаа гарлаа.", variant: 'destructive' });
      }
    };
    
    const handleSaveAppName = async () => {
        if (!user || !firestore || !editedAppName.trim()) {
            toast({ title: "Алдаа", description: "Сайтын нэр хоосон байж болохгүй.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, { appName: editedAppName });
            setAppName(editedAppName);
            setIsEditingAppName(false);
            toast({ title: "Амжилттай", description: "Сайтын нэр шинэчлэгдлээ." });
        } catch (error) {
            console.error("Error updating app name:", error);
            toast({ title: "Алдаа", description: "Сайтын нэр шинэчлэхэд алдаа гарлаа.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };
    
    const headerContent = (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
           {/* Left Section */}
           <div className="flex items-center gap-6 md:flex-1 pl-4">
              {/* Mobile Menu */}
              <div className="flex md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="pr-0">
                    <SheetHeader>
                      <SheetTitle>
                          <SheetClose asChild>
                              <Link href="/home" className="flex items-center space-x-2 text-left pl-4">
                                  <span className="font-bold font-bartle text-2xl">{appName}</span>
                              </Link>
                          </SheetClose>
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col space-y-4 mt-6 pl-4">
                      {mainLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            (pathname.startsWith(link.href) && link.href !== '/') || pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-6 text-sm">
                  {mainLinks.map((link) => (
                     <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "transition-colors hover:text-primary",
                        (pathname.startsWith(link.href) && link.href !== '/') || pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
              </nav>
          </div>

           {/* Center Section (App Name) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
             <div onClick={() => router.push(user ? "/home" : "/")} className="flex items-center space-x-2 cursor-pointer">
                 {isEditingAppName ? (
                    <div className="flex items-center gap-2">
                        <Input
                            value={editedAppName}
                            onChange={(e) => setEditedAppName(e.target.value)}
                            className="font-bold h-8"
                        />
                        <Button onClick={handleSaveAppName} size="icon" className="h-8 w-8" disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}
                        </Button>
                        <Button onClick={() => { setIsEditingAppName(false); setEditedAppName(appName); }} size="icon" variant="ghost" className="h-8 w-8">
                            <XCircle className="h-4 w-4"/>
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="font-bold sm:inline-block font-bartle text-2xl">
                            {appName}
                        </span>
                        {isEditMode && (
                             <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => { e.stopPropagation(); setIsEditingAppName(true);}}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                        )}
                    </div>
                )}
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center justify-end gap-2 md:flex-1">
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
                        {isEditMode ? <Eye className="mr-2 h-4 w-4" /> : <PencilRuler className="mr-2 h-4 w-4" />}
                        <span>{isEditMode ? "Харах горим" : "Засварлах горим"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Цайвар</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Бараан</span>
                    </DropdownMenuItem>
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
      </header>
    );

    if (!mounted) {
      return (
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 max-w-screen-2xl items-center">
                  <div className="flex-1"></div>
                  <div className="flex items-center justify-end gap-2">
                      <div className="h-10 w-10"></div>
                  </div>
              </div>
          </header>
      )
  }

  return headerContent;
};

export default Header;
