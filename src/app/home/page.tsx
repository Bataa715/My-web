'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Wrench, Loader2, ServerCrash } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { doc, getDoc, writeBatch, collection, getDocs } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


const OLD_ANONYMOUS_UID = 'CcOeFzgZ4rSkYQuovkBFCIjZvc33';


function DataMigrationComponent() {
  const { user, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMigration = async () => {
    if (!firestore || !user) {
      toast({ title: 'Алдаа', description: 'Нэвтэрч орно уу.', variant: 'destructive' });
      return;
    }
    
    if (user.uid === OLD_ANONYMOUS_UID) {
        toast({ title: 'Анхаар', description: 'Та түр хэрэглэгчээр нэвтэрсэн байна. Шинэ, байнгын бүртгэлээрээ нэвтэрч орно уу.', variant: 'destructive' });
        return;
    }

    setIsMigrating(true);
    setError(null);

    try {
      const batch = writeBatch(firestore);
      
      // 1. Migrate UserProfile
      const oldUserDocRef = doc(firestore, 'users', OLD_ANONYMOUS_UID);
      const oldUserDocSnap = await getDoc(oldUserDocRef);

      if (!oldUserDocSnap.exists()) {
        throw new Error("Хуучин хэрэглэгчийн мэдээлэл олдсонгүй.");
      }
      
      const userProfileData = oldUserDocSnap.data() as UserProfile;
      const newUserDocRef = doc(firestore, 'users', user.uid);
      batch.set(newUserDocRef, userProfileData);

      // 2. Migrate sub-collections
      const subcollections = ['projects', 'skills', 'englishWords', 'japaneseWords', 'memorized', 'progress'];
      for (const subcollectionPath of subcollections) {
        const oldSubcollectionRef = collection(firestore, `users/${OLD_ANONYMOUS_UID}/${subcollectionPath}`);
        const newSubcollectionRef = collection(firestore, `users/${user.uid}/${subcollectionPath}`);
        const oldDocsSnapshot = await getDocs(oldSubcollectionRef);
        
        oldDocsSnapshot.forEach(oldDoc => {
          const newDocRef = doc(newSubcollectionRef, oldDoc.id);
          batch.set(newDocRef, oldDoc.data());
        });
      }

      await batch.commit();

      toast({
        title: 'Амжилттай!',
        description: 'Таны бүх мэдээлэл шинэ бүртгэл рүү шилжлээ.',
      });

      // Reload the page to reflect changes
      router.refresh();

    } catch (e: any) {
      console.error("Migration failed:", e);
      setError(`Мэдээлэл шилжүүлэхэд алдаа гарлаа: ${e.message}`);
      toast({
        title: 'Шилжүүлэлт амжилтгүй боллоо',
        description: e.message || 'Дахин оролдоно уу.',
        variant: 'destructive',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
      <div className="w-full mb-8 p-6 bg-muted rounded-lg border border-dashed text-center space-y-4">
          <h2 className="text-2xl font-bold">Data Migration</h2>
          <p className="max-w-md mx-auto text-muted-foreground">
              Таны хуучин, түр бүртгэл дээрх мэдээллийг одоогийн байнгын бүртгэл рүү шилжүүлэхэд бэлэн боллоо. 
              Товч дээр дарж үйлдлийг гүйцэтгэнэ үү.
          </p>
          <Button onClick={handleMigration} disabled={isMigrating} size="lg">
              {isMigrating ? (
                  <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Шилжүүлж байна...
                  </>
              ) : (
                  'Мэдээлэл Шилжүүлэх'
              )}
          </Button>
          {error && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-destructive">
                  <ServerCrash className="h-5 w-5" />
                  <p>{error}</p>
              </div>
          )}
      </div>
  )
}


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
    <div className="relative">
      <DataMigrationComponent />
      {heroImage && (
        <div className="absolute top-0 left-0 w-full h-[60vh] -z-10">
          <Image
            src={heroImage}
            alt="Welcome background"
            fill
            className="object-cover"
            data-ai-hint="welcome abstract"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>
      )}
      <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-57px-81px)]">
         <div className="relative z-20 flex flex-col items-center justify-center space-y-6 px-4">
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
             Энэ бол тасралтгүй хөгжил, суралцах үйл явцыг минь харуулсан хувийн орон зай юм.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/about">
                  Миний тухай <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/tools">
                  <Wrench className="mr-2 h-5 w-5" /> Хэрэгслүүд
                </Link>
              </Button>
            </div>
          </div>
      </div>
    </div>
  );
}
