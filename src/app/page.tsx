'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Wrench } from 'lucide-react';

export default function Home() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [heroImage, setHeroImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isUserLoading) return;

    const fetchHeroImage = async () => {
      if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          if(data.heroImage) {
            setHeroImage(data.heroImage);
            return;
          }
        }
      }
      // Fallback to placeholder if not logged in, no doc, or no heroImage field
      setHeroImage("https://images.unsplash.com/photo-1581533676255-4f26a768fc4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxhYnN0cmFjdCUyMGxpYnJhcnl8ZW58MHx8fHwxNzY1NjMyNDk3fDA&ixlib=rb-4.1.0&q=80&w=1080");
    };

    fetchHeroImage();
  }, [user, firestore, isUserLoading]);

  return (
    <div className="relative flex flex-col items-center justify-center text-center h-[calc(100vh-57px-81px)] -m-4 sm:-m-6 lg:-m-8">
      {heroImage && (
        <>
          <Image
            src={heroImage}
            alt="Abstract learning background"
            fill
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
            data-ai-hint="abstract library"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10"></div>
        </>
      )}
       <div className="relative z-20 flex flex-col items-center justify-center space-y-6 px-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
            Тавтай морилно уу
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
           Энэ бол тасралтгүй хөгжил, суралцах үйл явцыг минь харуулсан хувийн орон зай юм.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/about">
                Миний тухай <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/tools">
                <Wrench className="mr-2 h-5 w-5" /> Хэрэгслүүд
              </Link>
            </Button>
          </div>
        </div>
    </div>
  );
}
