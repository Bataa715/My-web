import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  return (
    <div className="relative flex flex-col items-center justify-center text-center py-32 md:py-48">
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
