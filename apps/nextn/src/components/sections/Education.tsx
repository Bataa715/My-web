'use client';

import { motion } from 'framer-motion';
import {
  GraduationCap,
  Briefcase,
  Trash2,
  Loader2,
  PlusCircle,
  Edit,
  Calendar,
  Award,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { useEducation } from '@/contexts/EducationContext';
import { useExperience } from '@/contexts/ExperienceContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { AddEducationDialog } from '../AddEducationDialog';
import { EditEducationDialog } from '../EditEducationDialog';
import { AddExperienceDialog } from '../AddExperienceDialog';
import { EditExperienceDialog } from '../EditExperienceDialog';
import PageHeader from '../shared/PageHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const formatDate = (date: any) => {
  if (!date) return '';
  const d = date instanceof Date ? date : date.toDate?.() ?? date;
  try {
    return format(d, 'yyyy.MM');
  } catch {
    return '';
  }
};

/* Accent colors cycled along the journey */
const ACCENTS = [
  { c: 'hsl(217 91% 65%)', glow: 'hsl(217 91% 60% / 0.5)' },
  { c: 'hsl(271 81% 66%)', glow: 'hsl(271 81% 60% / 0.5)' },
  { c: 'hsl(189 94% 55%)', glow: 'hsl(189 94% 50% / 0.5)' },
  { c: 'hsl(322 85% 64%)', glow: 'hsl(322 85% 60% / 0.5)' },
  { c: 'hsl(45 93% 58%)',  glow: 'hsl(45 93% 55% / 0.5)' },
];

/* ── One node on the cosmic timeline: a glowing star on the journey line,
     content floating in open space beside it — no card box. ── */
