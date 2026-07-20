'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Github,
  Trash2,
  PlusCircle,
  Edit,
  Globe,
  ChevronDown,
  ChevronUp,
  FolderKanban,
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { useProjects } from '@/contexts/ProjectContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { AddProjectDialog } from '../AddProjectDialog';
import { EditProjectDialog } from '../EditProjectDialog';
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
import type { Project } from '@/lib/types';
import TechIcon from '../shared/TechIcon';
import PageHeader from '../shared/PageHeader';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

/* Accent per project row (cycles) */
const PLANET_ACCENTS = [
  { c: 'hsl(217 91% 65%)', glow: 'hsl(217 91% 60% / 0.5)' },
  { c: 'hsl(271 81% 66%)', glow: 'hsl(271 81% 60% / 0.5)' },
  { c: 'hsl(322 85% 64%)', glow: 'hsl(322 85% 60% / 0.5)' },
  { c: 'hsl(189 94% 55%)', glow: 'hsl(189 94% 50% / 0.5)' },
  { c: 'hsl(45 93% 58%)',  glow: 'hsl(45 93% 55% / 0.5)' },
];

/* ── One project as a planet system: circular image-planet with an orbit
     ring of tech icons; the info floats in open space beside it — no card
     box at all. Rows alternate left/right like a journey past planets. ── */
