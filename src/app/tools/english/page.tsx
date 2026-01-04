
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, Ear, Mic, Pencil, Brain, BookCopy, ArrowRight } from "lucide-react";
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
    icon: <Brain className="h-6 w-6 md:h-8 md:w-8" />,
  },
  {
    id: 'grammar',
    title: "Grammar",
    description: "Дүрмийн мэдлэгээ бататгах",
    href: "/tools/english/grammar",
    icon: <BookCopy className="h-6 w-6 md:h-8 md:w-8" />,
  },
    {
    id: 'reading',
    title: "Reading",
    description: "Унших чадвараа дээшлүүлэх",
    href: "/tools/english/reading",
    icon: <BookOpen className="h-6 w-6 md:h-8 md:w-8" />,
  },
  {
    id: 'listening',
    title: "Listening",
    description: "Сонсох чадвараа сайжруулах",
    href: "/tools/english/listening",
    icon: <Ear className="h-6 w-6 md:h-8 md:w-8" />,
  },
  {
    id: 'speaking',
    title: "Speaking",
    description: "Ярих чадвараа нэмэгдүүлэх",
    href: "/tools/english/speaking",
    icon: <Mic className="h-6 w-6 md:h-8 md:w-8" />,
  },
  {
    id: 'writing',
    title: "Writing",
    description: "Бичих чадвараа хөгжүүлэх",
    href: "/tools/english/writing",
    icon: <Pencil className="h-6 w-6 md:h-8 md:w-8" />,
  },
];

interface SkillCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
}

const SkillCard = ({ icon, title, description, href }: SkillCardProps) => (
    <Link href={href} className="group">
        <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
            <div className="space-y-1">
                <CardTitle className="text-lg sm:text-xl font-bold">{title}</CardTitle>
                <CardDescription className="text-sm">{description}</CardDescription>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                {icon}
            </div>
        </CardHeader>
        </Card>
    </Link>
);


export default function EnglishDashboardPage() {
    const [loading, setLoading] = useState(false);
    
  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center pt-8">
          <h1 className="text-3xl sm:text-4xl font-bold">English Dashboard</h1>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-8">
            {englishSkillsConfig.map((skill) => (
              <SkillCard 
                key={skill.id} 
                {...skill} 
              />
            ))}
        </div>
      )}
    </div>
  );
}
