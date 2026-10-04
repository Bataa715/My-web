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
import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';
import HomeProviders from '@/features/portfolio/context/HomeProviders';

// Lazy load heavy components for better performance
const OfficialHero = dynamic(() => import('@/features/home/OfficialHero'), {
  loading: () => <div className="w-full min-h-[100svh] bg-[#0a1410]" />,
});
const FeaturedGrid = dynamic(() => import('@/features/home/FeaturedGrid'), {
  loading: () => <div className="w-full min-h-[280px]" />,
});
const About = dynamic(() => import('@/features/portfolio/sections/About'), {
  loading: () => <div className="w-full min-h-[400px]" />,
});
const ToolsSection = dynamic(() => import('@/features/home/ToolsSection'), {
  loading: () => <div className="w-full min-h-[280px]" />,
});

const Education = dynamic(() => import('@/features/portfolio/sections/Education'), {
  loading: () => <div className="w-full min-h-[400px]" />,
});
const Skills = dynamic(() => import('@/features/portfolio/sections/Skills'), {
  loading: () => <div className="w-full min-h-[400px]" />,
});
const Projects = dynamic(() => import('@/features/portfolio/sections/Projects'), {
  loading: () => <div className="w-full min-h-[400px]" />,
});


export default function HomePage() {
  return (
    <HomeProviders>
      <HomePageInner />
    </HomeProviders>
  );
}

/** Fixed order — the home page no longer has a per-section visibility setting. */
const SECTIONS: { id: string; title: string; component: ReactNode }[] = [
  {
    id: 'education',
    title: 'Боловсрол',
    component: (
      <Suspense fallback={<div className="w-full min-h-[400px]" />}>
        <Education />
      </Suspense>
    ),
  },
  {
    id: 'skills',
    title: 'Ур чадвар',
    component: (
      <Suspense fallback={<div className="w-full min-h-[400px]" />}>
        <Skills />
      </Suspense>
    ),
  },
  {
    id: 'projects',
    title: 'Миний төслүүд',
    component: (
      <Suspense fallback={<div className="w-full min-h-[400px]" />}>
        <Projects />
      </Suspense>
    ),
  },
];

function HomePageInner() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    let tries = 0;
    const id = window.setInterval(() => {
      const el = document.getElementById(hash);
      tries += 1;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.clearInterval(id);
      } else if (tries > 30) {
        window.clearInterval(id);
      }
    }, 100);

    return () => window.clearInterval(id);
  }, []);

  return (
    <HomeShell>
      <ScrollProgressBar />

      <section id="hero" className="relative" data-section="hero">
        <Suspense fallback={<div className="w-full min-h-[100svh] bg-[#0a1410]" />}>
          <OfficialHero />
        </Suspense>
      </section>
      <Suspense fallback={<div className="w-full min-h-[280px]" />}>
        <FeaturedGrid />
      </Suspense>

      <Suspense fallback={<div className="w-full min-h-[400px]" />}>
        <About />
      </Suspense>


      {/* DYNAMIC SECTIONS */}
      <div className="relative">
        {SECTIONS.map((section, idx) => (
          <SectionFrame
            key={section.id}
            id={section.id}
            index={idx + 1}
            isFirst={idx === 0}
          >
            {section.component}
          </SectionFrame>
        ))}
      </div>

      <Suspense fallback={<div className="w-full min-h-[280px]" />}>
        <ToolsSection />
      </Suspense>


      {/* BACK TO TOP */}
      <BackToTop />

      <SectionDots
        sections={[
          { id: 'hero', label: 'Нүүр' },
          { id: 'about', label: 'Миний тухай' },
          ...SECTIONS.map(s => ({ id: s.id, label: s.title })),
          { id: 'tools', label: 'Хэрэгслүүд' },
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
  return (
    <div id={id} data-section={id} className="relative scroll-mt-24">
      {children}
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
        'fixed bottom-6 right-6 z-40 group inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15 backdrop-blur-xl text-primary shadow-lg shadow-primary/20 transition-all duration-300',
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
