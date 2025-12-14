'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { useEditMode } from '@/contexts/EditModeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { isEditMode } = useEditMode();
  const [heroImage, setHeroImage] = useState<ImagePlaceholder | undefined>(undefined);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const image = PlaceHolderImages.find(p => p.id === 'hero-background');
    setHeroImage(image);
    if (image) {
      setEditedImageUrl(image.imageUrl);
    }
  }, []);

  const handleSaveImage = () => {
    // This is a client-side simulation. In a real app, you'd call an API to update the JSON file.
    if (heroImage) {
      setSaving(true);
      // Simulate API call
      setTimeout(() => {
        const updatedImage = { ...heroImage, imageUrl: editedImageUrl };
        // In a real app, this update would happen on the backend.
        // For this demo, we'll just update the state.
        setHeroImage(updatedImage);
        // And we'll update the PlaceHolderImages array in memory
        const imageIndex = PlaceHolderImages.findIndex(p => p.id === 'hero-background');
        if (imageIndex !== -1) {
            PlaceHolderImages[imageIndex] = updatedImage;
        }

        setSaving(false);
        setIsEditingImage(false);
        toast({
          title: 'Амжилттай',
          description: 'Арын зураг шинэчлэгдлээ.',
        });
      }, 1000);
    }
  };

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
      {isEditMode && (
        <div className="relative z-10">
          <Button variant="outline" onClick={() => setIsEditingImage(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Зураг солих
          </Button>
        </div>
      )}

      <Dialog open={isEditingImage} onOpenChange={setIsEditingImage}>
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
               {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />} Хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
