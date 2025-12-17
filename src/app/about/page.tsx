
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, ImageIcon, Loader2, Save, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import Image from 'next/image';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useEditMode } from '@/contexts/EditModeContext';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

interface Hobby {
  id: string;
  title: string;
  description: string;
  image: string;
  imageHint: string;
}

const hobbies: Hobby[] = [
  {
    id: 'music',
    title: 'Хөгжим тоглох',
    description: 'Бас хаяа гитар, төгөлдөр хуур хөгжим тоглоод интернет дээр тавьчихдаг (๑• ᎑ •๑)',
    image: 'https://picsum.photos/seed/playing-guitar/600/400',
    imageHint: 'music instrument'
  },
  {
    id: 'anime',
    title: 'Аниме, ном, дуу, тоглоом',
    description: 'Өдөр болгон бүхий л ном, роман уншиж, кино үзэж, хөгжим сонсдог. Үүнээс гадна жаахан содон зүйлүүдийг дурдвал Аниме, Вебтүүн, Видео гейм гэх мэтчилэн байнаа. (©w©)',
    image: 'https://picsum.photos/seed/interstellar/600/400',
    imageHint: 'movie poster'
  },
  {
    id: 'sports',
    title: 'Спорт',
    description: 'Яагаад ч юм өглөө болоод гүйх шиг сайхан юм байдаггүй ээ. Тамирчин биш л дээ. Гэхдээ гүйсний дараа жинхэнэ амар амгаланг мэдэрдэг (๑´`๑). Гүйхийн хажуугаар фитнессээр, усан бассейнээр хичээллэх дуртай (๑´`๑).',
    image: 'https://picsum.photos/seed/running-morning/600/400',
    imageHint: 'running morning'
  },
  {
    id: 'polyglot',
    title: 'Полиглот болох мөрөөдөл',
    description: 'Одоогоор япон хэл үзэж байгаа ба, ирээдүйд герман хэлээр ярьдаг болох бүрэн зорилготой.',
    image: 'https://picsum.photos/seed/languages/600/400',
    imageHint: 'languages books'
  },
  {
    id: 'coding',
    title: 'Код бичих',
    description: 'Шинэ технологи сурч, сонирхолтой төслүүд дээр ажиллах нь миний хамгийн дуртай зүйлсийн нэг.',
    image: 'https://picsum.photos/seed/coding-desk/600/400',
    imageHint: 'coding desk'
  },
  {
    id: 'travel',
    title: 'Аялах',
    description: 'Шинэ газар үзэж, өөр соёлтой танилцах нь ертөнцийг харах өнцгийг минь тэлдэг.',
    image: 'https://picsum.photos/seed/travel-map/600/400',
    imageHint: 'travel map'
  },
  {
    id: 'photography',
    title: 'Гэрэл зураг',
    description: 'Гоё агшинг камерын дуранд буулгаж, тэр мөчийг мөнхлөх дуртай.',
    image: 'https://picsum.photos/seed/camera-lens/600/400',
    imageHint: 'camera lens'
  },
  {
    id: 'cooking',
    title: 'Хоол хийх',
    description: 'Янз бүрийн орны хоол туршиж, шинэ амтыг нээх нь надад таашаал өгдөг.',
    image: 'https://picsum.photos/seed/cooking-kitchen/600/400',
    imageHint: 'cooking kitchen'
  },
];

