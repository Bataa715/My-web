'use client';

/**
 * Tools page — pure cosmic galaxy navigation.
 * Every tool is a planet orbiting a glowing core star; clicking a planet
 * navigates straight into that tool. No carousel, no chips — the galaxy
 * itself is the menu.
 */
import React, { useEffect, useState } from 'react';
import {
  motion,
  MotionConfig,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
} from 'framer-motion';
import {
  Timer,
  Code as CodeIcon,
  BookOpen,
  LayoutGrid,
  ListTodo,
  Bot,
  Wallet,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';
import { type Tool } from '@/components/tools/ToolCard';

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

/* ─── One orbiting tool-planet: a direct link into the tool ─── */
function OrbitPlanet({
  tool,
  index,
  total,
}: {
  tool: Tool;
  index: number;
  total: number;
}) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [radius, setRadius] = useState(170);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setRadius(w >= 1024 ? 280 : w >= 640 ? 210 : Math.max(120, Math.round(w * 0.36)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const SPEED_MS = 80000;
  const initialAngle = (index / Math.max(total, 1)) * 2 * Math.PI;
  const x = useMotionValue(Math.cos(initialAngle) * radius);
  const y = useMotionValue(Math.sin(initialAngle) * radius * 0.34);
  const scale = useMotionValue(1);
  const zIndex = useMotionValue(30);

  useAnimationFrame(t => {
    // Hover (or reduced-motion) freezes the orbit so the planet is easy to hit
    const a =
      reduce || hovered
        ? initialAngle
        : initialAngle + (t / SPEED_MS) * 2 * Math.PI;
    const sinA = Math.sin(a);
    x.set(Math.cos(a) * radius);
    y.set(sinA * radius * 0.34);
    scale.set(0.82 + 0.28 * ((sinA + 1) / 2));
    zIndex.set(sinA >= 0 ? 30 : 5);
  });

  return (
    <motion.div
      className="absolute pointer-events-auto"
      style={{
        top: '50%',
        left: '50%',
        width: 64,
        height: 64,
        x,
        y,
        scale,
        zIndex,
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.06 }}
    >
      <div
        className="relative group h-full w-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Hover glow halo */}
        <div
          className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle, rgba(${tool.glow}, 0.75) 0%, transparent 70%)`,
            filter: 'blur(10px)',
          }}
        />
        {/* Planet = direct link into the tool */}
        <Link
          href={tool.href}
          aria-label={tool.title}
          className="relative block h-full w-full rounded-full overflow-hidden border-2 transition-transform duration-300 group-hover:scale-115 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{
            background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.42) 0%, ${tool.accent} 40%, rgba(${tool.glow}, 0.45) 78%, rgba(5,5,15,0.55) 100%)`,
            borderColor: 'rgba(255,255,255,0.18)',
            boxShadow: `0 0 16px rgba(${tool.glow}, 0.45), inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
        >
          {/* Specular highlight — sells the sphere */}
          <span
            className="absolute rounded-full bg-white/40 blur-[2px]"
            style={{ top: '10%', left: '18%', width: '30%', height: '20%' }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] [&_svg]:h-6 [&_svg]:w-6">
            {tool.icon}
          </span>
        </Link>
        {/* Always-visible name label — the galaxy IS the menu */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold tracking-wide pointer-events-none transition-all duration-200 group-hover:scale-110"
          style={{
            color: tool.accent,
            textShadow: `0 0 10px rgba(${tool.glow}, 0.8), 0 1px 3px rgba(0,0,0,0.8)`,
          }}
        >
          {tool.title}
        </div>
      </div>
    </motion.div>
  );
}

export default function ToolsPage() {
  const reduce = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative min-h-screen aurora-sweep"
    >
      <div className="relative z-10 flex flex-col min-h-screen px-4 md:px-6 pt-6 pb-16">
        <PageHeader eyebrow="Хэрэгслүүд" icon={<Sparkles className="h-3.5 w-3.5" />}>
          <h1 className="font-display glow-text text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Хэрэгслийн галактик
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Гараг дээр дарж хэрэгслээ шууд нээгээрэй.
          </p>
        </PageHeader>

        {/* ── GALAXY — planets orbit the core; each planet opens its tool ── */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-[720px] h-[340px] sm:h-[420px] lg:h-[500px]">
            {/* Ring guides */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="absolute w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] lg:w-[560px] lg:h-[560px] rounded-full"
                style={{
                  border: '1.5px solid hsl(var(--primary)/0.4)',
                  transform: 'scaleY(0.34)',
                  filter: 'drop-shadow(0 0 8px hsl(var(--primary)/0.35))',
                }}
              />
              <div
                className="absolute w-[300px] h-[300px] sm:w-[466px] sm:h-[466px] lg:w-[612px] lg:h-[612px] rounded-full"
                style={{
                  border: '1px dashed hsl(var(--accent)/0.22)',
                  transform: 'scaleY(0.34) rotate(12deg)',
                }}
              />
              {/* Core star */}
              <motion.div
                className="absolute rounded-full"
                style={{ width: 96, height: 96 }}
                animate={reduce ? undefined : { scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.95) 0%, hsl(var(--primary)) 38%, hsl(var(--accent)) 74%, transparent 100%)',
                    boxShadow:
                      '0 0 40px 12px hsl(var(--primary)/0.5), 0 0 110px 36px hsl(var(--accent)/0.22)',
                  }}
                />
              </motion.div>
            </div>

            {allTools.map((t, i) => (
              <OrbitPlanet key={t.id} tool={t} index={i} total={allTools.length} />
            ))}
          </div>
        </div>

        {/* Hint */}
        <p className="text-center text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground/60 pb-2">
          ✦ Гараг сонгоод аялаарай ✦
        </p>
      </div>
    </motion.div>
    </MotionConfig>
  );
}
