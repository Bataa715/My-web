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
  Timer,
  Code as CodeIcon,
  BookOpen,
  LayoutGrid,
  TrendingUp,
  User,
  Sparkles,
  ListTodo,
} from 'lucide-react';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import BackButton from '@/components/shared/BackButton';

const tools = [
  {
    title: 'Англи хэл',
    description: 'Англи хэл сурах хэрэгслүүд',
    href: '/tools/english',
    icon: <BookOpen className="h-7 w-7" />,
    gradient: 'from-blue-500 to-cyan-400',
    shadowColor: 'rgba(59, 130, 246, 0.5)',
  },
  {
    title: 'Япон хэл',
    description: 'Япон хэл сурах хэрэгслүүд',
    href: '/tools/japanese',
    icon: <BookOpen className="h-7 w-7" />,
    gradient: 'from-rose-500 to-pink-400',
    shadowColor: 'rgba(244, 63, 94, 0.5)',
  },
  {
    title: 'Portfolio',
    description: 'Portfolio мэдээлэл засах, QR код',
    href: '/tools/portfolio',
    icon: <User className="h-7 w-7" />,
    gradient: 'from-violet-500 to-purple-400',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
  },
  {
    title: 'Todo List',
    description: 'Хийх зүйлсийн жагсаалт',
    href: '/tools/todo',
    icon: <ListTodo className="h-7 w-7" />,
    gradient: 'from-green-500 to-emerald-400',
    shadowColor: 'rgba(16, 185, 129, 0.5)',
  },
  {
    title: 'Workspace',
    description: 'Хувийн ажлын самбар, төлөвлөгч',
    href: '/tools/notes',
    icon: <LayoutGrid className="h-7 w-7" />,
    gradient: 'from-emerald-500 to-teal-400',
    shadowColor: 'rgba(16, 185, 129, 0.5)',
  },
  {
    title: 'Програмчлал',
    description: 'Код бичиж сурах хэрэгслүүд',
    href: '/tools/programming',
    icon: <CodeIcon className="h-7 w-7" />,
    gradient: 'from-orange-500 to-amber-400',
    shadowColor: 'rgba(249, 115, 22, 0.5)',
  },
  {
    title: 'TraderAi',
    description: 'AI-аар алтны ханшийн зураг шинжлэх',
    href: '/tools/trader-ai',
    icon: <TrendingUp className="h-7 w-7" />,
    gradient: 'from-yellow-500 to-lime-400',
    shadowColor: 'rgba(234, 179, 8, 0.5)',
  },
  {
    title: 'Pomodoro Timer',
    description: 'Төвлөрлийг сайжруулах цаг',
    href: '/tools/pomodoro',
    icon: <Timer className="h-7 w-7" />,
    gradient: 'from-red-500 to-rose-400',
    shadowColor: 'rgba(239, 68, 68, 0.5)',
  },
];

export default function ToolsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative min-h-screen"
    >
      <InteractiveParticles quantity={60} />
      <div className="space-y-8 px-4 md:px-6 relative z-10 pb-16">
        <BackButton />

        {/* Hero Section */}
        <div className="text-center pt-8 pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Бүтээмжээ нэмэгдүүл</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            Хэрэгслүүд
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
            Суралцах, ажиллах, амьдралаа зохион байгуулахад туслах хэрэгслүүд
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                type: 'spring',
                stiffness: 100,
              }}
            >
              <Link href={tool.href} className="group block h-full">
                <div
                  className="relative h-full rounded-2xl p-[1px] transition-all duration-500 group-hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${tool.gradient.includes('blue') ? '#3b82f6' : tool.gradient.includes('rose') ? '#f43f5e' : tool.gradient.includes('violet') ? '#8b5cf6' : tool.gradient.includes('emerald') ? '#10b981' : tool.gradient.includes('orange') ? '#f97316' : tool.gradient.includes('yellow') ? '#eab308' : tool.gradient.includes('green') ? '#22c55e' : '#ef4444'}40, transparent)`,
                  }}
                >
                  <Card
                    className="relative h-full bg-card/80 backdrop-blur-xl border-0 rounded-2xl overflow-hidden transition-all duration-500"
                    style={{
                      boxShadow: `0 0 0 rgba(0,0,0,0)`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = `0 20px 40px -15px ${tool.shadowColor}`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = `0 0 0 rgba(0,0,0,0)`;
                    }}
                  >
                    {/* Background gradient blob */}
                    <div
                      className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${tool.gradient} rounded-full opacity-20 blur-3xl group-hover:opacity-40 group-hover:scale-150 transition-all duration-700`}
                    />

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>

                    <CardHeader className="relative z-10 pb-2">
                      <div className="flex items-start justify-between">
                        <div
                          className={`p-3.5 rounded-xl bg-gradient-to-br ${tool.gradient} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                        >
                          {tool.icon}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="relative z-10 pt-4">
                      <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground/80 line-clamp-2">
                        {tool.description}
                      </CardDescription>

                      {/* Bottom accent line */}
                      <div className="mt-4 flex items-center gap-2">
                        <div
                          className={`h-1 w-0 group-hover:w-12 bg-gradient-to-r ${tool.gradient} rounded-full transition-all duration-500`}
                        />
                        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                          Нээх
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
