
'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from './ui/sheet';
import { Menu, PencilRuler, Eye, Save, Loader2, LogOut, Link2, XCircle, Pencil } from 'lucide-react';
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
import { useFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { signOut, EmailAuthProvider, linkWithCredential } from 'firebase/auth';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';


const mainLinks = [
  { href: "/home", label: "Нүүр" },
  { href: "/about", label: "Миний тухай" },
  { href: "/tools", label: "Хэрэгсэл" },
];

const linkAccountSchema = z.object({
  email: z.string().email({ message: 'И-мэйл хаяг буруу байна.' }),
  password: z.string().min(6, { message: 'Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.' }),
});


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
    

    const [isLinkAccountOpen, setIsLinkAccountOpen] = useState(false);
     

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
    
    const form = useForm<z.infer<typeof linkAccountSchema>>({
        resolver: zodResolver(linkAccountSchema),
        defaultValues: {
          email: '',
          password: '',
        },
    });

    const onLinkAccountSubmit = async (values: z.infer<typeof linkAccountSchema>) => {
        if (!user || !user.isAnonymous || !firestore) {
            toast({ title: "Алдаа", description: "Зөвхөн нэр-усгүй хэрэглэгч бүртгэлээ холбох боломжтой.", variant: "destructive" });
            return;
        }
        
        setSaving(true);
        try {
            const credential = EmailAuthProvider.credential(values.email, values.password);
            await linkWithCredential(user, credential);

            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, { email: values.email });
            
            toast({ title: 'Амжилттай холбогдлоо!', description: 'Таны түр бүртгэл байнгын боллоо.' });
            setIsLinkAccountOpen(false);
            router.refresh(); 
        } catch (error: any) {
            console.error("Account linking error:", error);
             let description = "Бүртгэл холбоход алдаа гарлаа.";
             if (error.code === 'auth/email-already-in-use') {
                description = 'Энэ и-мэйл хаяг бүртгэлтэй байна. Өөр и-мэйл ашиглана уу.';
            } else if (error.code === 'auth/credential-already-in-use') {
                description = 'Энэ и-мэйл хаяг өөр бүртгэлд ашиглагдаж байна.';
            }
            toast({
                title: 'Алдаа',
                description: description,
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
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
                                  <span className="font-bold font-headline">{appName}</span>
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
                        <span className="font-bold sm:inline-block font-headline">
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
                <Button variant="outline" size="icon" onClick={() => setIsEditMode(!isEditMode)} className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                    {isEditMode ? <Eye className="h-4 w-4" /> : <PencilRuler className="h-4 w-4" />}
                    <span className="sr-only">{isEditMode ? "Харах горим" : "Засварлах горим"}</span>
                </Button>
              )}

              {!isUserLoading && (
                  user ? (
                      <div className="flex items-center gap-2">
                          {user.isAnonymous ? (
                              <Dialog open={isLinkAccountOpen} onOpenChange={setIsLinkAccountOpen}>
                                  <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                          <Link2 className="mr-2 h-4 w-4" />
                                          Бүртгэлээ холбох
                                      </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                      <DialogHeader>
                                          <DialogTitle>Бүртгэлээ байнгын болгох</DialogTitle>
                                          <DialogDescription>
                                              Таны мэдээллийг хадгалахын тулд түр бүртгэлээ и-мэйл, нууц үгээр баталгаажуулна уу.
                                          </DialogDescription>
                                      </DialogHeader>
                                      <Form {...form}>
                                          <form onSubmit={form.handleSubmit(onLinkAccountSubmit)} className="space-y-4">
                                              <FormField
                                                  control={form.control}
                                                  name="email"
                                                  render={({ field }) => (
                                                  <FormItem>
                                                      <FormLabel>И-мэйл</FormLabel>
                                                      <FormControl>
                                                      <Input placeholder="name@example.com" {...field} />
                                                      </FormControl>
                                                      <FormMessage />
                                                  </FormItem>
                                                  )}
                                              />
                                              <FormField
                                                  control={form.control}
                                                  name="password"
                                                  render={({ field }) => (
                                                  <FormItem>
                                                      <FormLabel>Нууц үг</FormLabel>
                                                      <FormControl>
                                                      <Input type="password" placeholder="••••••••" {...field} />
                                                      </FormControl>
                                                      <FormMessage />
                                                  </FormItem>
                                                  )}
                                              />
                                              <DialogFooter>
                                                  <DialogClose asChild>
                                                      <Button type="button" variant="secondary">Цуцлах</Button>
                                                  </DialogClose>
                                                  <Button type="submit" disabled={saving}>
                                                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Link2 className="mr-2 h-4 w-4" />} Холбох
                                                  </Button>
                                              </DialogFooter>
                                          </form>
                                      </Form>
                                  </DialogContent>
                              </Dialog>
                          ) : null}

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
            <ThemeToggle />
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
                      <div className="h-10 w-10"></div>
                  </div>
              </div>
          </header>
      )
  }

  return headerContent;
};

export default Header;
