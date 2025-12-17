'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Wrench, ImageIcon, Loader2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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


export default function AboutPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { isEditMode } = useEditMode();
  const { toast } = useToast();
  const [heroImage, setHeroImage] = useState<string | undefined>(undefined);
  const [isImageEditingOpen, setIsImageEditingOpen] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  
  const name = "Batuka";
  const firstLine = "Сайн уу?";
  const secondLine = `Миний нэрийг ${name} гэдэг`;


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
        <div className="absolute top-0 left-0 w-full h-[50vh] -z-10">
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
      <div className="flex flex-col items-center text-center pt-20 min-h-[50vh]">
         <div className="relative z-20 flex flex-col items-center justify-center space-y-6 px-4">
             <motion.h1
              className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground font-light"
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
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight"
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
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">Миний хоббинууд</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Өөрийгөө идэвхтэй байлгах дуртай нэгэн л дээ. Шинэ хобби бол жил болгон тогтмол нэмэгднээ.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-muted/20 border-border/20">
              <CardHeader>
                <CardTitle className="text-2xl">Өглөөний гүйлт</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Яагаад ч юм өглөө болоод гүйх шиг сайхан юм байдаггүй ээ. Тамирчин биш л дээ. Гэхдээ гүйсний дараа жинхэнэ амар амгаланг мэдэрдэг (๑´`๑). Гүйхийн хажуугаар фитнессээр, усан бассейнээр хичээллэх дуртай (๑´`๑). Тоон үзүүлэлт гэвэл 7км зогсохгүй гүйж, 110кг үндсэн суулт, 70кг цээж шахалт хийж чадна (–  โจทย์ –)</p>
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <Image src="https://picsum.photos/seed/running-sky/600/338" alt="Morning run sky" layout="fill" objectFit="cover" data-ai-hint="sky cloud" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/20 border-border/20">
              <CardHeader>
                <CardTitle className="text-2xl">Кино, ном, дуу, тоглоом</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Өдөр болгон бүхий л ном, роман уншиж, кино үзэж, хөгжим сонсдог. Үүнээс гадна жаахан содон зүйлүүдийг дурдвал Аниме, Вебтүүн, Видео гейм гэх мэтчилэн байнаа. (©w©)</p>
                 <div className="relative h-48">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-48 h-64 transform -rotate-12 perspective-[1000px] hover:rotate-0 hover:scale-110 transition-transform duration-300">
                      <Image src="https://ibb.co/2d1hjyf" alt="Dark Souls 2" layout="fill" objectFit="cover" className="rounded-lg shadow-lg" />
                    </div>
                     <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 z-10 perspective-[1000px] hover:scale-110 transition-transform duration-300">
                      <Image src="https://ibb.co/hZJ4x3N" alt="Interstellar" layout="fill" objectFit="cover" className="rounded-lg shadow-2xl" />
                    </div>
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-64 transform rotate-12 perspective-[1000px] hover:rotate-0 hover:scale-110 transition-transform duration-300">
                      <Image src="https://ibb.co/P9tLpWB" alt="Norwegian Wood" layout="fill" objectFit="cover" className="rounded-lg shadow-lg" />
                    </div>
                 </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/20 border-border/20">
              <CardHeader>
                <CardTitle className="text-2xl">Хөгжим сонирхогч</CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-muted-foreground">Бас хаяа гитар, төгөлдөр хуур хөгжим тоглоод интернет дээр тавьчихдаг (๑• ᎑ •๑)</p>
              </CardContent>
            </Card>

            <Card className="bg-muted/20 border-border/20">
              <CardHeader>
                <CardTitle className="text-2xl">Полиглот болох мөрөөдөл</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Одоогоор япон хэл үзэж байгаа ба, ирээдүйд герман хэлээр ярьдаг болох бүрэн зорилготой.</p>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>
    </div>
  );
}
