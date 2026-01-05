'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import Link from 'next/link';
import {
  ArrowRight,
  Timer,
  Code as CodeIcon,
  BookOpen,
  LayoutGrid,
  TrendingUp,
} from 'lucide-react';
import BackButton from '@/components/shared/BackButton';
import { motion } from 'framer-motion';
import InteractiveParticles from '@/components/shared/InteractiveParticles';

const tools = [
  {
    title: 'Англи хэл',
    description: 'Англи хэл сурах хэрэгслүүд',
    href: '/tools/english',
    icon: <BookOpen className="h-8 w-8" />,
  },
  {
    title: 'Япон хэл',
    description: 'Япон хэл сурах хэрэгслүүд',
    href: '/tools/japanese',
    icon: <BookOpen className="h-8 w-8" />,
  },
  {
    title: 'Workspace',
    description: 'Хувийн ажлын самбар, төлөвлөгч',
    href: '/tools/notes',
    icon: <LayoutGrid className="h-8 w-8" />,
  },
  {
    title: 'Програмчлал',
    description: 'Код бичиж сурах хэрэгслүүд',
    href: '/tools/programming',
    icon: <CodeIcon className="h-8 w-8" />,
  },
  {
    title: 'TraderAi',
    description: 'AI-аар алтны ханшийн зураг шинжлэх',
    href: '/tools/trader-ai',
    icon: <TrendingUp className="h-8 w-8" />,
  },
  {
    title: 'Pomodoro Timer',
    description: 'Төвлөрлийг сайжруулах цаг',
    href: '/tools/pomodoro',
    icon: <Timer className="h-8 w-8" />,
  },
];

export default function ToolsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative"
    >
      <InteractiveParticles />
      <div className="space-y-8 px-4 md:px-6 relative z-10">
        <BackButton />
        <div className="text-center pt-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Хэрэгслүүд</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-8">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={tool.href} className="group block h-full">
                <Card className="glassmorphism-card h-full transition-all duration-300 hover:border-primary/60 hover:scale-105 hover:neon-glow flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary mb-4">
                        {tool.icon}
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold">
                      {tool.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {tool.description && (
                      <CardDescription>{tool.description}</CardDescription>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
