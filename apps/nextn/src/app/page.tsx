'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Suspense,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useReducedMotion,
} from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Settings,
  EyeOff,
  GraduationCap,
  FolderKanban,
  ArrowUp,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useEditMode } from '@/contexts/EditModeContext';
import HomeProviders from './providers/HomeProviders';
import type {
  SectionMeta,
  SectionSettings,
} from '@/components/sections/SectionSettingsDialog';

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

// Edit-only dialog: load only when isEditMode === true
const SectionSettingsDialog = dynamic(
  () => import('@/components/sections/SectionSettingsDialog'),
  { ssr: false, loading: () => null }
);

export default function HomePage() {
  return (
    <HomeProviders>
      <HomePageInner />
    </HomeProviders>
  );
}

function HomePageInner() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { isEditMode } = useEditMode();
  const [sectionSettings, setSectionSettings] = useState<SectionSettings>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const allSections: (SectionMeta & { component: React.ReactNode })[] = useMemo(
    () => [
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
        icon: null,
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
    ],
    []
  );

  useEffect(() => {
    const defaultSettings: SectionSettings = {};
    allSections.forEach((section, index) => {
      defaultSettings[section.id] = { visible: true, order: index };
    });
    setSectionSettings(defaultSettings);
  }, [allSections]);

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
  }, [firestore, user, allSections]);

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

  const toggleSectionVisibility = (sectionId: string) => {
    saveSettings({
      ...sectionSettings,
      [sectionId]: {
        ...sectionSettings[sectionId],
        visible: !sectionSettings[sectionId]?.visible,
      },
    });
  };

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

  const visibleSections = allSections
    .filter(section => sectionSettings[section.id]?.visible !== false)
    .sort(
      (a, b) =>
        (sectionSettings[a.id]?.order ?? 0) -
        (sectionSettings[b.id]?.order ?? 0)
    );

  const hiddenCount = allSections.length - visibleSections.length;

  return (
    <HomeShell>
      <ScrollProgressBar />

      {/* HERO — inherits the global aurora, no separate backdrop */}
      <section
        id="hero"
        className="relative"
        data-section="hero"
      >
        <InteractiveParticles quantity={40} />
        <div className="relative z-10 min-h-[80vh]">
          <Suspense
            fallback={<div className="w-full min-h-[80vh] bg-transparent" />}
          >
            <Hero />
          </Suspense>
        </div>
      </section>

      {isEditMode && (
        <SectionSettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          allSections={allSections}
          sectionSettings={sectionSettings}
          visibleCount={visibleSections.length}
          hiddenCount={hiddenCount}
          onToggle={toggleSectionVisibility}
          onShowAll={showAllSections}
          onHideAll={hideAllSections}
        />
      )}

      {/* DYNAMIC SECTIONS */}
      <div className="relative">
        {visibleSections.map((section, idx) => (
          <SectionFrame
            key={section.id}
            id={section.id}
            index={idx + 1}
            gradient={section.gradient}
            isFirst={idx === 0}
          >
            {section.component}
          </SectionFrame>
        ))}
      </div>

      {visibleSections.length === 0 && !isLoading && (
        <div className="container mx-auto px-4 text-center py-24">
          <div className="mx-auto max-w-md rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl p-10">
            <EyeOff className="h-14 w-14 mx-auto text-muted-foreground/60 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Бүх хэсэг нуугдсан</h3>
            <p className="text-muted-foreground mb-6">
              Баруун доод буланд байгаа тохиргооны товчийг дарж хэсгүүдийг
              харуулна уу.
            </p>
            <Button onClick={() => setIsSettingsOpen(true)} className="rounded-xl">
              <Settings className="h-4 w-4 mr-2" />
              Тохиргоо нээх
            </Button>
          </div>
        </div>
      )}

      {/* BACK TO TOP */}
      <BackToTop />

      <SectionDots
        sections={[
          { id: 'hero', label: 'Нүүр' },
          ...visibleSections.map(s => ({ id: s.id, label: s.title })),
        ]}
      />
    </HomeShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Modern home page primitives
 * ──────────────────────────────────────────────────────────────────────── */

function HomeShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate overflow-x-clip">
      {/* Global backdrop — neutral, only a faint dot grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>
      {children}
    </div>
  );
}

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });
  return (
    <>
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left bg-linear-to-r from-primary via-accent to-primary"
        aria-hidden
      />
      {/* Glow underneath the bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 z-[59] h-[6px] origin-left blur-sm opacity-60 bg-linear-to-r from-primary via-accent to-primary"
        aria-hidden
      />
    </>
  );
}

function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 top-32 -z-10"
    >
      {/* Soft conic glow centered below header — matches About page */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 [background:conic-gradient(from_180deg_at_50%_50%,hsl(var(--primary)/0.25),transparent_40%,hsl(var(--primary)/0.18)_70%,transparent)] blur-3xl" />
      {/* Subtle grid mask */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse at center, black 25%, transparent 75%)',
        }}
      />
    </div>
  );
}

