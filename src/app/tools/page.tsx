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
        if (isUserLoading) return;

        const fetchHeroImage = async () => {
        if (user && firestore) {
            const userDocRef = doc(firestore, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if(data.heroImage) {
                setHeroImage(data.heroImage);
                return;
            }
            }
        }
        setHeroImage("https://images.unsplash.com/photo-1581533676255-4f26a768fc4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxhYnN0cmFjdCUyMGxpYnJhcnl8ZW58MHx8fHwxNzY1NjMyNDk3fDA&ixlib=rb-4.1.0&q=80&w=1080");
        };

        fetchHeroImage();
    }, [user, firestore, isUserLoading]);


  return (
    <div className="relative min-h-[calc(100vh-57px-81px)] flex flex-col overflow-hidden">
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
        {heroImage && (
            <div className="absolute bottom-0 left-0 w-full z-0 h-full">
                <Image
                    src={heroImage}
                    alt="Abstract learning background"
                    fill
                    className="object-cover"
                    data-ai-hint="abstract library"
                    style={{
                        maskImage: 'linear-gradient(to top right, transparent 20%, black 70%)',
                        WebkitMaskImage: 'linear-gradient(to top right, transparent 20%, black 70%)'
                    }}
                />
            </div>
        )}
    </div>
  );
}
