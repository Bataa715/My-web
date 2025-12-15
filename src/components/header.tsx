'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from './ui/sheet';
import { Menu, PencilRuler, Eye, Image as ImageIcon, Save, Loader2, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useEditMode } from '@/contexts/EditModeContext';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { signOut } from 'firebase/auth';

const mainLinks = [
  { href: "/", label: "Нүүр" },
  { href: "/about", label: "Миний тухай" },
  { href: "/tools", label: "Хэрэгсэл" },
];

const Header = () => {
    const { isEditMode, setIsEditMode } = useEditMode();
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    
    const { user, isUserLoading, auth, firestore } = useFirebase();

    useEffect(() => {
        setMounted(true);
        setIsEditMode(!!user);
    }, [user, setIsEditMode]);
    
    const isAboutPage = pathname === '/about';
    const isHomePage = pathname === '/';
    const isToolsPage = pathname === '/tools';
    const canShowEditButton = isAboutPage || isHomePage || isToolsPage;

    const [isImageEditingOpen, setIsImageEditingOpen] = useState(false);
    const [editedImageUrl, setEditedImageUrl] = useState('');
    const [saving, setSaving] = useState(false);
     
    const getImageFieldForPage = (): keyof UserProfile | null => {
        if (isHomePage) return 'homeHeroImage';
        if (isAboutPage) return 'aboutHeroImage';
        if (isToolsPage) return 'toolsHeroImage';
        return null;
    }

     useEffect(() => {
        if (!user || !firestore || !isImageEditingOpen) return;

        const fetchCurrentImage = async () => {
            const imageField = getImageFieldForPage();
            if (!imageField) return;

            const userDocRef = doc(firestore, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as UserProfile;
                setEditedImageUrl(data[imageField] as string || '');
            }
        };
        fetchCurrentImage();
    }, [user, firestore, isImageEditingOpen, pathname]);

    const handleLogout = async () => {
      try {
        await signOut(auth);
        toast({ title: "Амжилттай гарлаа." });
        router.push('/');
      } catch (error) {
        console.error("Logout error:", error);
        toast({ title: "Гарахад алдаа гарлаа.", variant: 'destructive' });
      }
    };

    const handleSaveImage = async () => {
        if (!user || !firestore) {
             toast({ title: "Алдаа", description: "Нэвтэрч орно уу.", variant: "destructive" });
             return;
        }

        const imageField = getImageFieldForPage();
        if (!imageField) {
            toast({ title: "Алдаа", description: "Энэ хуудсанд зураг засах боломжгүй.", variant: "destructive" });
            return;
        }
        
        setSaving(true);
        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, { [imageField]: editedImageUrl });
            
            setSaving(false);
            setIsImageEditingOpen(false);
            toast({
                title: 'Амжилттай',
                description: 'Арын зураг шинэчлэгдлээ.',
            });
             // Force a reload to see the change on the page
             window.location.reload();
        } catch (error) {
            console.error("Error saving hero image:", error);
            setSaving(false);
            toast({
                title: 'Алдаа',
                description: 'Арын зураг хадгалахад алдаа гарлаа.',
                variant: 'destructive',
            });
        }
    };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                <span className="hidden font-bold sm:inline-block font-headline">
                Ka1_zen
                </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
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
        <div className="flex-1 pl-4 md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <SheetHeader>
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
              <Link href="/" className="mr-6 flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                <span className="font-bold font-headline">Ka1_zen</span>
              </Link>
              <nav className="flex flex-col space-y-4 mt-6">
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

        <div className="flex flex-1 items-center justify-end gap-2">
          {mounted && (
            <>
              {isEditMode && canShowEditButton && (
                <Dialog open={isImageEditingOpen} onOpenChange={setIsImageEditingOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <ImageIcon className="h-4 w-4" />
                      <span className="sr-only">Арын зураг солих</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Арын зургийн холбоос</DialogTitle>
                      <DialogDescription>
                        Шинэ зургийнхаа URL хаягийг энд буулгана уу.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image-url" className="text-right">
                          URL
                        </Label>
                        <Input
                          id="image-url"
                          value={editedImageUrl}
                          onChange={(e) => setEditedImageUrl(e.target.value)}
                          className="col-span-3"
                          placeholder="https://example.com/image.png"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">Цуцлах</Button>
                      </DialogClose>
                      <Button type="button" onClick={handleSaveImage} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Хадгалах
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

            {!isUserLoading && (
                user ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium hidden sm:inline">{user.displayName || user.email}</span>
                        <Button onClick={handleLogout} variant="ghost" size="icon">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                ) : (
                    <div className='flex gap-2'>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/login">Нэвтрэх</Link>
                        </Button>
                         <Button asChild size="sm">
                            <Link href="/signup">Бүртгүүлэх</Link>
                        </Button>
                    </div>
                )
            )}
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
