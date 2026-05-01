'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  Code as CodeIcon,
  BookOpen,
  LayoutGrid,
  TrendingUp,
  User,
  Sparkles,
  ListTodo,
  Bot,
  Settings,
  EyeOff,
} from 'lucide-react';
import BackButton from '@/components/shared/BackButton';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useEditMode } from '@/contexts/EditModeContext';
import ToolCard, { type Tool } from '@/components/tools/ToolCard';
import type { ToolSettings } from '@/components/tools/ToolSettingsDialog';

// Lazy: only loaded if user actually opens settings (edit mode)
const ToolSettingsDialog = dynamic(
  () => import('@/components/tools/ToolSettingsDialog'),
  { ssr: false, loading: () => null }
);

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
    id: 'portfolio',
    title: 'Portfolio',
    description: 'Портфолио засах · QR · линк',
    href: '/tools/portfolio',
    icon: <User className="h-7 w-7" />,
    gradient: 'from-violet-500 to-purple-400',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    glow: '139, 92, 246',
    accent: '#8b5cf6',
    tag: 'Хувийн',
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
    id: 'trader-ai',
    title: 'TraderAi',
    description: 'AI алтны зураг шинжилгээ',
    href: '/tools/trader-ai',
    icon: <TrendingUp className="h-7 w-7" />,
    gradient: 'from-yellow-500 to-lime-400',
    shadowColor: 'rgba(234, 179, 8, 0.5)',
    glow: '234, 179, 8',
    accent: '#eab308',
    tag: 'AI',
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
];

const ALL_CATEGORIES = 'Бүгд';

const uniqueCategories = [
  ALL_CATEGORIES,
  ...Array.from(new Set(allTools.map(t => t.tag))),
];

export default function ToolsPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { isEditMode } = useEditMode();
  const [toolSettings, setToolSettings] = useState<ToolSettings>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);

  useEffect(() => {
    const defaults: ToolSettings = {};
    allTools.forEach((tool, index) => {
      defaults[tool.id] = { visible: true, order: index };
    });
    setToolSettings(defaults);
  }, []);

  useEffect(() => {
    async function loadSettings() {
      if (!firestore || !user) {
        setIsLoading(false);
        return;
      }
      try {
        const ref = doc(firestore, `users/${user.uid}/settings/tools`);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const saved = snap.data() as ToolSettings;
          const merged: ToolSettings = {};
          allTools.forEach((tool, index) => {
            merged[tool.id] = saved[tool.id] || { visible: true, order: index };
          });
          setToolSettings(merged);
        }
      } catch (error) {
        console.error('Error loading tool settings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [firestore, user]);

  const saveSettings = async (newSettings: ToolSettings) => {
    setToolSettings(newSettings);
    if (!firestore || !user) return;
    try {
      const ref = doc(firestore, `users/${user.uid}/settings/tools`);
      await setDoc(ref, newSettings);
      toast({ title: 'Амжилттай', description: 'Тохиргоо хадгалагдлаа.' });
    } catch (error) {
      console.error('Error saving tool settings:', error);
      toast({
        title: 'Алдаа',
        description: 'Тохиргоо хадгалахад алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  const toggleTool = (toolId: string) => {
    saveSettings({
      ...toolSettings,
      [toolId]: {
        ...toolSettings[toolId],
        visible: !toolSettings[toolId]?.visible,
      },
    });
  };

  const showAll = () => {
    const next: ToolSettings = {};
    allTools.forEach((t, i) => {
      next[t.id] = { visible: true, order: toolSettings[t.id]?.order ?? i };
    });
    saveSettings(next);
  };

  const hideAll = () => {
    const next: ToolSettings = {};
    allTools.forEach((t, i) => {
      next[t.id] = { visible: false, order: toolSettings[t.id]?.order ?? i };
    });
    saveSettings(next);
  };

  const visibleTools = useMemo(
    () =>
      allTools
        .map(tool => ({
          ...tool,
          order:
            toolSettings[tool.id]?.order ??
            allTools.findIndex(t => t.id === tool.id),
        }))
        .filter(tool => toolSettings[tool.id]?.visible !== false)
        .sort((a, b) => a.order - b.order),
    [toolSettings]
  );

  const filteredTools = useMemo(
    () =>
      selectedCategory === ALL_CATEGORIES
        ? visibleTools
        : visibleTools.filter(t => t.tag === selectedCategory),
    [visibleTools, selectedCategory]
  );

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = { [ALL_CATEGORIES]: visibleTools.length };
    visibleTools.forEach(t => {
      counts[t.tag] = (counts[t.tag] ?? 0) + 1;
    });
    return counts;
  }, [visibleTools]);

  const hiddenCount = allTools.length - visibleTools.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative min-h-screen"
    >
      <InteractiveParticles quantity={40} />
      <div className="space-y-8 px-4 md:px-6 relative z-10 pb-16">
        <BackButton />

        <div className="relative pt-6">
          <PageHeader
            eyebrow="Хэрэгслүүд"
            icon={<Sparkles className="h-3.5 w-3.5" />}
            title="Бүтээмж · Сурах · AI"
            description="Англи · Япон хэл, программчлал болон бүтээмжийн хэрэгслүүдийг нэг дороос ашигла."
          />

          {isEditMode && (
            <div className="absolute top-2 right-0">
              <ToolSettingsDialog
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
                allTools={allTools}
                toolSettings={toolSettings}
                visibleCount={visibleTools.length}
                hiddenCount={hiddenCount}
                onToggle={toggleTool}
                onShowAll={showAll}
                onHideAll={hideAll}
              />
            </div>
          )}
        </div>

        {isEditMode && hiddenCount > 0 && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {hiddenCount} хэрэгсэл нуугдсан •{' '}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-primary hover:underline"
            >
              Тохиргоо
            </button>
          </p>
        )}

        {/* ── Category filter tabs ── */}
        {!isLoading && visibleTools.length > 0 && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`filter-tab ${selectedCategory === cat ? 'filter-tab-active' : ''}`}
              >
                {cat}
                <span
                  className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold ml-0.5"
                  style={{
                    background: selectedCategory === cat
                      ? 'hsl(var(--primary) / 0.2)'
                      : 'hsl(var(--muted))',
                    color: selectedCategory === cat
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground))',
                  }}
                >
                  {categoryCount[cat] ?? 0}
                </span>
              </button>
            ))}
          </div>
        )}

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 pt-2"
          style={{ perspective: '1500px' }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl min-h-[230px] skeleton"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))
            : (
              <AnimatePresence initial={false}>
                {filteredTools.map((tool, idx) => (
                  <ToolCard key={tool.id} tool={tool} index={idx} />
                ))}
              </AnimatePresence>
            )}
        </div>

        {filteredTools.length === 0 && !isLoading && visibleTools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-sm">
              <span className="font-semibold text-foreground">{selectedCategory}</span>{' '}
              ангилалд хэрэгсэл олдсонгүй.
            </p>
            <button
              onClick={() => setSelectedCategory(ALL_CATEGORIES)}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Бүгдийг харах
            </button>
          </motion.div>
        )}

        {visibleTools.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <EyeOff className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Бүх хэрэгсэл нуугдсан
            </h3>
            <p className="text-muted-foreground mb-4">
              Тохиргооноос хэрэгслүүдийг харуулна уу.
            </p>
            <Button onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Тохиргоо нээх
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
