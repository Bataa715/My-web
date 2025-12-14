'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, BookOpen, Ear, Mic, Pencil, Brain, BookCopy } from "lucide-react";
import BackButton from "@/components/shared/BackButton";
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const englishTools = [
  {
    title: "Writing",
    description: "Бичих чадвараа хөгжүүлэх",
    href: "/tools/english/writing",
    icon: <Pencil className="h-6 w-6" />
  },
  {
    title: "Listening",
    description: "Сонсох чадвараа сайжруулах",
    href: "/tools/english/listening",
    icon: <Ear className="h-6 w-6" />
  },
  {
    title: "Reading",
    description: "Унших чадвараа дээшлүүлэх",
    href: "/tools/english/reading",
    icon: <BookOpen className="h-6 w-6" />
  },
  {
    title: "Speaking",
    description: "Ярих чадвараа нэмэгдүүлэх",
    href: "/tools/english/speaking",
    icon: <Mic className="h-6 w-6" />
  },
  {
    title: "Vocabulary",
    description: "Үгсийн сангаа баяжуулах",
    href: "/tools/english/vocabulary",
    icon: <Brain className="h-6 w-6" />
  },
  {
    title: "Grammar",
    description: "Дүрмийн мэдлэгээ бататгах",
    href: "/tools/english/grammar",
    icon: <BookCopy className="h-6 w-6" />
  },
];

export default function EnglishToolsPage() {
   const { firestore, user, isUserLoading } = useFirebase();
   const [heroImage, setHeroImage] = useState<string | undefined>(undefined);

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
                        // Assuming you might add a specific hero image for this page later
                        // if (data.englishToolsHeroImage) {
                        //     imageUrl = data.englishToolsHeroImage;
                        // }
                    }
                } catch (error) {
                    console.error("Error fetching user's hero image:", error);
                }
            }

            if (!imageUrl) {
                // Using tools hero as a fallback
                const placeholder = PlaceHolderImages.find(p => p.id === 'tools-hero-background');
                imageUrl = placeholder?.imageUrl;
            }
            
            setHeroImage(imageUrl);
        };

        fetchHeroImage();
    }, [user, firestore, isUserLoading]);

  return (
    <div className="relative">
      {heroImage && (
          <div className="absolute top-0 left-0 w-full h-[50vh] -z-10">
              <Image
                  src={heroImage}
                  alt="Abstract English learning background"
                  fill
                  className="object-cover"
                  data-ai-hint="abstract english"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          </div>
      )}
      
      <div className="relative space-y-8">
        <BackButton />
        <div className="text-center pt-8">
            <h1 className="text-4xl font-bold font-headline">Англи хэл</h1>
            <p className="mt-2 text-muted-foreground">Чадваруудаа сонгож хичээллээрэй.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {englishTools.map((tool) => (
            <Link href={tool.href} key={tool.title} className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      {tool.icon}
                      {tool.title}
                    </span>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{tool.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
