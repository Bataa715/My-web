import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { personalInfo } from '@/lib/data';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 min-h-[calc(100vh-120px)]">
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
      <div className="relative z-10 p-8 bg-background/50 dark:bg-background/60 backdrop-blur-sm rounded-xl shadow-lg border">
        <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-primary animate-fade-in-down">
          Kaizen
        </h1>
        <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Англи • Япон • Программчлал сурах хувийн систем
        </p>
        <Button asChild size="lg" className="mt-8 transform transition-transform hover:scale-105">
          <Link href="/tools">Суралцаж эхлэх</Link>
        </Button>
      </div>
    </div>
  );
}