function TimelineEntry({
  index,
  icon,
  editControls,
  children,
}: {
  index: number;
  icon: React.ReactNode;
  editControls?: React.ReactNode;
  children: React.ReactNode;
}) {
  const accent = ACCENTS[index % ACCENTS.length];
  const flip = index % 2 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative group/entry"
    >
      {/* Star node on the journey line */}
      <div className="absolute left-5 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10">
        {/* Light rays */}
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-16 opacity-40 animate-pulse-glow"
          style={{
            background: `linear-gradient(to bottom, transparent, ${accent.c}, transparent)`,
            animationDelay: `${(index % 5) * 0.5}s`,
          }}
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-16 opacity-40 animate-pulse-glow"
          style={{
            background: `linear-gradient(to right, transparent, ${accent.c}, transparent)`,
            animationDelay: `${(index % 5) * 0.5}s`,
          }}
        />
        {/* Halo */}
        <span
          aria-hidden
          className="absolute -inset-3 rounded-full blur-lg opacity-50 group-hover/entry:opacity-90 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle, ${accent.glow}, transparent 70%)` }}
        />
        {/* Orb */}
        <div
          className="relative w-11 h-11 rounded-full border-2 flex items-center justify-center backdrop-blur-md transition-transform duration-500 group-hover/entry:scale-110"
          style={{
            background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.4) 0%, ${accent.c} 45%, hsl(240 45% 12%) 100%)`,
            borderColor: 'rgba(255,255,255,0.2)',
            boxShadow: `0 0 18px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
          }}
        >
          <span className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] [&_svg]:w-5 [&_svg]:h-5">
            {icon}
          </span>
        </div>
      </div>

      {/* Content — open space, alternating sides on desktop */}
      <div
        className={cn(
          'relative pl-14 md:pl-0 md:w-1/2',
          flip
            ? 'md:ml-auto md:pl-16 md:text-left'
            : 'md:pr-16 md:text-right'
        )}
      >
        {editControls && (
          <div
            className={cn(
              'absolute top-0 z-20 flex gap-1.5',
              flip ? 'right-0' : 'right-0 md:left-0 md:right-auto'
            )}
          >
            {editControls}
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
}

function DatePill({
  accent,
  children,
}: {
  accent: (typeof ACCENTS)[number];
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider border backdrop-blur-md"
      style={{
        color: accent.c,
        borderColor: accent.c.replace(')', ' / 0.35)'),
        background: 'hsl(var(--background) / 0.6)',
        boxShadow: `0 0 12px -4px ${accent.glow}`,
      }}
    >
      <Calendar className="w-3 h-3" />
      {children}
    </span>
  );
}

export default function Education() {
  const { education, deleteEducation, loading: eduLoading } = useEducation();
  const { experiences, deleteExperience, loading: expLoading } = useExperience();
  const { isEditMode } = useEditMode();
  const loading = eduLoading || expLoading;

  const journeyLine = (
    <div
      aria-hidden
      className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
      style={{
        background:
          'linear-gradient(to bottom, transparent, hsl(var(--primary)/0.35) 10%, hsl(var(--accent)/0.35) 90%, transparent)',
        boxShadow: '0 0 8px hsl(var(--primary)/0.25)',
      }}
    />
  );

  return (
    <section
      id="education"
      className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative">
        <PageHeader
          eyebrow="Боловсрол & Ажлын Түүх"
          icon={<GraduationCap className="h-3.5 w-3.5" />}
        >
          <h2 className="font-display glow-text text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Миний аялсан зам
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Од бүр — нэг үе шат. Гэрэлт замын дагуу аялаарай.
          </p>
        </PageHeader>
        <div className="mb-10" />

        <Tabs defaultValue="education" className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="h-11 px-1 gap-1 rounded-full border border-border/60 bg-card/40 backdrop-blur-xl">
              <TabsTrigger value="education" className="gap-2 px-5 rounded-full">
                <GraduationCap className="h-4 w-4" />
                Боловсрол
              </TabsTrigger>
              <TabsTrigger value="experience" className="gap-2 px-5 rounded-full">
                <Briefcase className="h-4 w-4" />
                Ажлын Түүх
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Education tab ── */}
          <TabsContent value="education">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              <div className="relative max-w-4xl mx-auto">
                {journeyLine}
                <div className="flex flex-col gap-14 md:gap-20 py-4">
                  {education.map((edu, index) => {
                    const accent = ACCENTS[index % ACCENTS.length];
                    return (
                      <TimelineEntry
                        key={edu.id}
                        index={index}
                        icon={<GraduationCap />}
                        editControls={
                          isEditMode ? (
                            <>
                              <EditEducationDialog education={edu}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 bg-card/80 hover:bg-card text-muted-foreground hover:text-foreground rounded-full backdrop-blur-xs"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </EditEducationDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 bg-card/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-full backdrop-blur-xs"
                                    aria-label="Delete education"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Устгахдаа итгэлтэй байна уу?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      "{edu.degree}"-г устгах гэж байна. Энэ
                                      үйлдэл буцаагдахгүй.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        edu.id && deleteEducation(edu.id)
                                      }
                                    >
                                      Устгах
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          ) : undefined
                        }
                      >
                        <DatePill accent={accent}>
                          {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                        </DatePill>
                        <h3
                          className="font-display text-xl sm:text-2xl font-bold tracking-tight mt-3 mb-2"
                          style={{ textShadow: `0 0 20px ${accent.glow}` }}
                        >
                          {edu.degree}
                        </h3>
                        <div
                          className={cn(
                            'flex items-center gap-2 text-muted-foreground justify-start',
                            index % 2 === 0 && 'md:justify-end'
                          )}
                        >
                          <Building2 className="w-4 h-4 shrink-0" />
                          <span className="text-sm">{edu.school}</span>
                        </div>
                        {edu.score && (
                          <span
                            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                            style={{
                              background: `linear-gradient(120deg, ${accent.c}, hsl(var(--accent)))`,
                              boxShadow: `0 0 16px -4px ${accent.glow}`,
                            }}
                          >
                            <Award className="w-3.5 h-3.5" />
                            {edu.score}
                          </span>
                        )}
                      </TimelineEntry>
                    );
                  })}
                  {isEditMode && (
                    <div className="flex justify-center">
                      <AddEducationDialog>
                        <button className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border-2 border-dashed border-border/60 bg-card/20 text-muted-foreground transition-all duration-300 hover:border-primary/60 hover:bg-primary/5 hover:text-primary">
                          <PlusCircle className="w-5 h-5" />
                          <span className="font-semibold text-sm">
                            Боловсрол нэмэх
                          </span>
                        </button>
                      </AddEducationDialog>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Experience tab ── */}
          <TabsContent value="experience">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              <div className="relative max-w-4xl mx-auto">
                {journeyLine}
                <div className="flex flex-col gap-14 md:gap-20 py-4">
                  {experiences.map((exp, index) => {
                    const accent = ACCENTS[index % ACCENTS.length];
                    return (
                      <TimelineEntry
                        key={exp.id}
                        index={index}
                        icon={<Briefcase />}
                        editControls={
                          isEditMode ? (
                            <>
                              <EditExperienceDialog experience={exp}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 bg-card/80 hover:bg-card text-muted-foreground hover:text-foreground rounded-full backdrop-blur-xs"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </EditExperienceDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 bg-card/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-full backdrop-blur-xs"
                                    aria-label="Устгах"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Устгахдаа итгэлтэй байна уу?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      "{exp.title}"-г устгах гэж байна. Энэ
                                      үйлдэл буцаагдахгүй.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        exp.id && deleteExperience(exp.id)
                                      }
                                    >
                                      Устгах
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          ) : undefined
                        }
                      >
                        <div
                          className={cn(
                            'flex items-center gap-2 flex-wrap justify-start',
                            index % 2 === 0 && 'md:justify-end'
                          )}
                        >
                          <DatePill accent={accent}>
                            {formatDate(exp.startDate)} –{' '}
                            {exp.current ? 'Одоо' : formatDate(exp.endDate)}
                          </DatePill>
                          {exp.current && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Одоо ажиллаж байна
                            </span>
                          )}
                        </div>
                        <h3
                          className="font-display text-xl sm:text-2xl font-bold tracking-tight mt-3 mb-2"
                          style={{ textShadow: `0 0 20px ${accent.glow}` }}
                        >
                          {exp.title}
                        </h3>
                        <div
                          className={cn(
                            'flex items-center gap-2 text-muted-foreground justify-start',
                            index % 2 === 0 && 'md:justify-end'
                          )}
                        >
                          <Building2 className="w-4 h-4 shrink-0" />
                          <span className="text-sm">{exp.company}</span>
                        </div>
                        {exp.description && (
                          <p className="text-sm text-muted-foreground/80 leading-relaxed mt-3 max-w-md md:inline-block">
                            {exp.description}
                          </p>
                        )}
                      </TimelineEntry>
                    );
                  })}
                  {isEditMode && (
                    <div className="flex justify-center">
                      <AddExperienceDialog>
                        <button className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border-2 border-dashed border-border/60 bg-card/20 text-muted-foreground transition-all duration-300 hover:border-primary/60 hover:bg-primary/5 hover:text-primary">
                          <PlusCircle className="w-5 h-5" />
                          <span className="font-semibold text-sm">
                            Туршлага нэмэх
                          </span>
                        </button>
                      </AddExperienceDialog>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
