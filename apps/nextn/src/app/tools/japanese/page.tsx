'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import Link from 'next/link';
import {
  BookText,
  Ear,
  Mic,
  Pencil,
  Brain,
  BookCopy,
} from 'lucide-react';
import ToolPageShell from '@/components/shared/ToolPageShell';

const japaneseTools = [
  {
    title: 'Кана үсэг',
    description: 'Хирагана, Катакана сурах',
    href: '/tools/japanese/kana',
    icon: <BookText className="h-7 w-7" />,
    gradient: 'from-rose-500 to-pink-400',
    shadowColor: 'rgba(244, 63, 94, 0.5)',
  },
  {
    title: 'Үгсийн сан',
    description: 'Үгсийн сангаа баяжуулах',
    href: '/tools/japanese/vocabulary',
    icon: <Brain className="h-7 w-7" />,
    gradient: 'from-violet-500 to-purple-400',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
  },
  {
    title: 'Дүрэм',
    description: 'Дүрмийн мэдлэгээ бататгах',
    href: '/tools/japanese/grammar',
    icon: <BookCopy className="h-7 w-7" />,
    gradient: 'from-blue-500 to-cyan-400',
    shadowColor: 'rgba(59, 130, 246, 0.5)',
  },
  {
    title: 'Сонсох',
    description: 'Сонсох чадвараа сайжруулах',
    href: '/tools/japanese/listening',
    icon: <Ear className="h-7 w-7" />,
    gradient: 'from-orange-500 to-amber-400',
    shadowColor: 'rgba(249, 115, 22, 0.5)',
  },
  {
    title: 'Унших',
    description: 'Унших чадвараа дээшлүүлэх',
    href: '/tools/japanese/reading',
    icon: <Pencil className="h-7 w-7" />,
    gradient: 'from-emerald-500 to-teal-400',
    shadowColor: 'rgba(16, 185, 129, 0.5)',
  },
  {
    title: 'Ярих',
    description: 'Ярих чадвараа нэмэгдүүлэх',
    href: '/tools/japanese/speaking',
    icon: <Mic className="h-7 w-7" />,
    gradient: 'from-red-500 to-rose-400',
    shadowColor: 'rgba(239, 68, 68, 0.5)',
  },
];

interface SkillCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  gradient: string;
  shadowColor: string;
  index: number;
}

const SkillCard = ({
  icon,
  title,
  description,
  href,
  gradient,
  shadowColor,
  index,
}: SkillCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      duration: 0.5,
      delay: index * 0.08,
      type: 'spring',
      stiffness: 100,
    }}
  >
    <Link href={href} className="group block h-full">
      <div className="relative h-full rounded-2xl p-px transition-all duration-500 group-hover:scale-[1.02] bg-primary/10">
        <Card
          className="relative h-full bg-card/80 backdrop-blur-xl border-0 rounded-2xl overflow-hidden transition-all duration-500"
          style={{ boxShadow: '0 0 0 rgba(0,0,0,0)' }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = `0 20px 40px -15px ${shadowColor}`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
          }}
        >
          <div
            className={`absolute -top-16 -right-16 w-32 h-32 bg-linear-to-br ${gradient} rounded-full opacity-20 blur-3xl group-hover:opacity-40 group-hover:scale-150 transition-all duration-700`}
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
          <CardHeader className="relative z-10 flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground/80">
                {description}
              </CardDescription>
              <div className="flex items-center gap-2 pt-1">
                <div
                  className={`h-1 w-0 group-hover:w-10 bg-linear-to-r ${gradient} rounded-full transition-all duration-500`}
                />
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  Эхлэх
                </span>
              </div>
            </div>
            <div
              className={`p-3.5 rounded-xl bg-linear-to-br ${gradient} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shrink-0`}
            >
              {icon}
            </div>
          </CardHeader>
        </Card>
      </div>
    </Link>
  </motion.div>
);

export default function JapaneseToolsPage() {
  return (
    <ToolPageShell
      title="Япон хэл"
      eyebrow="Хэл сурах"
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/tools' },
        { label: 'Япон хэл' },
      ]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {japaneseTools.map((tool, index) => (
          <SkillCard key={tool.title} {...tool} index={index} />
        ))}
      </div>
    </ToolPageShell>
  );
}
