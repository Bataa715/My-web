'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Github,
  Trash2,
  PlusCircle,
  Edit,
  Globe,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/features/portfolio/context/ProjectContext';
import { useEditMode } from '@/providers/EditModeContext';
import { AddProjectDialog } from '@/features/portfolio/dialogs/AddProjectDialog';
import { EditProjectDialog } from '@/features/portfolio/dialogs/EditProjectDialog';
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
import TechIcon from '@/components/common/TechIcon';
import { Skeleton } from '@/components/ui/skeleton';

function ProjectRow({ project }: { project: Project }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="group flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative h-40 w-full shrink-0 overflow-hidden bg-[#111] sm:h-32 sm:w-52">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.name}
            fill
            sizes="208px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized={/\.gif(\?|$)/i.test(project.image)}
          />
        ) : (
          <div className="absolute inset-0 bg-[#111]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
          Project
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#111]">
          {project.name}
        </h3>
        <p
          className={`mt-2 text-sm text-[#111]/55 ${!isExpanded ? 'line-clamp-2' : ''}`}
        >
          {project.description}
        </p>
        {project.description && project.description.length > 140 && (
          <button
            onClick={() => setIsExpanded(v => !v)}
            className="mt-1 inline-flex items-center gap-1 text-xs text-[#c41212]"
          >
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {isExpanded ? 'Хураах' : 'Дэлгэрэнгүй'}
          </button>
        )}
        {project.technologies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {project.technologies.slice(0, 6).map(tech => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 border border-[#111]/15 px-2 py-0.5 text-[11px]"
              >
                <TechIcon techName={tech} className="h-3 w-3" />
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {project.live && (
          <Link
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#111] hover:text-[#c41212]"
          >
            <Globe className="h-3.5 w-3.5" />
            Үзэх
          </Link>
        )}
        {project.link && (
          <Link
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#111] hover:text-[#c41212]"
          >
            <Github className="h-3.5 w-3.5" />
            Код
          </Link>
        )}
        <ArrowRight className="hidden h-5 w-5 text-[#111]/40 sm:block" />
      </div>
    </div>
  );
}

export default function Projects() {
  const { projects, deleteProject, loading } = useProjects();
  const { isEditMode } = useEditMode();

  return (
    <section id="projects" className="bg-[#f3f1ee] py-16 text-[#111] sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <h2 className="portal-title">Projects</h2>

        {loading && (
          <div className="mt-16 space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-6">
                <Skeleton className="h-32 w-52 shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <ul className="mt-16 divide-y divide-[#111]">
            {projects.map(project => (
              <li key={project.id} className="relative">
                <ProjectRow project={project} />
                {isEditMode && (
                  <div className="absolute right-0 top-4 z-10 flex gap-2">
                    <EditProjectDialog project={project}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </EditProjectDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          aria-label="Delete project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{project.name}" төслийг устгах гэж байна.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => project.id && deleteProject(project.id)}
                          >
                            Устгах
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {isEditMode && (
          <div className="mt-8 flex justify-center">
            <AddProjectDialog>
              <button className="inline-flex items-center gap-2 border border-dashed border-[#111]/40 px-5 py-3 text-sm hover:border-[#c41212] hover:text-[#c41212]">
                <PlusCircle size={18} />
                Шинэ төсөл нэмэх
              </button>
            </AddProjectDialog>
          </div>
        )}
      </div>
    </section>
  );
}
