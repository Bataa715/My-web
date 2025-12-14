'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, BookOpen, Ear, Mic, Pencil, Brain, BookCopy } from "lucide-react";
import BackButton from "@/components/shared/BackButton";

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
  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center pt-8">
          <h1 className="text-4xl font-bold font-headline">Англи хэл</h1>
          <p className="mt-2 text-muted-foreground">Чадваруудаа сонгож хичээллээрэй.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
        {englishTools.map((tool) => (
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
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