const ProjectPlanet = ({
  project,
  flip,
  accentIdx,
}: {
  project: Project;
  flip: boolean;
  accentIdx: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const accent = PLANET_ACCENTS[accentIdx % PLANET_ACCENTS.length];
  const techs = project.technologies.slice(0, 6);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-8 md:gap-14 md:flex-row',
        flip && 'md:flex-row-reverse'
      )}
    >
      {/* ── PLANET ── */}
      <div className="relative shrink-0 w-[230px] h-[230px] sm:w-[270px] sm:h-[270px] group">
        {/* Atmosphere glow */}
        <div
          className="absolute -inset-8 rounded-full blur-3xl opacity-45 group-hover:opacity-75 transition-opacity duration-700"
          style={{ background: `radial-gradient(circle, ${accent.glow}, transparent 70%)` }}
        />
        {/* Orbit ring ellipse behind the planet */}
        <div
          aria-hidden
          className="absolute inset-[-16%] rounded-[50%] border"
          style={{
            borderColor: `${accent.c.replace(')', ' / 0.3)')}`,
            transform: `scaleY(0.36) rotate(${flip ? 10 : -10}deg)`,
            filter: `drop-shadow(0 0 8px ${accent.glow})`,
          }}
        />

        {/* Image sphere */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden border-2 transition-transform duration-700 group-hover:scale-[1.03]"
          style={{
            borderColor: 'rgba(255,255,255,0.12)',
            boxShadow: `0 0 40px -8px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
        >
          {project.image ? (
            <Image
              src={project.image}
              alt={project.name}
              fill
              sizes="270px"
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              unoptimized={/\.gif(\?|$)/i.test(project.image)}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25), ${accent.c} 45%, hsl(240 40% 10%) 100%)`,
              }}
            />
          )}
          {/* Sphere shading: specular highlight + dark limb */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 32% 24%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.05) 30%, transparent 46%), radial-gradient(circle at 70% 82%, rgba(2,2,10,0.62) 0%, transparent 58%)',
            }}
          />
        </div>

        {/* Orbiting tech icons — layer spins, icons counter-spin upright */}
        {techs.length > 0 && (
          <div className="absolute inset-[-13%] animate-[spin_50s_linear_infinite] pointer-events-none">
            {techs.map((techName, i) => {
              const a = (i / techs.length) * Math.PI * 2;
              return (
                <div
                  key={techName}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${50 + 50 * Math.cos(a)}%`,
                    top: `${50 + 50 * Math.sin(a)}%`,
                  }}
                >
                  <div
                    className="animate-[spin_50s_linear_infinite_reverse] w-9 h-9 rounded-full border backdrop-blur-md flex items-center justify-center"
                    style={{
                      background: 'hsl(var(--background) / 0.85)',
                      borderColor: 'hsl(var(--border) / 0.8)',
                      boxShadow: `0 0 10px ${accent.glow}`,
                    }}
                  >
                    <TechIcon techName={techName} className="w-4.5 h-4.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── INFO — floats in open space, no card box ── */}
      <div
        className={cn(
          'flex-1 max-w-xl text-center md:text-left',
          flip && 'md:text-right'
        )}
      >
        <div
          className={cn(
            'inline-flex items-center gap-2 mb-3',
            flip && 'md:flex-row-reverse'
          )}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: accent.c, boxShadow: `0 0 10px ${accent.c}` }}
          />
          <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
            Төсөл {String(accentIdx + 1).padStart(2, '0')}
          </span>
        </div>

        <h3
          className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4"
          style={{ textShadow: `0 0 24px ${accent.glow}` }}
        >
          {project.name}
        </h3>

        <p
          className={cn(
            'text-sm sm:text-base text-muted-foreground leading-relaxed',
            !isExpanded && 'line-clamp-3'
          )}
        >
          {project.description}
        </p>
        {project.description && project.description.length > 140 && (
          <button
            onClick={() => setIsExpanded(v => !v)}
            className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                <span>Хураах</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                <span>Дэлгэрэнгүй</span>
              </>
            )}
          </button>
        )}

        {/* Links */}
        <div
          className={cn(
            'flex items-center gap-3 mt-6 justify-center md:justify-start',
            flip && 'md:justify-end'
          )}
        >
          {project.live && (
            <Link
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(120deg, ${accent.c}, hsl(var(--accent)))`,
                boxShadow: `0 0 22px -6px ${accent.glow}`,
              }}
            >
              <Globe className="h-4 w-4" />
              Үзэх
            </Link>
          )}
          {project.link && (
            <Link
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-foreground/85 border border-border/70 bg-card/30 backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              Код
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Projects() {
  const { projects, deleteProject, loading } = useProjects();
  const { isEditMode } = useEditMode();

  return (
    <section id="projects" className="py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <PageHeader
          eyebrow="Миний төслүүд"
          icon={<FolderKanban className="h-3.5 w-3.5" />}
        >
          <h2 className="font-display glow-text text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Бүтээсэн гарагууд
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Төсөл бүр — өөрийн гэсэн тойрог замтай жижиг ертөнц.
          </p>
        </PageHeader>
        <div className="mb-12 sm:mb-16" />

        {loading && (
          <div className="flex flex-col gap-20 max-w-5xl mx-auto">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center gap-10">
                <Skeleton className="w-[230px] h-[230px] rounded-full shrink-0" />
                <div className="flex-1 w-full space-y-3">
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="relative max-w-5xl mx-auto">
            {/* Journey line connecting the planet systems (desktop) */}
            <div
              aria-hidden
              className="hidden md:block absolute left-1/2 top-6 bottom-6 w-px -translate-x-1/2"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, hsl(var(--primary)/0.25) 12%, hsl(var(--accent)/0.25) 88%, transparent)',
              }}
            />

            <div className="flex flex-col gap-20 md:gap-28">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="relative group/item"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProjectPlanet
                    project={project}
                    flip={index % 2 === 1}
                    accentIdx={index}
                  />
                  {isEditMode && (
                    <div className="absolute top-0 right-0 z-40 flex gap-2">
                      <EditProjectDialog project={project}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-card/80 text-foreground hover:bg-card"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </EditProjectDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-card/80 text-foreground hover:bg-destructive/20 hover:text-destructive"
                            aria-label="Delete project"
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
                              "{project.name}" төслийг устгах гэж байна. Энэ
                              үйлдэл буцаагдахгүй.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                project.id && deleteProject(project.id)
                              }
                            >
                              Устгах
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </motion.div>
              ))}

              {isEditMode && (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center"
                >
                  <AddProjectDialog>
                    <button className="flex flex-col items-center justify-center w-[230px] h-[230px] rounded-full border-2 border-dashed border-border/60 bg-card/20 text-muted-foreground transition-all duration-300 hover:border-primary/60 hover:bg-primary/5 hover:text-primary gap-3">
                      <PlusCircle size={40} />
                      <span className="text-sm font-semibold">Шинэ төсөл нэмэх</span>
                    </button>
                  </AddProjectDialog>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
