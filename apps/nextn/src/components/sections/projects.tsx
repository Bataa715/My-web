'use client';

import { useState, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import Link from 'next/link';
import {
  Github,
  Trash2,
  PlusCircle,
  Edit,
  Globe,
  ChevronDown,
  ChevronUp,
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
import { FolderKanban } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const ProjectCard = ({ project }: { project: Project }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg']);


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: 'preserve-3d',
      }}
      className="group relative h-[420px] md:h-[450px] w-full cursor-pointer"
    >
      {/* Outer glow effect */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xs"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.4), transparent 50%)' }}
      />

      {/* Main card container */}
      <div className="relative h-full w-full rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 group-hover:border-primary/40 flex flex-col">
        {/* Interactive spotlight overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
          style={{
            background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.08), transparent 40%)`,
          }}
        />

        {/* Glare effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.06), transparent 40%)`,
          }}
        />

        {/* Image section */}
        <div
          style={{ transform: 'translateZ(50px)' }}
          className="relative h-40 md:h-44 w-full overflow-hidden bg-muted shrink-0"
        >
          <motion.div
            className="relative h-full w-full"
            style={{
              scale: useTransform(mouseYSpring, [-0.5, 0.5], [1.05, 1]),
            }}
          >
            {project.image ? (
              <Image
                src={project.image}
                alt={project.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-all duration-700 group-hover:scale-110"
                unoptimized={/\.gif(\?|$)/i.test(project.image)}
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-accent/30 opacity-30" />
            )}
          </motion.div>

          {/* Image overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-card via-card/30 to-transparent" />

          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content section */}
        <div
          style={{ transform: 'translateZ(60px)' }}
          className="relative flex-1 flex flex-col p-4 md:p-5"
        >
          {/* Header with title and action icons */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:gradient-text transition-all duration-300 line-clamp-1 flex-1">
              {project.name}
            </h3>

            {/* Action icons in top right */}
            <div className="flex items-center gap-1.5 shrink-0">
              {project.link && (
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  <Github className="h-4 w-4" />
                </Link>
              )}
              {project.live && (
                <Link
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="p-2 rounded-lg bg-primary text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
                >
                  <Globe className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Description with expand/collapse */}
          <div className="flex-1 overflow-hidden">
            <p
              className={`text-sm text-muted-foreground leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}
            >
              {project.description}
            </p>
            {project.description && project.description.length > 80 && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="flex items-center gap-1 mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
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
          </div>

          {/* Tech stack at bottom */}
          <div className="mt-auto pt-3 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              {project.technologies.slice(0, 5).map(techName => (
                <TechIcon key={techName} techName={techName} />
              ))}
              {project.technologies.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{project.technologies.length - 5}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Projects() {
  const { projects, deleteProject, loading } = useProjects();
  const { isEditMode } = useEditMode();

  return (
    <section id="projects" className="py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <PageHeader
          eyebrow="Төслүүд"
          icon={<FolderKanban className="h-3.5 w-3.5" />}
          title="Миний төслүүд"
          description="Бүтээсэн бүтээгдэхүүнүүд, эксперимент болон оролцсон төслүүд."
        />
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px] md:h-[450px] w-full rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-7xl mx-auto"
            style={{ perspective: '2000px' }}
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProjectCard project={project} />
                {isEditMode && (
                  <div className="absolute top-4 right-4 z-100 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AddProjectDialog>
                  <button className="flex h-full min-h-[380px] md:min-h-[420px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50 text-muted-foreground transition-all duration-300 hover:border-primary hover:bg-card hover:text-primary hover:shadow-lg hover:shadow-primary/10">
                    <PlusCircle size={48} />
                    <span className="mt-4 font-semibold">Шинэ төсөл нэмэх</span>
                  </button>
                </AddProjectDialog>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
