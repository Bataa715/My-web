'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Bot,
  Settings,
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import BackButton from '@/components/shared/BackButton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useEditMode } from '@/contexts/EditModeContext';

interface Tool {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
  shadowColor: string;
}

const allTools: Tool[] = [
  {
    id: 'english',
    title: 'Англи хэл',
    description: 'Англи хэл сурах хэрэгслүүд',
    href: '/tools/english',
    icon: <BookOpen className="h-7 w-7" />,
    gradient: 'from-blue-500 to-cyan-400',
    shadowColor: 'rgba(59, 130, 246, 0.5)',
  },
  {
    id: 'japanese',
    title: 'Япон хэл',
    description: 'Япон хэл сурах хэрэгслүүд',
    href: '/tools/japanese',
    icon: <BookOpen className="h-7 w-7" />,
    gradient: 'from-rose-500 to-pink-400',
    shadowColor: 'rgba(244, 63, 94, 0.5)',
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    description: 'Portfolio мэдээлэл засах, QR код',
    href: '/tools/portfolio',
    icon: <User className="h-7 w-7" />,
    gradient: 'from-violet-500 to-purple-400',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
  },
  {
    id: 'todo',
    title: 'Todo List',
    description: 'Хийх зүйлсийн жагсаалт',
    href: '/tools/todo',
    icon: <ListTodo className="h-7 w-7" />,
    gradient: 'from-green-500 to-emerald-400',
    shadowColor: 'rgba(16, 185, 129, 0.5)',
  },
  {
    id: 'fitness',
    title: 'Fitness Tracker',
    description: 'Биеийн тамирын дасгал хянах хэрэгсэл',
    href: '/tools/fitness',
    icon: <LayoutGrid className="h-7 w-7" />,
    gradient: 'from-emerald-500 to-teal-400',
    shadowColor: 'rgba(16, 185, 129, 0.5)',
  },
  {
    id: 'programming',
    title: 'Програмчлал',
    description: 'Код бичиж сурах хэрэгслүүд',
    href: '/tools/programming',
    icon: <CodeIcon className="h-7 w-7" />,
    gradient: 'from-orange-500 to-amber-400',
    shadowColor: 'rgba(249, 115, 22, 0.5)',
  },
  {
    id: 'trader-ai',
    title: 'TraderAi',
    description: 'AI-аар алтны ханшийн зураг шинжлэх',
    href: '/tools/trader-ai',
    icon: <TrendingUp className="h-7 w-7" />,
    gradient: 'from-yellow-500 to-lime-400',
    shadowColor: 'rgba(234, 179, 8, 0.5)',
  },
  {
    id: 'pomodoro',
    title: 'Pomodoro Timer',
    description: 'Төвлөрлийг сайжруулах цаг',
    href: '/tools/pomodoro',
    icon: <Timer className="h-7 w-7" />,
    gradient: 'from-red-500 to-rose-400',
    shadowColor: 'rgba(239, 68, 68, 0.5)',
  },
  {
    id: 'ai-chat',
    title: 'AI Туслах',
    description: 'Хичээлтэй холбоотой асуултад хариулах AI',
    href: '/tools/ai-chat',
    icon: <Bot className="h-7 w-7" />,
    gradient: 'from-indigo-500 to-blue-400',
    shadowColor: 'rgba(99, 102, 241, 0.5)',
  },
];

interface ToolSettings {
  [toolId: string]: {
    visible: boolean;
    order: number;
  };
}

