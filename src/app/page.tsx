'use client';

import { useEffect, useState } from 'react';
import { useAuth, useFirebase, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';

// THIS IS A TEMPORARY PAGE FOR DATA MIGRATION
// IT WILL BE REMOVED AFTER THE MIGRATION IS COMPLETE

const OLD_ANONYMOUS_USER_ID = 'CcOeFzgZ4rSkYQuovkBFCIjZvc33';

export default function MigratePage() {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [migrationDone, setMigrationDone] = useState(false);

  const handleMigration = async () => {
    if (!firestore || !user || user.isAnonymous) {
      toast({
        title: 'Алдаа',
        description: 'Мэдээлэл шилжүүлэхийн тулд байнгын хэрэглэгчээр нэвтэрсэн байх шаардлагатай.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    toast({ title: 'Мэдээлэл шилжүүлж байна...' });

    const newUserId = user.uid;

    try {
      const batch = writeBatch(firestore);

      // 1. Migrate user profile
      const oldUserDocRef = doc(firestore, 'users', OLD_ANONYMOUS_USER_ID);
      const oldUserDocSnap = await getDoc(oldUserDocRef);

      if (oldUserDocSnap.exists()) {
        const newUserDocRef = doc(firestore, 'users', newUserId);
        batch.set(newUserDocRef, oldUserDocSnap.data());
      }

      // 2. Migrate subcollections
      const subcollections = ['projects', 'skills', 'englishWords', 'japaneseWords', 'memorized', 'progress'];
      for (const subcollectionName of subcollections) {
        const oldSubcollectionRef = collection(firestore, 'users', OLD_ANONYMOUS_USER_ID, subcollectionName);
        const oldDocsSnapshot = await getDocs(oldSubcollectionRef);
        oldDocsSnapshot.forEach((docSnap) => {
          const newDocRef = doc(firestore, 'users', newUserId, subcollectionName, docSnap.id);
          batch.set(newDocRef, docSnap.data());
        });
      }

      // Commit all writes at once
      await batch.commit();

      toast({
        title: 'Амжилттай',
        description: 'Таны бүх мэдээлэл шинэ бүртгэл рүү шилжлээ.',
      });
      setMigrationDone(true);
      router.push('/home');

    } catch (error: any) {
      console.error('Migration failed:', error);
      toast({
        title: 'Мэдээлэл шилжүүлэхэд алдаа гарлаа',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
     return (
        <div className="flex h-screen w-full flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Нэвтэрч орно уу...</p>
            <Button onClick={() => router.push('/login')} className="mt-4">Нэвтрэх хуудас</Button>
        </div>
     )
  }


  return (
    <div className="flex h-screen w-full flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl font-bold">Data Migration</h1>
       <p className="text-muted-foreground">Таны түр хэрэглэгчийн мэдээллийг байнгын бүртгэл рүү шилжүүлэх.</p>
      <Button onClick={handleMigration} disabled={loading || migrationDone}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {migrationDone ? 'Шилжүүлсэн' : 'Мэдээлэл Шилжүүлэх'}
      </Button>
       <p className='text-sm text-center max-w-xs text-red-600'>Анхаар: Энэ товчийг зөвхөн нэг удаа дарна уу. Шилжүүлэлт дууссаны дараа энэ хуудас ажиллахгүй болно.</p>
    </div>
  );
}
