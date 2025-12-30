
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Timer, Code as CodeIcon, BookOpen, ImageIcon, Save, Loader2, HeartPulse, LayoutGrid, TrendingUp } from "lucide-react";
import BackButton from "@/components/shared/BackButton";
import { useFirebase } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useEditMode } from '@/contexts/EditModeContext';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const tools = [
  {
    title: "Англи хэл",
    description: "Англи хэл сурах хэрэгслүүд",
    href: "/tools/english",
    icon: <BookOpen className="h-6 w-6" />
  },
  {
    title: "Япон хэл",
    description: "Япон хэл сурах хэрэгслүүд",
    href: "/tools/japanese",
    icon: <BookOpen className="h-6 w-6" />
  },
   {
    title: "Workspace",
    description: "Хувийн ажлын самбар, төлөвлөгч",
    href: "/tools/notes",
    icon: <LayoutGrid className="h-6 w-6" />
  },
  {
    title: "Програмчлал",
    description: "Код бичиж сурах хэрэгслүүд",
    href: "/tools/programming",
    icon: <CodeIcon className="h-6 w-6" />
  },
  {
    title: "TraderAi",
    description: "AI-аар алтны ханшийн зураг шинжлэх",
    href: "/tools/trader-ai",
    icon: <TrendingUp className="h-6 w-6" />
  },
  {
    title: "Pomodoro Timer",
    description: "Төвлөрлийг сайжруулах цаг",
    href: "/tools/pomodoro",
    icon: <Timer className="h-6 w-6" />
  },
];

export default function ToolsPage() {
   const { firestore, user, isUserLoading } = useFirebase();
   const { isEditMode } = useEditMode();
   const { toast } = useToast();
   const [heroImage, setHeroImage] = useState<string | undefined>(undefined);
   const [isImageEditingOpen, setIsImageEditingOpen] = useState(false);
   const [editedImageUrl, setEditedImageUrl] = useState('');
   const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchHeroImage = async () => {
            if (isUserLoading) return;
            
            let imageUrl;
            if (user && firestore) {
                try {
                    const userDocRef = doc(firestore, 'users', user.uid);
                    const docSnap = await getDoc(userDocRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data() as UserProfile;
                        imageUrl = data.toolsHeroImage;
                        setEditedImageUrl(data.toolsHeroImage || '');
                    }
                } catch (error) {
                    console.error("Error fetching user's hero image:", error);
                }
            }

            if (!imageUrl) {
                const placeholder = PlaceHolderImages.find(p => p.id === 'tools-hero-background');
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
            await updateDoc(userDocRef, { toolsHeroImage: editedImageUrl });
            
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
              <Button variant="outline" size="icon" className="absolute top-28 right-4 z-50">
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
                  alt="Abstract technology background"
                  fill
                  className="object-cover"
                  data-ai-hint="abstract technology"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          </div>
      )}
      
      <div className="space-y-8">
        <BackButton />
        <div className="text-center pt-8">
            <h1 className="text-4xl font-bold">Хэрэгслүүд</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {tools.map((tool) => (
            <Link href={tool.href} key={tool.title} className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        {tool.icon}
                        <CardTitle>{tool.title}</CardTitle>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                </CardHeader>
                <CardContent>
                  {tool.description && <CardDescription>{tool.description}</CardDescription>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
