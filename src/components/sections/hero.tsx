'use client';

import { Button } from '@/components/ui/button';
import { Download, Mail } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const Hero = () => {
    const avatarImage = PlaceHolderImages.find(p => p.id === 'avatar');
  return (
    <section className="container grid grid-cols-1 items-center gap-12 py-12 md:grid-cols-2 md:py-24">
      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <p className="font-bold text-primary">Сайн байна уу? Намайг Б.Батмягмар гэдэг.</p>
        <h1 className="mt-2 text-4xl font-bold font-headline md:text-5xl lg:text-6xl">
            Мэдээллийн технологийн инженер
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
            Би програм хангамж хөгжүүлэлт, хиймэл оюун ухаан, өгөгдлийн шинжлэх ухааны чиглэлээр ажилладаг.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 md:justify-start">
          <Button asChild>
            <a href="mailto:batmyagmar.b@gmail.com">
              <Mail className="mr-2" /> Холбогдох
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/resume.pdf" download>
              <Download className="mr-2" /> CV татах
            </a>
          </Button>
        </div>
      </div>
      <div className="relative mx-auto h-64 w-64 md:h-80 md:w-80">
        {avatarImage && (
             <Image
             src={avatarImage.imageUrl}
             alt={avatarImage.description}
             fill
             className="rounded-full object-cover shadow-lg"
             priority
             data-ai-hint={avatarImage.imageHint}
           />
        )}
      </div>
    </section>
  );
};

export default Hero;