export default function ToolsPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { isEditMode } = useEditMode();
  const [toolSettings, setToolSettings] = useState<ToolSettings>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize default settings
  useEffect(() => {
    const defaultSettings: ToolSettings = {};
    allTools.forEach((tool, index) => {
      defaultSettings[tool.id] = { visible: true, order: index };
    });
    setToolSettings(defaultSettings);
  }, []);

  // Load settings from Firestore
  useEffect(() => {
    async function loadSettings() {
      if (!firestore || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const settingsRef = doc(firestore, `users/${user.uid}/settings/tools`);
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const savedSettings = settingsSnap.data() as ToolSettings;
          // Merge with defaults to handle new tools
          const mergedSettings: ToolSettings = {};
          allTools.forEach((tool, index) => {
            mergedSettings[tool.id] = savedSettings[tool.id] || {
              visible: true,
              order: index,
            };
          });
          setToolSettings(mergedSettings);
        }
      } catch (error) {
        console.error('Error loading tool settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [firestore, user]);

  // Save settings to Firestore
  const saveSettings = async (newSettings: ToolSettings) => {
    setToolSettings(newSettings);

    if (!firestore || !user) return;

    try {
      const settingsRef = doc(firestore, `users/${user.uid}/settings/tools`);
      await setDoc(settingsRef, newSettings);
      toast({
        title: 'Амжилттай',
        description: 'Тохиргоо хадгалагдлаа.',
      });
    } catch (error) {
      console.error('Error saving tool settings:', error);
      toast({
        title: 'Алдаа',
        description: 'Тохиргоо хадгалахад алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  // Toggle tool visibility
  const toggleToolVisibility = (toolId: string) => {
    const newSettings = {
      ...toolSettings,
      [toolId]: {
        ...toolSettings[toolId],
        visible: !toolSettings[toolId]?.visible,
      },
    };
    saveSettings(newSettings);
  };

  // Show all tools
  const showAllTools = () => {
    const newSettings: ToolSettings = {};
    allTools.forEach((tool, index) => {
      newSettings[tool.id] = {
        visible: true,
        order: toolSettings[tool.id]?.order ?? index,
      };
    });
    saveSettings(newSettings);
  };

  // Hide all tools
  const hideAllTools = () => {
    const newSettings: ToolSettings = {};
    allTools.forEach((tool, index) => {
      newSettings[tool.id] = {
        visible: false,
        order: toolSettings[tool.id]?.order ?? index,
      };
    });
    saveSettings(newSettings);
  };

  // Get visible tools sorted by order
  const visibleTools = allTools
    .filter(tool => toolSettings[tool.id]?.visible !== false)
    .sort(
      (a, b) =>
        (toolSettings[a.id]?.order ?? 0) - (toolSettings[b.id]?.order ?? 0)
    );

  const hiddenCount = allTools.length - visibleTools.length;

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
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Хэрэгслүүд
            </h1>
            
            {/* Settings Button - Only visible in edit mode */}
            {isEditMode && (
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-primary/30 hover:border-primary hover:bg-primary/10"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Хэрэгслүүдийн тохиргоо
                  </DialogTitle>
                  <DialogDescription>
                    Харуулах болон нуух хэрэгслүүдийг сонгоно уу.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showAllTools}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Бүгдийг харуулах
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={hideAllTools}
                    className="flex-1"
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Бүгдийг нуух
                  </Button>
                </div>

                <ScrollArea className="max-h-[400px] pr-4">
                  <div className="space-y-3">
                    {allTools.map(tool => (
                      <div
                        key={tool.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          toolSettings[tool.id]?.visible !== false
                            ? 'bg-card border-primary/20'
                            : 'bg-muted/50 border-muted opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${tool.gradient} text-white`}
                          >
                            {tool.icon}
                          </div>
                          <div>
                            <p className="font-medium">{tool.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={toolSettings[tool.id]?.visible !== false}
                          onCheckedChange={() => toggleToolVisibility(tool.id)}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="text-sm text-muted-foreground text-center pt-2">
                  {visibleTools.length} харагдаж байна • {hiddenCount} нуугдсан
                </div>
              </DialogContent>
            </Dialog>
            )}
          </div>
          
          {isEditMode && hiddenCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {hiddenCount} хэрэгсэл нуугдсан •{' '}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-primary hover:underline"
              >
                Тохиргоо
              </button>
            </p>
          )}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
          <AnimatePresence mode="popLayout">
            {visibleTools.map((tool, i) => (
              <motion.div
                key={tool.id}
                layout
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
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
          </AnimatePresence>
        </div>

        {/* Empty state when all tools are hidden */}
        {visibleTools.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <EyeOff className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Бүх хэрэгсэл нуугдсан</h3>
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
