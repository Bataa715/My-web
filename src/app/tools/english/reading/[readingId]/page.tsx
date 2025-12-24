
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { ReadingMaterial } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/shared/BackButton';
import ReadingView from '@/components/shared/ReadingView';

export default function ReadingMaterialPage({ params }: { params: { readingId: string } }) {
  const { firestore, user } = useFirebase();
  const [material, setMaterial] = useState<ReadingMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { readingId } = params;

  useEffect(() => {
    if (!firestore || !readingId || !user) {
      setLoading(false);
      return;
    }

    const fetchMaterial = async () => {
      setLoading(true);
      setError(null);
      try {
        const materialDocRef = doc(firestore, `users/${user.uid}/englishReading`, readingId);
        const docSnap = await getDoc(materialDocRef);

        if (docSnap.exists()) {
          setMaterial({ id: docSnap.id, ...docSnap.data() } as ReadingMaterial);
        } else {
          setError('Унших материал олдсонгүй.');
        }
      } catch (err) {
        console.error("Error fetching reading material:", err);
        setError('Унших материал татахад алдаа гарлаа.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [firestore, readingId, user]);

  return (
    <div className="space-y-8">
      <BackButton />
      
      {loading && (
        <div className="space-y-4 pt-8">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-1/4" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && material && (
        <ReadingView material={material} />
      )}
    </div>
  );
}
