'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Wrench } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
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
            if (data.homeHeroImage) {
              imageUrl = data.homeHeroImage;
            }
          }
        } catch (error) {
            console.error("Error fetching user's hero image:", error);
        }
      }
      
      if (!imageUrl) {
        const placeholder = PlaceHolderImages.find(p => p.id === 'home-hero-background');
        imageUrl = placeholder?.imageUrl;
      }

      setHeroImage(imageUrl);
    };

    fetchHeroImage();
  }, [user, firestore, isUserLoading]);


  return (
    <div className="relative flex flex-col items-center justify-center text-center h-[calc(100vh-57px-81px)] -m-4 sm:-m-6 lg:-m-8">
       {heroImage ? (
          <Image
            src={heroImage}
            alt="Welcome background"
            fill
            className="object-cover"
            data-ai-hint="welcome abstract"
          />
       ) : (
         <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
       )}
       <div className="absolute inset-0 bg-black/30"></div>
       <div className="relative z-20 flex flex-col items-center justify-center space-y-6 px-4">
          <p className="max-w-[700px] text-gray-200 md:text-xl">
           Энэ бол тасралтгүй хөгжил, суралцах үйл явцыг минь харуулсан хувийн орон зай юм.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/about">
                Миний тухай <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className='bg-background/20 border-white text-white hover:bg-white hover:text-black'>
              <Link href="/tools">
                <Wrench className="mr-2 h-5 w-5" /> Хэрэгслүүд
              </Link>
            </Button>
          </div>
        </div>
    </div>
  );
}
