'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import {
  Timer,
  Code as CodeIcon,
  BookOpen,
  LayoutGrid,
  ListTodo,
  Bot,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';
import { type Tool } from '@/components/tools/ToolCard';
import { cn } from '@/lib/utils';

// Lazy: heavy canvas — render after first paint
const InteractiveParticles = dynamic(
  () => import('@/components/shared/InteractiveParticles'),
  { ssr: false }
);

const allTools: Tool[] = [
  {
    id: 'english',
    title: 'Англи хэл',
    description: 'Үг сурах · Дүрэм · Дасгал',
    href: '/tools/english',
    icon: <BookOpen className="h-7 w-7" />,
    gradient: 'from-blue-500 to-cyan-400',
    shadowColor: 'rgba(59, 130, 246, 0.5)',
    glow: '59, 130, 246',
    accent: '#3b82f6',
    tag: 'Хэл',
  },
  {
    id: 'japanese',
    title: 'Япон хэл',
    description: 'Hiragana · Katakana · Kanji',
    href: '/tools/japanese',
    icon: <BookOpen className="h-7 w-7" />,
    gradient: 'from-rose-500 to-pink-400',
    shadowColor: 'rgba(244, 63, 94, 0.5)',
    glow: '244, 63, 94',
    accent: '#f43f5e',
    tag: 'Хэл',
  },
  {
    id: 'todo',
    title: 'Todo List',
    description: 'Хийх ажил · Тэмдэглэл',
    href: '/tools/todo',
    icon: <ListTodo className="h-7 w-7" />,
    gradient: 'from-green-500 to-emerald-400',
    shadowColor: 'rgba(16, 185, 129, 0.5)',
    glow: '16, 185, 129',
    accent: '#10b981',
    tag: 'Бүтээмж',
  },
  {
    id: 'fitness',
    title: 'Fitness Tracker',
    description: 'Дасгал · Биеийн жин',
    href: '/tools/fitness',
    icon: <LayoutGrid className="h-7 w-7" />,
    gradient: 'from-emerald-500 to-teal-400',
    shadowColor: 'rgba(16, 185, 129, 0.5)',
    glow: '20, 184, 166',
    accent: '#14b8a6',
    tag: 'Эрүүл',
  },
  {
    id: 'programming',
    title: 'Програмчлал',
    description: 'Алгоритм · HTML · JS',
    href: '/tools/programming',
    icon: <CodeIcon className="h-7 w-7" />,
    gradient: 'from-orange-500 to-amber-400',
    shadowColor: 'rgba(249, 115, 22, 0.5)',
    glow: '249, 115, 22',
    accent: '#f97316',
    tag: 'Код',
  },
  {
    id: 'pomodoro',
    title: 'Pomodoro Timer',
    description: 'Төвлөрөл · 25 минут циклүүд',
    href: '/tools/pomodoro',
    icon: <Timer className="h-7 w-7" />,
    gradient: 'from-red-500 to-rose-400',
    shadowColor: 'rgba(239, 68, 68, 0.5)',
    glow: '239, 68, 68',
    accent: '#ef4444',
    tag: 'Бүтээмж',
  },
  {
    id: 'ai-chat',
    title: 'AI Туслах',
    description: 'Хичээлийн чат туслах',
    href: '/tools/ai-chat',
    icon: <Bot className="h-7 w-7" />,
    gradient: 'from-indigo-500 to-blue-400',
    shadowColor: 'rgba(99, 102, 241, 0.5)',
    glow: '99, 102, 241',
    accent: '#6366f1',
    tag: 'AI',
  },
  {
    id: 'finance',
    title: 'Санхүүгийн Бүртгэл',
    description: 'Орлого · Зарлага · Хадгаламж',
    href: '/tools/finance',
    icon: <Wallet className="h-7 w-7" />,
    gradient: 'from-emerald-500 to-green-400',
    shadowColor: 'rgba(16, 185, 129, 0.5)',
    glow: '16, 185, 129',
    accent: '#10b981',
    tag: 'Санхүү',
  },
];

