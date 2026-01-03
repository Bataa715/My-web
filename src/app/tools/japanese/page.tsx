
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, BookText, Ear, Mic, Pencil, Brain, BookCopy } from "lucide-react";
import BackButton from "@/components/shared/BackButton";

const japaneseTools = [
    {
        title: "Кана үсэг",
        description: "Хирагана, Катакана сурах",
        href: "/tools/japanese/kana",
        icon: <BookText className="h-6 w-6" />
    },
    {
        title: "Үгсийн сан",
        description: "Үгсийн сангаа баяжуулах",
        href: "/tools/japanese/vocabulary",
        icon: <Brain className="h-6 w-6" />
    },
    {
        title: "Дүрэм",
        description: "Дүрмийн мэдлэгээ бататгах",
        href: "/tools/japanese/grammar",
        icon: <BookCopy className="h-6 w-6" />
    },
    {
        title: "Сонсох",
        description: "Сонсох чадвараа сайжруулах",
        href: "/tools/japanese/listening",
        icon: <Ear className="h-6 w-6" />
    },
    {
        title: "Унших",
        description: "Унших чадвараа дээшлүүлэх",
        href: "/tools/japanese/reading",
        icon: <Pencil className="h-6 w-6" />
    },
    {
        title: "Ярих",
        description: "Ярих чадвараа нэмэгдүүлэх",
        href: "/tools/japanese/speaking",
        icon: <Mic className="h-6 w-6" />
    },
];

export default function JapaneseToolsPage() {
  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center pt-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Япон хэл</h1>
          <p className="mt-2 text-muted-foreground">Чадваруудаа сонгож хичээллээрэй.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-8">
        {japaneseTools.map((tool) => (
          <Link href={tool.href} key={tool.title} className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        {tool.icon}
                        <CardTitle className="text-lg sm:text-xl">{tool.title}</CardTitle>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                </CardHeader>
                <CardContent>
                    <CardDescription>{tool.description}</CardDescription>
                </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
