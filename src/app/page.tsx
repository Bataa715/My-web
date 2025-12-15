'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { Loader2, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { doc, getDoc, setDoc, writeBatch, collection, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';

const OLD_ANONYMOUS_UID = 'CcOeFzgZ4rSkYQuovkBFCIjZvc33';

export default function DataMigrationPage() {
  const { user, isUserLoading, firestore } = useFirebase();
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

      // 2. Migrate sub-collections (projects, skills, etc.)
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

      router.push('/home');

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

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Уншиж байна...</p>
      </div>
    );
  }
  
  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-6 text-center">
          <h1 className="text-3xl font-bold">Data Migration</h1>
          <p className="max-w-md text-muted-foreground">
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
              <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
                  <ServerCrash className="h-5 w-5" />
                  <p>{error}</p>
              </div>
          )}
      </div>
  )
}
