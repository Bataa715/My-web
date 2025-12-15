
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, Ear, Mic, Pencil, Brain, BookCopy } from "lucide-react";
import BackButton from "@/components/shared/BackButton";
import { Progress } from '@/components/ui/progress';
import { useFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { EnglishWord } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const englishSkillsConfig = [
  {
    id: 'vocabulary',
    title: "Vocabulary",
    description: "Үгсийн сангаа баяжуулах",
    href: "/tools/english/vocabulary",
    icon: <Brain className="h-8 w-8" />,
    progress: 0, 
  },
  {
    id: 'grammar',
    title: "Grammar",
    description: "Дүрмийн мэдлэгээ бататгах",
    href: "/tools/english/grammar",
    icon: <BookCopy className="h-8 w-8" />,
    progress: 0,
  },
    {
    id: 'reading',
    title: "Reading",
    description: "Унших чадвараа дээшлүүлэх",
    href: "/tools/english/reading",
    icon: <BookOpen className="h-8 w-8" />,
    progress: 0,
  },
  {
    id: 'listening',
    title: "Listening",
    description: "Сонсох чадвараа сайжруулах",
    href: "/tools/english/listening",
    icon: <Ear className="h-8 w-8" />,
    progress: 0,
  },
  {
    id: 'speaking',
    title: "Speaking",
    description: "Ярих чадвараа нэмэгдүүлэх",
    href: "/tools/english/speaking",
    icon: <Mic className="h-8 w-8" />,
    progress: 0,
  },
  {
    id: 'writing',
    title: "Writing",
    description: "Бичих чадвараа хөгжүүлэх",
    href: "/tools/english/writing",
    icon: <Pencil className="h-8 w-8" />,
    progress: 0,
  },
];

interface ProgressCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    progress: number;
    href: string;
    progressText?: string;
}

const ProgressCard = ({ icon, title, description, progress, href, progressText }: ProgressCardProps) => (
    <Link href={href} className="group">
        <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-4">
            <div className="space-y-1">
                <CardTitle className="text-xl font-bold">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {icon}
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Явц</span>
                    <span className="font-semibold text-foreground">{progressText || `${progress.toFixed(0)}%`}</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
        </CardContent>
        </Card>
    </Link>
);


export default function EnglishDashboardPage() {
    const { firestore, user } = useFirebase();
    const [skills, setSkills] = useState(englishSkillsConfig);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            if (!firestore) {
                setLoading(false);
                return;
            }
            setLoading(true);

            try {
                // Fetch vocabulary progress
                const publicWordsCollection = collection(firestore, 'englishWords');
                const publicWordsSnapshot = await getDocs(publicWordsCollection);
                const totalWords = publicWordsSnapshot.size;
                
                let memorizedCount = 0;
                if (user) {
                    const userWordsCollection = collection(firestore, `users/${user.uid}/englishWords`);
                    const userWordsSnapshot = await getDocs(userWordsCollection);
                    
                    const userWordMap = new Map();
                    userWordsSnapshot.docs.forEach(doc => {
                        userWordMap.set(doc.id, doc.data());
                    });

                    publicWordsSnapshot.docs.forEach(doc => {
                        const userData = userWordMap.get(doc.id);
                        if (userData?.memorized) {
                            memorizedCount++;
                        }
                    });
                }
                
                const vocabularyProgress = totalWords > 0 ? (memorizedCount / totalWords) * 100 : 0;
                
                // Fetch grammar progress
                const grammarCollection = collection(firestore, 'englishGrammar');
                const grammarSnapshot = await getDocs(grammarCollection);
                const totalRules = grammarSnapshot.size;

                setSkills(prevSkills => prevSkills.map(skill => {
                    if (skill.id === 'vocabulary') {
                        return { ...skill, progress: vocabularyProgress, progressText: `${totalWords}-с ${memorizedCount}` };
                    }
                    if (skill.id === 'grammar') {
                        return { ...skill, progress: 0, progressText: `Нийт ${totalRules} дүрэм` };
                    }
                    return skill;
                }));

            } catch (error) {
                console.error("Error fetching progress:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();

    }, [firestore, user]);
    
  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center pt-8">
          <h1 className="text-4xl font-bold font-headline">English Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Таны сурлагын явц болон өдөр тутмын зорилго.</p>
      </div>

       {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {Array(6).fill(0).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-4">
                  <div className="space-y-1">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
              </CardHeader>
              <CardContent>
                  <div className="space-y-2">
                      <div className="flex justify-between">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-10" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                  </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {skills.map((skill) => (
              <ProgressCard 
                key={skill.id} 
                {...skill} 
                progressText={(skill as any).progressText}
              />
            ))}
        </div>
      )}
    </div>
  );
}
