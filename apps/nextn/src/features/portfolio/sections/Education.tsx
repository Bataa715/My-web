'use client';

import { format } from 'date-fns';
import {
  GraduationCap,
  Briefcase,
  Trash2,
  Loader2,
  PlusCircle,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEducation } from '@/features/portfolio/context/EducationContext';
import { useExperience } from '@/features/portfolio/context/ExperienceContext';
import { useEditMode } from '@/providers/EditModeContext';
import { AddEducationDialog } from '@/features/portfolio/dialogs/AddEducationDialog';
import { EditEducationDialog } from '@/features/portfolio/dialogs/EditEducationDialog';
import { AddExperienceDialog } from '@/features/portfolio/dialogs/AddExperienceDialog';
import { EditExperienceDialog } from '@/features/portfolio/dialogs/EditExperienceDialog';
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

const formatDate = (date: any) => {
  if (!date) return '';
  const d = date instanceof Date ? date : date.toDate?.() ?? date;
  try {
    return format(d, 'yyyy.MM');
  } catch {
    return '';
  }
};

export default function Education() {
  const { education, deleteEducation, loading: eduLoading } = useEducation();
  const { experiences, deleteExperience, loading: expLoading } = useExperience();
  const { isEditMode } = useEditMode();
  const loading = eduLoading || expLoading;

  return (
    <section id="education" className="bg-[#f3f1ee] py-16 text-[#111] sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <h2 className="portal-title">Education</h2>

        <Tabs defaultValue="education" className="mt-16 w-full">
          <div className="mb-10 flex justify-center">
            <TabsList className="h-auto gap-8 bg-transparent p-0">
              <TabsTrigger
                value="education"
                className="rounded-none border-0 bg-transparent px-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#111]/40 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-[#c41212] data-[state=active]:shadow-none"
              >
                <GraduationCap className="mr-2 h-3.5 w-3.5" />
                Боловсрол
              </TabsTrigger>
              <TabsTrigger
                value="experience"
                className="rounded-none border-0 bg-transparent px-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#111]/40 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-[#c41212] data-[state=active]:shadow-none"
              >
                <Briefcase className="mr-2 h-3.5 w-3.5" />
                Ажлын түүх
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="education">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#c41212]" />
              </div>
            ) : (
              <ul className="divide-y divide-[#111]">
                {education.map(edu => (
                  <li key={edu.id} className="relative py-7">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-10">
                      <span className="w-36 shrink-0 text-xs tracking-wider text-[#111]/55">
                        {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                      </span>
                      <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
                        School
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl">{edu.degree}</h3>
                        <p className="mt-1 text-sm text-[#111]/55">{edu.school}</p>
                        {edu.score && (
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#c41212]">
                            {edu.score}
                          </p>
                        )}
                      </div>
                    </div>
                    {isEditMode && (
                      <div className="absolute right-0 top-6 flex gap-1">
                        <EditEducationDialog education={edu}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </EditEducationDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-destructive"
                              aria-label="Delete education"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{edu.degree}"-г устгах гэж байна.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => edu.id && deleteEducation(edu.id)}
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
                <AddEducationDialog>
                  <button className="inline-flex items-center gap-2 border border-dashed border-[#111]/40 px-5 py-3 text-sm hover:border-[#c41212] hover:text-[#c41212]">
                    <PlusCircle className="h-4 w-4" />
                    Боловсрол нэмэх
                  </button>
                </AddEducationDialog>
              </div>
            )}
          </TabsContent>

          <TabsContent value="experience">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#c41212]" />
              </div>
            ) : (
              <ul className="divide-y divide-[#111]">
                {experiences.map(exp => (
                  <li key={exp.id} className="relative py-7">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-10">
                      <span className="w-36 shrink-0 text-xs tracking-wider text-[#111]/55">
                        {formatDate(exp.startDate)} –{' '}
                        {exp.current ? 'Одоо' : formatDate(exp.endDate)}
                      </span>
                      <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
                        Work
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl">{exp.title}</h3>
                        <p className="mt-1 text-sm text-[#111]/55">{exp.company}</p>
                        {exp.description && (
                          <p className="mt-2 text-sm leading-relaxed text-[#111]/50">
                            {exp.description}
                          </p>
                        )}
                        {exp.current && (
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#c41212]">
                            Одоо ажиллаж байна
                          </p>
                        )}
                      </div>
                    </div>
                    {isEditMode && (
                      <div className="absolute right-0 top-6 flex gap-1">
                        <EditExperienceDialog experience={exp}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </EditExperienceDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-destructive"
                              aria-label="Устгах"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{exp.title}"-г устгах гэж байна.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => exp.id && deleteExperience(exp.id)}
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
                <AddExperienceDialog>
                  <button className="inline-flex items-center gap-2 border border-dashed border-[#111]/40 px-5 py-3 text-sm hover:border-[#c41212] hover:text-[#c41212]">
                    <PlusCircle className="h-4 w-4" />
                    Туршлага нэмэх
                  </button>
                </AddExperienceDialog>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
