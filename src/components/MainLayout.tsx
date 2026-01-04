"use client";

import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useFirebase } from '@/firebase';
import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading, firestore } = useFirebase();
  const [heroImage, setHeroImage] = useState<string | undefined>(undefined);

  const isPublicPath = useMemo(() => {
    return pathname === '/login' || pathname === '/signup';
  }, [pathname]);

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    
    if (!user && !isPublicPath) {
      router.push('/login');
      return;
    }

    if (user && isPublicPath) {
      router.push('/');
      return;
    }
  }, [isUserLoading, user, isPublicPath, router]);

  useEffect(() => {
    if (isUserLoading || !firestore) return;

    const fetchHeroImage = async () => {
      let imageUrl;
      let placeholderId = 'home-hero-background';
      let userImageProp: keyof UserProfile | undefined = 'homeHeroImage';

      if (pathname === '/about') {
        placeholderId = 'about-hero-background';
        userImageProp = 'aboutHeroImage';
      } else if (pathname === '/tools') {
        placeholderId = 'tools-hero-background';
        userImageProp = 'toolsHeroImage';
      } else if (pathname !== '/') {
        userImageProp = undefined; // No specific background for other pages
      }
      
      if (user && userImageProp) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            imageUrl = data[userImageProp];
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
        setHeroImage(imageUrl);
      } else {
        setHeroImage(undefined);
      }
    };

    fetchHeroImage();
  }, [user, isUserLoading, firestore, pathname]);


  if (isUserLoading && !isPublicPath) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !isPublicPath) {
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
    <div className="min-h-screen p-3 md:p-4 lg:p-6 bg-neutral-950">
      {/* Animated border wrapper */}
      <div className="animated-border-wrapper">
        <div className="relative z-10 flex min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)] flex-col rounded-3xl bg-background overflow-hidden shadow-2xl shadow-primary/5">
          
          {heroImage && (
            <div className="absolute top-0 left-0 w-full h-[50vh] -z-10">
              <Image
                src={heroImage}
                alt="Background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>
          )}

          {/* Background pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }}
            />
            {/* Gradient orbs */}
            <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute top-1/3 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
          </div>
          
          {/* Header - z-10 so it's above background but background shows through */}
          <div className="relative z-10">
            <Header />
          </div>
          <main className="relative z-10 flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
