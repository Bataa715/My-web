'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Timer, Code, BookOpen } from "lucide-react";
import BackButton from "@/components/shared/BackButton";
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const tools = [
  {
    title: "Англи хэл",
    description: "Үгсийн сан болон дүрмээ бататгаарай.",
    href: "/tools/english",
    icon: <BookOpen className="h-6 w-6" />
  },
  {
    title: "Япон хэл",
    description: "Хирагана, катакана, үгсийн сан, дүрэм.",
    href: "/tools/japanese",
    icon: <BookOpen className="h-6 w-6" />
  },
  {
    title: "Программчлал",
    description: "Үндсэн ойлголтууд, cheat sheets, ахиц хянагч.",
    href: "/tools/programming",
    icon: <Code className="h-6 w-6" />
  },
  {
    title: "Pomodoro Timer",
    description: "Хичээллэх, завсарлах хугацааг удирдах.",
    href: "/tools/pomodoro",
    icon: <Timer className="h-6 w-6" />
  },
];

export default function ToolsPage() {
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
                        if (data.heroImage) {
                            imageUrl = data.heroImage;
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user's hero image:", error);
                }
            }

            if (!imageUrl) {
                const placeholder = PlaceHolderImages.find(p => p.id === 'hero-background');
                imageUrl = placeholder?.imageUrl;
            }
            
            setHeroImage(imageUrl);
        };

        fetchHeroImage();
    }, [user, firestore, isUserLoading]);

  return (
    <div className="relative min-h-[calc(100vh-57px-81px)] flex flex-col overflow-hidden">
       {heroImage && (
            <>
                <div className="absolute bottom-0 left-0 w-full z-0 h-[60vh]">
                    <Image
                        src={heroImage}
                        alt="Abstract learning background"
                        fill
                        className="object-cover"
                        data-ai-hint="abstract library"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-0"></div>
            </>
        )}
       <div className="space-y-8 z-10 pt-8 flex-grow">
          <BackButton />
          <div className="text-center">
            <h1 className="text-3xl font-bold font-headline">Хэрэгслүүд</h1>
            <p className="text-muted-foreground">
              Суралцах үйл явцад тань туслах хэрэгслүүдийн цуглуулга.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <Link href={tool.href} key={tool.title} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
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
