'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
  BookText,
  Ear,
  Mic,
  Pencil,
  Brain,
  BookCopy,
  Sparkles,
} from 'lucide-react';
import BackButton from '@/components/shared/BackButton';
import InteractiveParticles from '@/components/shared/InteractiveParticles';

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
      <div
        className="relative h-full rounded-2xl p-[1px] transition-all duration-500 group-hover:scale-[1.02]"
        style={{
          background: `linear-gradient(135deg, ${gradient.includes('rose') ? '#f43f5e' : gradient.includes('violet') ? '#8b5cf6' : gradient.includes('blue') ? '#3b82f6' : gradient.includes('orange') ? '#f97316' : gradient.includes('emerald') ? '#10b981' : '#ef4444'}40, transparent)`,
        }}
      >
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
          {/* Background gradient blob */}
          <div
            className={`absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full opacity-20 blur-3xl group-hover:opacity-40 group-hover:scale-150 transition-all duration-700`}
          />

          {/* Shimmer effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>

          <CardHeader className="relative z-10 flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground/80">
                {description}
              </CardDescription>
              {/* Accent line */}
              <div className="flex items-center gap-2 pt-1">
                <div
                  className={`h-1 w-0 group-hover:w-10 bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                />
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  Эхлэх
                </span>
              </div>
            </div>
            <div
              className={`p-3.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shrink-0`}
            >
              {icon}
            </div>
          </CardHeader>

          {/* Arrow indicator */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <ArrowRight className="h-5 w-5 text-primary" />
          </div>
        </Card>
      </div>
    </Link>
  </motion.div>
);

export default function JapaneseToolsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative min-h-screen"
    >
      <InteractiveParticles quantity={50} />
      <div className="space-y-8 px-4 md:px-6 relative z-10 pb-16">
        <BackButton />

        {/* Hero Section */}
        <div className="text-center pt-8 pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-6"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">日本語を学ぶ</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Япон хэл
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
            Чадваруудаа сонгож хичээллээрэй
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {japaneseTools.map((tool, index) => (
            <SkillCard key={tool.title} {...tool} index={index} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
