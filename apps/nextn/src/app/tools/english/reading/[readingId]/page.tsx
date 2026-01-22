'use client';

import { useEffect, useState, use } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { ReadingMaterial, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/shared/BackButton';
import ReadingView from '@/components/shared/ReadingView';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ReadingMaterialPage({
  params,
}: {
  params: Promise<{ readingId: string }>;
}) {
  const { readingId } = use(params);
  const { firestore, user, isUserLoading } = useFirebase();
  const [material, setMaterial] = useState<ReadingMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!firestore || !readingId || !user) {
      setLoading(false);
      return;
    }

    const fetchMaterialAndImage = async () => {
      setLoading(true);
      setError(null);
      try {
        const materialDocRef = doc(
          firestore,
          `users/${user.uid}/englishReading`,
          readingId
        );
        const userDocRef = doc(firestore, 'users', user.uid);

        const [materialSnap, userSnap] = await Promise.all([
          getDoc(materialDocRef),
          getDoc(userDocRef),
        ]);

        if (materialSnap.exists()) {
          setMaterial({
            id: materialSnap.id,
            ...materialSnap.data(),
          } as ReadingMaterial);
        } else {
          setError('Унших материал олдсонгүй.');
        }

        let imageUrl;
        if (userSnap.exists()) {
          const data = userSnap.data() as UserProfile;
          imageUrl = data.homeHeroImage;
        }

        if (!imageUrl) {
          const placeholder = PlaceHolderImages.find(
            p => p.id === 'home-hero-background'
          );
          imageUrl = placeholder?.imageUrl;
        }
        setHeroImage(imageUrl);
      } catch (err) {
        console.error('Error fetching reading material or hero image:', err);
        setError('Унших материал татахад алдаа гарлаа.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialAndImage();
  }, [firestore, readingId, user]);

  return (
    <div className="relative space-y-8">
      {heroImage && (
        <div className="absolute top-0 left-0 w-full h-full -z-10">
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

      {!loading && !error && material && <ReadingView material={material} />}
    </div>
  );
}