function SectionFrame({
  id,
  index,
  gradient,
  isFirst,
  children,
}: {
  id: string;
  index: number;
  gradient?: string;
  isFirst: boolean;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      data-section={id}
      className="relative scroll-mt-24"
    >
      {!isFirst && (
        <div className="container mx-auto px-4">
          <SectionOrnament />
        </div>
      )}

      {/* Numbered gradient badge floating above the section */}
      <div className="container mx-auto px-4">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-center gap-3 pt-8"
        >
          <span
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md',
              'shadow-sm shadow-black/5'
            )}
          >
            <span
              className={cn(
                'inline-block h-1.5 w-1.5 rounded-full bg-linear-to-r',
                gradient ?? 'from-primary to-primary'
              )}
            />
            №{String(index).padStart(2, '0')}
          </span>
          <div className="h-px flex-1 bg-linear-to-r from-border/60 to-transparent" />
        </motion.div>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.99 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function SectionOrnament() {
  return (
    <div
      className="relative my-4 md:my-6 flex items-center justify-center"
      aria-hidden
    >
      <div className="h-px flex-1 bg-linear-to-r from-transparent via-border/80 to-transparent" />
      <div className="mx-4 flex items-center gap-1.5">
        <span className="h-1 w-1 rounded-full bg-border/50" />
        <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 bg-primary/8 backdrop-blur-md shadow-[0_0_12px_-4px_hsl(var(--primary)/0.6)]">
          <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
        </div>
        <span className="h-1 w-1 rounded-full bg-border/50" />
      </div>
      <div className="h-px flex-1 bg-linear-to-r from-transparent via-border/80 to-transparent" />
    </div>
  );
}

function SectionDots({
  sections,
}: {
  sections: { id: string; label: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id =
            (visible[0].target as HTMLElement).dataset.section ??
            visible[0].target.id;
          if (id) setActive(id);
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach(s => {
      const el =
        document.querySelector<HTMLElement>(`[data-section="${s.id}"]`) ??
        document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Хэсгийн жагсаалт"
      className="hidden 2xl:flex fixed right-6 top-1/2 z-40 -translate-y-1/2 flex-col gap-3"
    >
      {sections.map(s => {
        const isActive = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="group relative flex items-center justify-end"
          >
            <span
              className={cn(
                'mr-3 whitespace-nowrap rounded-full bg-card/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground opacity-0 backdrop-blur-md transition-all duration-200 group-hover:opacity-100',
                isActive && 'opacity-100 text-foreground'
              )}
            >
              {s.label}
            </span>
            <span
              className={cn(
                'relative inline-block h-2.5 w-2.5 rounded-full border border-border bg-background transition-all duration-300',
                'group-hover:scale-110 group-hover:border-primary',
                isActive &&
                  'h-3 w-3 border-primary bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]'
              )}
            />
          </a>
        );
      })}
    </nav>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      onClick={() =>
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      aria-label="Дээш буцах"
      className={cn(
        'fixed bottom-24 sm:bottom-6 right-6 z-40 group inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15 backdrop-blur-xl text-primary shadow-lg shadow-primary/20 transition-all duration-300',
        'hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:shadow-xl hover:shadow-primary/30 hover:border-primary',
        show
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}
