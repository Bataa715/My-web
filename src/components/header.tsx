'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from './ui/sheet';
import { Menu, PencilRuler, Eye, LockKeyhole, Image as ImageIcon, Save, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useEditMode } from '@/contexts/EditModeContext';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { mainLinks } from '@/lib/site-navigation';


const CORRECT_PASSWORD = "Bataa2480";

const Header = () => {
    const { isEditMode, setIsEditMode } = useEditMode();
    const [isOpen, setIsOpen] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const { toast } = useToast();
    const pathname = usePathname();
    const isAboutPage = pathname === '/about';
    const isHomePage = pathname === '/';
    const { firestore, user } = useFirebase();

    const [isImageEditingOpen, setIsImageEditingOpen] = useState(false);
    const [editedImageUrl, setEditedImageUrl] = useState('');
    const [saving, setSaving] = useState(false);

     useEffect(() => {
        if (!user || !firestore || !isImageEditingOpen) return;

        const fetchCurrentImage = async () => {
            const userDocRef = doc(firestore, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as UserProfile;
                setEditedImageUrl(data.heroImage || '');
            }
        };
        fetchCurrentImage();
    }, [user, firestore, isImageEditingOpen]);


    const handleEditClick = () => {
      if (isEditMode) {
        setIsEditMode(false);
      } else {
        setIsPasswordDialogOpen(true);
      }
    };
  
    const handlePasswordSubmit = () => {
      if (password === CORRECT_PASSWORD) {
        setIsEditMode(true);
        setIsPasswordDialogOpen(false);
        setPassword("");
        setPasswordError("");
        toast({
          title: "Амжилттай",
          description: "Засварлах горимд шилжлээ.",
        });
      } else {
        setPasswordError("Нууц үг буруу байна.");
      }
    };

    const handleSaveImage = async () => {
        if (!user || !firestore) {
             toast({ title: "Алдаа", description: "Нэвтэрч орно уу.", variant: "destructive" });
             return;
        }
        setSaving(true);
        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, { heroImage: editedImageUrl });
            
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
        <div className="flex-1 md:hidden">
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
             {isEditMode && isHomePage && (
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
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />} Хадгалах
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {(isAboutPage || isHomePage) && <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    setPassword("");
                    setPasswordError("");
                }
                setIsPasswordDialogOpen(open);
            }}>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleEditClick}
                    className={cn(
                    "transition-all",
                    isEditMode && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                >
                    {isEditMode ? (
                    <Eye className="h-4 w-4" />
                    ) : (
                    <PencilRuler className="h-4 w-4" />
                    )}
                    <span className="sr-only">{isEditMode ? "Харах" : "Засварлах"}</span>
                </Button>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Засварлах горим</DialogTitle>
                    <DialogDescription>
                    Үргэлжлүүлэхийн тулд нууц үгээ оруулна уу.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                        Нууц үг
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="col-span-3"
                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    />
                    </div>
                    {passwordError && (
                        <p className="col-span-4 text-center text-sm text-destructive">{passwordError}</p>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Цуцлах</Button>
                    </DialogClose>
                    <Button type="button" onClick={handlePasswordSubmit}>
                    <LockKeyhole className="mr-2 h-4 w-4" /> Нэвтрэх
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>}
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;

    