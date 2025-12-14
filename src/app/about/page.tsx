'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import BackButton from '@/components/shared/BackButton';
import Hero from '@/components/sections/hero';
import Projects from '@/components/sections/projects';
import Skills from '@/components/sections/skills';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [heroImage, setHeroImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isUserLoading) return;

    const fetchHeroImage = async () => {
      let imageUrl;
      if (user && firestore) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (data.heroImage) {
              imageUrl = data.heroImage;
            }
          }
        } catch (error) {
            console.error("Error fetching user's hero image:", error);
        }
      }
      
      if (!imageUrl) {
        const placeholder = PlaceHolderImages.find(p => p.id === 'hero-background');
        imageUrl = placeholder?.imageUrl || "https://images.unsplash.com/photo-1581533676255-4f26a768fc4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxhYnN0cmFjdCUyMGxpYnJhcnl8ZW58MHx8fHwxNzY1NjMyNDk3fDA&ixlib=rb-4.1.0&q=80&w=1080";
      }

      setHeroImage(imageUrl);
    };

    fetchHeroImage();
  }, [user, firestore, isUserLoading]);

  return (
    <>
       {heroImage && (
        <div className="absolute top-0 left-0 w-full h-[50vh] -z-10">
          <Image
            src={heroImage}
            alt="Abstract background"
            fill
            className="object-cover"
            data-ai-hint="abstract library"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>
      )}
      <BackButton />
      <Hero />
      <Projects />
      <Skills />
    </>
  );
}
