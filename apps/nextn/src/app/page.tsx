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
  Briefcase,
  FolderKanban,
  Sparkles,
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
const Experience = dynamic(() => import('@/components/sections/Experience'), {
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

      {/* HERO — immersive ambient backdrop */}
      <section
        id="hero"
        className="relative isolate overflow-hidden"
        data-section="hero"
      >
        <HeroBackdrop />
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

      {/* Floating section navigator (desktop only) */}
      <SectionDots
        sections={[
          { id: 'hero', label: 'Танилцуулга' },
          ...visibleSections.map(s => ({ id: s.id, label: s.title })),
          { id: 'cta', label: 'Холбоо барих' },
        ]}
      />

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

      {/* CALL-TO-ACTION */}
      <CtaSection />

      {/* BACK TO TOP */}
      <BackToTop />
    </HomeShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Modern home page primitives
 * ──────────────────────────────────────────────────────────────────────── */

function HomeShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate overflow-x-clip">
      {/* Global aurora — sits behind everything */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 -left-32 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-purple-500/15 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />
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
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left bg-linear-to-r from-primary via-purple-500 to-primary"
      aria-hidden
    />
  );
}

function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
    >
      {/* Soft conic glow centered behind hero */}
      <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 [background:conic-gradient(from_180deg_at_50%_50%,hsl(var(--primary)/0.35),transparent_40%,hsl(var(--primary)/0.25)_70%,transparent)] blur-3xl" />
      {/* Subtle grid mask */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
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
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function SectionOrnament() {
  return (
    <div
      className="relative my-2 md:my-4 flex items-center justify-center"
      aria-hidden
    >
      <div className="h-px flex-1 bg-linear-to-r from-transparent via-border to-transparent" />
      <div className="mx-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-card/60 backdrop-blur-md">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="h-px flex-1 bg-linear-to-r from-transparent via-border to-transparent" />
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
      className="hidden xl:flex fixed right-6 top-1/2 z-40 -translate-y-1/2 flex-col gap-3"
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

function CtaSection() {
  const reduce = useReducedMotion();
  return (
    <section
      id="cta"
      data-section="cta"
      className="relative scroll-mt-24 py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/50 backdrop-blur-xl p-8 md:p-14"
        >
          {/* Decorative background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  'radial-gradient(currentColor 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
            />
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                Хамтдаа бүтээцгээе
              </span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight bg-linear-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent leading-[1.1]">
                Шинэ төсөл хэрэгтэй юу?
                <br />
                Холбоо барина уу.
              </h2>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                Веб, гар утасны апп, AI хэрэгсэл — санаагаа хуваалцвал
                хэрэгжүүлэхэд бэлэн.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="group h-12 rounded-xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <Link href="/about">
                  <Mail className="h-4 w-4 mr-2" />
                  Холбоо барих
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-xl border-border/70 bg-background/40 backdrop-blur-md hover:bg-background/70"
              >
                <Link href="/tools">Хэрэгслүүд үзэх</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
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
        'fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-card/70 backdrop-blur-xl text-foreground/80 shadow-lg transition-all duration-300',
        'hover:scale-110 hover:text-primary hover:border-primary/60',
        show
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
