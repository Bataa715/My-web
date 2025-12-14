'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

export default function Home() {
  const [heroImage, setHeroImage] = useState<ImagePlaceholder | undefined>(undefined);

  useEffect(() => {
    const image = PlaceHolderImages.find(p => p.id === 'hero-background');
    setHeroImage(image);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center text-center h-[calc(100vh-57px-81px)] -m-4 sm:-m-6 lg:-m-8">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-10 dark:opacity-5"
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
    </div>
  );
}