export default function ToolsPage() {
  const [[current, direction], setPage] = useState([0, 0]);

  const paginate = (dir: number) => {
    const next = current + dir;
    if (next < 0 || next >= allTools.length) return;
    setPage([next, dir]);
  };

  const goTo = (i: number) => setPage([i, i > current ? 1 : -1]);

  const tool = allTools[current];

  return (
    <MotionConfig reducedMotion="user">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative min-h-screen"
    >
      <InteractiveParticles quantity={40} />

      <div className="relative z-10 flex flex-col min-h-screen px-4 md:px-6 pt-6 pb-16">
        <PageHeader eyebrow="Хэрэгслүүд" />

        <div className="flex-1 flex flex-col items-center justify-center gap-8 mt-6">

          {/* ── Carousel card ── */}
          <div className="relative w-full max-w-lg overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={current}
                custom={direction}
                variants={{
                  enter: (d: number) => ({
                    opacity: 0,
                    x: d > 0 ? '60%' : '-60%',
                    scale: 0.93,
                  }),
                  center: { opacity: 1, x: '0%', scale: 1 },
                  exit: (d: number) => ({
                    opacity: 0,
                    x: d > 0 ? '-60%' : '60%',
                    scale: 0.93,
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) paginate(1);
                  else if (info.offset.x > 60) paginate(-1);
                }}
                className="w-full cursor-grab active:cursor-grabbing select-none"
              >
                <CarouselCard tool={tool} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Nav arrows + pill dots ── */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => paginate(-1)}
              disabled={current === 0}
              className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground transition-all duration-200 hover:border-foreground/40 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {allTools.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-300"
                  style={
                    i === current
                      ? { width: 24, height: 8, background: tool.accent }
                      : { width: 8, height: 8, background: 'rgba(120,120,140,0.35)' }
                  }
                />
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              disabled={current === allTools.length - 1}
              className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground transition-all duration-200 hover:border-foreground/40 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* ── Tool chip strip (label + colored border, no icon) ── */}
          <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl">
            {allTools.map((t, i) => {
              const active = i === current;
              return (
                <button
                  key={t.id}
                  onClick={() => goTo(i)}
                  title={t.title}
                  className={cn(
                    'group/chip relative rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 backdrop-blur-sm',
                    'border-2 overflow-hidden',
                    active ? 'scale-105' : 'hover:scale-105 opacity-70 hover:opacity-100'
                  )}
                  style={{
                    borderColor: active ? t.accent : `rgba(${t.glow}, 0.35)`,
                    background: active
                      ? `linear-gradient(135deg, rgba(${t.glow},0.18), rgba(${t.glow},0.04))`
                      : 'rgba(255,255,255,0.02)',
                    color: active ? t.accent : undefined,
                    boxShadow: active
                      ? `0 8px 24px -8px rgba(${t.glow}, 0.55), inset 0 0 0 1px rgba(${t.glow}, 0.25)`
                      : 'none',
                  }}
                >
                  {/* Animated shine on hover */}
                  <span
                    className="pointer-events-none absolute inset-0 -translate-x-full group-hover/chip:translate-x-full transition-transform duration-700 ease-out"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(${t.glow},0.25), transparent)`,
                    }}
                    aria-hidden
                  />
                  {/* Active dot */}
                  {active && (
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full mr-2 align-middle"
                      style={{
                        background: t.accent,
                        boxShadow: `0 0 8px ${t.accent}`,
                      }}
                      aria-hidden
                    />
                  )}
                  <span className="relative">{t.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
    </MotionConfig>
  );
}

/* ─── Big carousel card (no icon, bold colored border) ─── */
function CarouselCard({ tool }: { tool: Tool }) {
  return (
    <Link href={tool.href} className="block group">
      {/* Outer gradient border ring */}
      <div
        className="relative rounded-3xl p-[2px] transition-all duration-500 group-hover:p-[3px]"
        style={{
          background: `linear-gradient(135deg, ${tool.accent}, rgba(${tool.glow}, 0.25) 45%, transparent 70%, ${tool.accent})`,
          boxShadow: `0 18px 48px -22px rgba(${tool.glow}, 0.45)`,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 32px 70px -20px rgba(${tool.glow}, 0.7), 0 0 0 1px rgba(${tool.glow}, 0.35)`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 18px 48px -22px rgba(${tool.glow}, 0.45)`;
        }}
      >
        <div className="relative rounded-[22px] bg-card overflow-hidden">
          {/* Soft tinted top wash */}
          <div
            className="absolute inset-x-0 top-0 h-44 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at top, rgba(${tool.glow}, 0.22), transparent 70%)`,
            }}
            aria-hidden
          />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              color: tool.accent,
            }}
            aria-hidden
          />
          {/* Glow blob */}
          <div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-70 pointer-events-none"
            style={{ background: tool.accent }}
            aria-hidden
          />

          {/* ── Content ── */}
          <div className="relative p-8 md:p-10 min-h-[320px] flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              {/* Tag */}
              <span
                className="text-[10px] tracking-[0.2em] uppercase font-bold px-3 py-1.5 rounded-full border-2 backdrop-blur-sm"
                style={{
                  borderColor: `rgba(${tool.glow}, 0.5)`,
                  color: tool.accent,
                  background: `rgba(${tool.glow}, 0.08)`,
                }}
              >
                {tool.tag}
              </span>
              {/* Pulse dot */}
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ background: tool.accent }}
                />
                <span
                  className="relative inline-flex rounded-full h-2.5 w-2.5"
                  style={{
                    background: tool.accent,
                    boxShadow: `0 0 12px ${tool.accent}`,
                  }}
                />
              </span>
            </div>

            <div className="mt-10">
              <h2
                className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--foreground)), ${tool.accent})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {tool.title}
              </h2>
              <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
                {tool.description}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-10">
              <span
                className="h-[2px] rounded-full transition-all duration-500"
                style={{
                  background: `linear-gradient(90deg, ${tool.accent}, transparent)`,
                  width: '32px',
                }}
                aria-hidden
              />
              <span
                className="text-sm font-bold tracking-wide transition-all duration-300 group-hover:tracking-widest"
                style={{ color: tool.accent }}
              >
                Нээх
              </span>
              <span
                className="ml-auto h-11 w-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:translate-x-1"
                style={{
                  borderColor: `rgba(${tool.glow}, 0.5)`,
                  background: `rgba(${tool.glow}, 0.1)`,
                  color: tool.accent,
                }}
              >
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
