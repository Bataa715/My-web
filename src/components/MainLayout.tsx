'use client';

import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useFirebase } from '@/firebase';
import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  ImageIcon,
  Save,
  Home,
  User,
  Wrench,
  Pencil,
  Edit,
} from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEditMode } from '@/contexts/EditModeContext';
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
import { ThemeProvider } from './theme-provider';
import { Toaster } from './ui/toaster';
import { EducationProvider } from '@/contexts/EducationContext';
import { ExperienceProvider } from '@/contexts/ExperienceContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { SkillsProvider } from '@/contexts/SkillsContext';
import { HobbyProvider } from '@/contexts/HobbyContext';
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
  const { isEditMode, setIsEditMode } = useEditMode();
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
        className="fixed bottom-10 inset-x-0 max-w-xs mx-auto z-50 flex items-center justify-center space-x-4"
      >
        <div className="flex items-center justify-center p-2 rounded-full border border-neutral-700 bg-neutral-900/80 backdrop-blur-md shadow-lg">
          <TooltipProvider>
            {navItems.map(navItem => (
              <Tooltip key={navItem.link}>
                <TooltipTrigger asChild>
                  <Link
                    href={navItem.link}
                    className={cn(
                      'relative flex items-center justify-center w-12 h-12 rounded-full text-sm font-medium transition-colors duration-300',
                      navItem.active
                        ? 'text-primary'
                        : 'text-neutral-400 hover:text-neutral-200'
                    )}
                  >
                    {navItem.active && (
                      <motion.span
                        className="absolute inset-0 z-0 bg-neutral-800 rounded-full"
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
        </div>
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
  const { user, isUserLoading, firestore } = useFirebase();
  const { isEditMode } = useEditMode();
  const { toast } = useToast();

  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isImageEditingOpen, setIsImageEditingOpen] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const isPublicPath = useMemo(() => {
    return (
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname.startsWith('/portfolio')
    );
  }, [pathname]);

  const userImageProp = useMemo((): keyof UserProfile | undefined => {
    if (pathname === '/tools') return 'toolsHeroImage';
    if (pathname === '/') return 'homeHeroImage';
    return undefined;
  }, [pathname]);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user && !isPublicPath) {
      router.push('/login');
      return;
    }

    if (user && (pathname === '/login' || pathname === '/signup')) {
      router.push('/');
      return;
    }
  }, [isUserLoading, user, isPublicPath, router, pathname]);

  useEffect(() => {
    if (isUserLoading || !firestore) return;

    const fetchHeroImage = async () => {
      let imageUrl: string | undefined;
      let placeholderId = 'home-hero-background';

      if (pathname === '/tools') {
        placeholderId = 'tools-hero-background';
      }

      if (user && userImageProp) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const candidate = data[userImageProp];
            if (typeof candidate === 'string') {
              imageUrl = candidate;
            }
          }
        } catch (error) {
          console.error("Error fetching user's hero image:", error);
        }
      }

      if (!imageUrl) {
        const placeholder = PlaceHolderImages.find(p => p.id === placeholderId);
        imageUrl = placeholder?.imageUrl;
      }

      if (userImageProp) {
        setHeroImage(imageUrl ?? null);
        setEditedImageUrl(imageUrl ?? '');
      } else {
        setHeroImage(null);
        setEditedImageUrl('');
      }
    };

    fetchHeroImage();
  }, [user, isUserLoading, firestore, pathname, userImageProp]);

  const handleSaveImage = async () => {
    if (!user || !firestore || !userImageProp) {
      toast({
        title: 'Алдаа',
        description: 'Нэвтэрч орно уу.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { [userImageProp]: editedImageUrl });

      setSaving(false);
      setIsImageEditingOpen(false);
      toast({
        title: 'Амжилттай',
        description: 'Арын зураг шинэчлэгдлээ.',
      });
      setHeroImage(editedImageUrl);
    } catch (error) {
      console.error('Error saving hero image:', error);
      setSaving(false);
      toast({
        title: 'Алдаа',
        description: 'Арын зураг хадгалахад алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  if ((isUserLoading || !user) && !isPublicPath) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isPublicPath) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="default"
      enableSystem={false}
      disableTransitionOnChange
    >
      <IntroOverlay />
      <EducationProvider>
        <ExperienceProvider>
          <ProjectProvider>
            <SkillsProvider>
              <HobbyProvider>
                <div className="min-h-screen p-3 md:p-4 lg:p-6 bg-neutral-950">
                  <div className="animated-border-wrapper">
                    <div className="relative z-10 flex min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)] flex-col rounded-[1.6rem] bg-background overflow-hidden shadow-2xl shadow-primary/5">
                      {heroImage && (
                        <div className="absolute top-0 left-0 w-full h-[50vh] -z-10">
                          <Image
                            src={heroImage}
                            alt="Background"
                            fill
                            className="object-cover"
                            priority
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                        </div>
                      )}

                      {isEditMode && userImageProp && (
                        <Dialog
                          open={isImageEditingOpen}
                          onOpenChange={setIsImageEditingOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="absolute top-28 right-4 z-50"
                            >
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
                                <Label
                                  htmlFor="image-url"
                                  className="text-right"
                                >
                                  URL
                                </Label>
                                <Input
                                  id="image-url"
                                  value={editedImageUrl}
                                  onChange={e =>
                                    setEditedImageUrl(e.target.value)
                                  }
                                  className="col-span-3"
                                  placeholder="https://example.com/image.png"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                  Цуцлах
                                </Button>
                              </DialogClose>
                              <Button
                                type="button"
                                onClick={handleSaveImage}
                                disabled={saving}
                              >
                                {saving ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="mr-2 h-4 w-4" />
                                )}{' '}
                                Хадгалах
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}

                      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
                        <div
                          className="absolute inset-0 opacity-[0.02]"
                          style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: '50px 50px',
                          }}
                        />
                      </div>

                      <div className="relative z-10">
                        <Header />
                      </div>
                      <main className="relative z-10 flex-1">
                        <AnimatePresence mode="wait" initial={false}>
                          {children}
                        </AnimatePresence>
                      </main>
                      <Footer />
                      <FloatingNav />
                    </div>
                  </div>
                </div>
                <Toaster />
              </HobbyProvider>
            </SkillsProvider>
          </ProjectProvider>
        </ExperienceProvider>
      </EducationProvider>
    </ThemeProvider>
  );
}
