
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Timer, Code as CodeIcon, BookOpen, HeartPulse, LayoutGrid, TrendingUp } from "lucide-react";
import BackButton from "@/components/shared/BackButton";
import { motion } from 'framer-motion';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="relative"
    >
      <div className="space-y-8 px-4 md:px-6">
        <BackButton />
        <div className="text-center pt-8">
            <h1 className="text-3xl sm:text-4xl font-bold">Хэрэгслүүд</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-8">
          {tools.map((tool) => (
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
                  {tool.description && <CardDescription>{tool.description}</CardDescription>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
