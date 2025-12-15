'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, BookOpen, Ear, Mic, Pencil, Brain, BookCopy, Flame, CheckCircle } from "lucide-react";
import BackButton from "@/components/shared/BackButton";
import { Progress } from '@/components/ui/progress';

const englishSkills = [
  {
    title: "Vocabulary",
    description: "Үгсийн сангаа баяжуулах",
    href: "/tools/english/vocabulary",
    icon: <Brain className="h-8 w-8" />,
    progress: 70,
  },
  {
    title: "Grammar",
    description: "Дүрмийн мэдлэгээ бататгах",
    href: "/tools/english/grammar",
    icon: <BookCopy className="h-8 w-8" />,
    progress: 45,
  },
    {
    title: "Reading",
    description: "Унших чадвараа дээшлүүлэх",
    href: "/tools/english/reading",
    icon: <BookOpen className="h-8 w-8" />,
    progress: 80,
  },
  {
    title: "Listening",
    description: "Сонсох чадвараа сайжруулах",
    href: "/tools/english/listening",
    icon: <Ear className="h-8 w-8" />,
    progress: 60,
  },
  {
    title: "Speaking",
    description: "Ярих чадвараа нэмэгдүүлэх",
    href: "/tools/english/speaking",
    icon: <Mic className="h-8 w-8" />,
    progress: 30,
  },
  {
    title: "Writing",
    description: "Бичих чадвараа хөгжүүлэх",
    href: "/tools/english/writing",
    icon: <Pencil className="h-8 w-8" />,
    progress: 55,
  },
];

const ProgressCard = ({ icon, title, description, progress, href }: (typeof englishSkills)[0]) => (
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
                    <span>Progress</span>
                    <span className="font-semibold text-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
        </CardContent>
        </Card>
    </Link>
)

export default function EnglishDashboardPage() {
  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center pt-8">
          <h1 className="text-4xl font-bold font-headline">English Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Таны сурлагын явц болон өдөр тутмын зорилго.</p>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <Card className="md:col-span-1 bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">Today's Goal</CardTitle>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">2 Grammar Lessons</p>
                    <p className="text-xs text-muted-foreground">+10 new words</p>
                </CardContent>
            </Card>
            <Card className="md:col-span-1 bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">Streak</CardTitle>
                    <Flame className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">5 Days</p>
                    <p className="text-xs text-muted-foreground">Keep it up!</p>
                </CardContent>
            </Card>
             <Card className="md:col-span-1 bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">62%</p>
                    <p className="text-xs text-muted-foreground">Almost there!</p>
                </CardContent>
            </Card>
       </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
        {englishSkills.map((skill) => (
          <ProgressCard key={skill.title} {...skill} />
        ))}
      </div>
    </div>
  );
}