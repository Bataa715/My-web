'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Settings,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  FolderKanban,
  Sparkles,
} from 'lucide-react';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useEditMode } from '@/contexts/EditModeContext';

// Lazy load heavy components for better performance
const Hero = dynamic(() => import('@/components/sections/hero'), {
  loading: () => <div className="w-full min-h-[calc(100vh-120px)]" />,
});

const InteractiveParticles = dynamic(
  () => import('@/components/shared/InteractiveParticles'),
  { ssr: false }
);

const Education = dynamic(() => import('@/components/sections/Education'), {
  loading: () => <div className="w-full min-h-[400px]" />,
});
const Skills = dynamic(() => import('@/components/sections/skills'), {
  loading: () => <div className="w-full min-h-[400px]" />,
});
const Projects = dynamic(() => import('@/components/sections/projects'), {
  loading: () => <div className="w-full min-h-[400px]" />,
});
const Experience = dynamic(() => import('@/components/sections/Experience'), {
  loading: () => <div className="w-full min-h-[400px]" />,
});

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  gradient: string;
}

interface SectionSettings {
  [sectionId: string]: {
    visible: boolean;
    order: number;
  };
}

export default function HomePage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { isEditMode } = useEditMode();
  const [sectionSettings, setSectionSettings] = useState<SectionSettings>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const allSections: Section[] = [
    {
      id: 'education',
      title: 'Боловсрол',
      icon: <GraduationCap className="h-5 w-5" />,
      component: (
        <Suspense fallback={<div className="w-full min-h-[400px]" />}>
          <Education />
        </Suspense>
      ),
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      id: 'skills',
      title: 'Ур чадвар',
      icon: <Sparkles className="h-5 w-5" />,
      component: (
        <Suspense fallback={<div className="w-full min-h-[400px]" />}>
          <Skills />
        </Suspense>
      ),
      gradient: 'from-purple-500 to-pink-400',
    },
    {
      id: 'projects',
      title: 'Миний төслүүд',
      icon: <FolderKanban className="h-5 w-5" />,
      component: (
        <Suspense fallback={<div className="w-full min-h-[400px]" />}>
          <Projects />
        </Suspense>
      ),
      gradient: 'from-orange-500 to-amber-400',
    },
    {
      id: 'experience',
      title: 'Миний туршлага',
      icon: <Briefcase className="h-5 w-5" />,
      component: (
        <Suspense fallback={<div className="w-full min-h-[400px]" />}>
          <Experience />
        </Suspense>
      ),
      gradient: 'from-green-500 to-emerald-400',
    },
  ];

  // Initialize default settings
  useEffect(() => {
    const defaultSettings: SectionSettings = {};
    allSections.forEach((section, index) => {
      defaultSettings[section.id] = { visible: true, order: index };
    });
    setSectionSettings(defaultSettings);
  }, []);

  // Load settings from Firestore
  useEffect(() => {
    async function loadSettings() {
      if (!firestore || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const settingsRef = doc(
          firestore,
          `users/${user.uid}/settings/sections`
        );
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const savedSettings = settingsSnap.data() as SectionSettings;
          const mergedSettings: SectionSettings = {};
          allSections.forEach((section, index) => {
            mergedSettings[section.id] = savedSettings[section.id] || {
              visible: true,
              order: index,
            };
          });
          setSectionSettings(mergedSettings);
        }
      } catch (error) {
        console.error('Error loading section settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [firestore, user]);

  // Save settings to Firestore
  const saveSettings = async (newSettings: SectionSettings) => {
    setSectionSettings(newSettings);

    if (!firestore || !user) return;

    try {
      const settingsRef = doc(firestore, `users/${user.uid}/settings/sections`);
      await setDoc(settingsRef, newSettings);
      toast({
        title: 'Амжилттай',
        description: 'Хэсгийн тохиргоо хадгалагдлаа.',
      });
    } catch (error) {
      console.error('Error saving section settings:', error);
      toast({
        title: 'Алдаа',
        description: 'Тохиргоо хадгалахад алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  // Toggle section visibility
  const toggleSectionVisibility = (sectionId: string) => {
    const newSettings = {
      ...sectionSettings,
      [sectionId]: {
        ...sectionSettings[sectionId],
        visible: !sectionSettings[sectionId]?.visible,
      },
    };
    saveSettings(newSettings);
  };

  // Show all sections
  const showAllSections = () => {
    const newSettings: SectionSettings = {};
    allSections.forEach((section, index) => {
      newSettings[section.id] = {
        visible: true,
        order: sectionSettings[section.id]?.order ?? index,
      };
    });
    saveSettings(newSettings);
  };

  // Hide all sections
  const hideAllSections = () => {
    const newSettings: SectionSettings = {};
    allSections.forEach((section, index) => {
      newSettings[section.id] = {
        visible: false,
        order: sectionSettings[section.id]?.order ?? index,
      };
    });
    saveSettings(newSettings);
  };

  // Get visible sections sorted by order
  const visibleSections = allSections
    .filter(section => sectionSettings[section.id]?.visible !== false)
    .sort(
      (a, b) =>
        (sectionSettings[a.id]?.order ?? 0) -
        (sectionSettings[b.id]?.order ?? 0)
    );

  const hiddenCount = allSections.length - visibleSections.length;

  return (
    <div className="relative">
      {/* Reduced particle count for better performance */}
      <InteractiveParticles quantity={15} />
      {/* Hero with reserved space to prevent CLS */}
      <div className="min-h-[80vh]">
        <Suspense fallback={<div className="w-full min-h-[80vh] bg-background" />}>
          <Hero />
        </Suspense>
      </div>

      {/* Section Settings Button - Fixed position, only visible in edit mode */}
      {isEditMode && (
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Хэсгүүдийн тохиргоо"
              className="fixed bottom-6 right-6 z-50 rounded-full h-12 w-12 shadow-lg border-primary/30 hover:border-primary hover:bg-primary/10 bg-background/80 backdrop-blur-sm"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Хэсгүүдийн тохиргоо
              </DialogTitle>
              <DialogDescription>
                Нүүр хуудсанд харуулах хэсгүүдийг сонгоно уу.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={showAllSections}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Бүгдийг харуулах
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={hideAllSections}
                className="flex-1"
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Бүгдийг нуух
              </Button>
            </div>

            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-3">
                {allSections.map(section => (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      sectionSettings[section.id]?.visible !== false
                        ? 'bg-card border-primary/20'
                        : 'bg-muted/50 border-muted opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${section.gradient} text-white`}
                      >
                        {section.icon}
                      </div>
                      <p className="font-medium">{section.title}</p>
                    </div>
                    <Switch
                      checked={sectionSettings[section.id]?.visible !== false}
                      onCheckedChange={() => toggleSectionVisibility(section.id)}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="text-sm text-muted-foreground text-center pt-2">
              {visibleSections.length} харагдаж байна • {hiddenCount} нуугдсан
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Render visible sections */}
      {visibleSections.map(section => (
        <div key={section.id}>
          {section.component}
        </div>
      ))}

      {/* Empty state when all sections are hidden */}
      {visibleSections.length === 0 && !isLoading && (
        <div className="text-center py-24">
          <EyeOff className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Бүх хэсэг нуугдсан</h3>
          <p className="text-muted-foreground mb-4">
            Баруун доод буланд байгаа тохиргооны товчийг дарж хэсгүүдийг
            харуулна уу.
          </p>
          <Button onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Тохиргоо нээх
          </Button>
        </div>
      )}
    </div>
  );
}
