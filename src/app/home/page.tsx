'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Wrench, ImageIcon, Loader2, Save, ChevronDown } from 'lucide-react';
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

export default function Home() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { isEditMode } = useEditMode();
  const { toast } = useToast();
  const [heroImage, setHeroImage] = useState<string | undefined>(undefined);
  const [isImageEditingOpen, setIsImageEditingOpen] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

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
            imageUrl = data.homeHeroImage;
            setEditedImageUrl(data.homeHeroImage || '');
          }
        } catch (error) {
            console.error("Error fetching user's hero image:", error);
        }
      }
      
      if (!imageUrl) {
        const placeholder = PlaceHolderImages.find(p => p.id === 'home-hero-background');
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
          await updateDoc(userDocRef, { homeHeroImage: editedImageUrl });
          
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
    <div className="relative h-[calc(100vh-57px-81px)]">
       {isEditMode && (
          <Dialog open={isImageEditingOpen} onOpenChange={setIsImageEditingOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="absolute top-4 right-4 z-10">
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
        <div className="absolute top-0 left-0 w-full h-full -z-10">
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
      <div className="flex flex-col items-center justify-center text-center h-full">
         <div className="relative z-20 flex flex-col items-center justify-center space-y-6 px-4">
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
             Энэ бол тасралтгүй хөгжил, суралцах үйл явцыг минь харуулсан хувийн орон зай юм.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/about">
                  Миний тухай <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/tools">
                  <Wrench className="mr-2 h-5 w-5" /> Хэрэгслүүд
                </Link>
              </Button>
            </div>
          </div>
      </div>
       <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="animate-bounce">
            <ChevronDown className="h-8 w-8 text-muted-foreground" />
          </div>
      </div>
    </div>
  );
}