export default function AboutPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { isEditMode } = useEditMode();
  const { toast } = useToast();
  const [heroImage, setHeroImage] = useState<string | undefined>(undefined);
  const [isImageEditingOpen, setIsImageEditingOpen] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // 3D Carousel State
  const [activeIndex, setActiveIndex] = useState(0);
  const totalItems = hobbies.length;
  const anglePerItem = 360 / totalItems;
  const CIRCLE_RADIUS = 340; // Controls the circle's radius
  const ITEM_WIDTH = 280; // Width of a card

  const scrollNext = () => setActiveIndex((prev) => (prev + 1) % totalItems);
  const scrollPrev = () => setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);

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
            imageUrl = data.aboutHeroImage;
            setEditedImageUrl(data.aboutHeroImage || '');
          }
        } catch (error) {
            console.error("Error fetching user's hero image:", error);
        }
      }
      
      if (!imageUrl) {
        const placeholder = PlaceHolderImages.find(p => p.id === 'about-hero-background');
        imageUrl = placeholder?.imageUrl;
        setEditedImageUrl(placeholder?.imageUrl || '');
      }

      setHeroImage(imageUrl);
    };

    fetchHeroImage();
  }, [user, firestore, isUserLoading]);
  
  const handleSaveImage = async () => {
      if (!user || !firestore) {
           toast({ title: "Алдаа", description: "Нэвтэрч орно уу.", variant: "destructive" });
           return;
      }
      
      setSaving(true);
      try {
          const userDocRef = doc(firestore, 'users', user.uid);
          await updateDoc(userDocRef, { aboutHeroImage: editedImageUrl });
          
          setSaving(false);
          setIsImageEditingOpen(false);
          toast({
              title: 'Амжилттай',
              description: 'Арын зураг шинэчлэгдлээ.',
          });
          setHeroImage(editedImageUrl);
      } catch (error) {
          console.error("Error saving hero image:", error);
          setSaving(false);
          toast({
              title: 'Алдаа',
              description: 'Арын зураг хадгалахад алдаа гарлаа.',
              variant: 'destructive',
          });
      }
  };

  const name = "Batuka";
  const firstLine = "Сайн уу?";
  const secondLine = `Миний нэрийг ${name} гэдэг`;

  return (
    <div className="relative">
       {isEditMode && (
          <Dialog open={isImageEditingOpen} onOpenChange={setIsImageEditingOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="absolute top-4 right-4 z-30">
                <ImageIcon className="h-4 w-4" />
                <span className="sr-only">Арын зураг солих</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Арын зургийн холбоос</DialogTitle>
                <DialogDescription>
                  Шинэ зургийнхаа URL хаягийг энд буулгана уу.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image-url" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="image-url"
                    value={editedImageUrl}
                    onChange={(e) => setEditedImageUrl(e.target.value)}
                    className="col-span-3"
                    placeholder="https://example.com/image.png"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Цуцлах</Button>
                </DialogClose>
                <Button type="button" onClick={handleSaveImage} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Хадгалах
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      {heroImage && (
        <div className="absolute top-0 left-0 w-full h-[100vh] -z-10">
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
       <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-114px)]">
         <div className="relative z-20 flex flex-col items-center justify-center space-y-6 px-4">
             <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl text-muted-foreground font-light"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {firstLine.split('').map((char, index) => (
                <motion.span key={index} variants={letterVariants}>
                  {char}
                </motion.span>
              ))}
            </motion.h1>

            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {secondLine.split(' ').map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block mr-4">
                  {word.split('').map((char, charIndex) => (
                    <motion.span
                      key={charIndex}
                      variants={letterVariants}
                      className={cn(word === name && 'text-primary')}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
            </motion.h2>
          </div>
      </div>
      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold">Миний хоббинууд</h2>
          </div>

            <div className="relative flex items-center justify-center h-[500px]">
              <div className="carousel-container">
                  <div className="carousel" style={{ transform: `rotateY(${-activeIndex * anglePerItem}deg)` }}>
                      {hobbies.map((hobby, index) => {
                          const angle = index * anglePerItem;
                          const isVisible = Math.abs((activeIndex - index + totalItems) % totalItems) <= 2 || Math.abs((activeIndex - index - totalItems) % totalItems) <= 2;

                          const style: CSSProperties = {
                              transform: `rotateY(${angle}deg) translateZ(${CIRCLE_RADIUS}px)`,
                              opacity: isVisible ? 1 : 0.2,
                              pointerEvents: isVisible ? 'auto' : 'none',
                          };

                          return (
                              <div className="carousel-item" key={hobby.id} style={style} onClick={() => setActiveIndex(index)}>
                                   <Card className="bg-card border-border/20 h-full w-full overflow-hidden group">
                                       <CardHeader>
                                         <CardTitle className="text-2xl">{hobby.title}</CardTitle>
                                       </CardHeader>
                                       <CardContent className="space-y-4">
                                           <p className="text-muted-foreground h-20">{hobby.description}</p>
                                           <div className="aspect-video relative rounded-lg overflow-hidden">
                                               <Image 
                                                 src={hobby.image} 
                                                 alt={hobby.title} 
                                                 fill 
                                                 className="object-cover transition-transform duration-300 group-hover:scale-110"
                                                 data-ai-hint={hobby.imageHint} 
                                               />
                                           </div>
                                       </CardContent>
                                   </Card>
                               </div>
                          )
                      })}
                  </div>
              </div>
              <Button
                onClick={scrollPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
                 variant="outline"
                 size="icon"
              >
                <ArrowLeft/>
              </Button>
              <Button
                onClick={scrollNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
                variant="outline"
                size="icon"
              >
                <ArrowRight/>
              </Button>
            </div>
        </div>
      </section>
      
       <style jsx>{`
            .carousel-container {
                perspective: 1500px;
                width: ${ITEM_WIDTH}px;
                height: 450px;
                position: relative;
            }
            .carousel {
                width: 100%;
                height: 100%;
                position: absolute;
                transform-style: preserve-3d;
                transition: transform 0.6s cubic-bezier(0.77, 0, 0.175, 1);
            }
            .carousel-item {
                position: absolute;
                width: ${ITEM_WIDTH}px;
                height: 420px;
                top: 15px;
                left: 0;
                background: transparent;
                transition: opacity 0.6s, transform 0.6s;
                cursor: pointer;
            }
            .carousel-item .card {
                transition: transform 0.3s;
            }
            .carousel-item:not([style*="rotateY(0deg)"]):hover .card {
                 transform: scale(1.05);
            }
      `}</style>
    </div>
  );
}
