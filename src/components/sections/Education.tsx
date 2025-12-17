
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Trash2, Loader2, PlusCircle, Edit } from "lucide-react";
import { format } from 'date-fns';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEducation } from "@/contexts/EducationContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { AddEducationDialog } from "../AddEducationDialog";
import { EditEducationDialog } from "../EditEducationDialog";
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
} from "@/components/ui/alert-dialog";
import type { Education as EducationType } from "@/lib/types";
import { cn } from "@/lib/utils";

const formatDate = (date: any) => {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate();
    try {
        return format(d, 'yyyy-MM-dd');
    } catch {
        return '';
    }
};

export default function Education() {
  const { education, deleteEducation, loading } = useEducation();
  const { isEditMode } = useEditMode();
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section id="education" className="py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl flex items-center gap-4">
              <GraduationCap className="w-10 h-10" /> Боловсрол
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Миний боловсролын түүх.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            <AnimatePresence>
              {education.map((edu, index) => (
                <motion.div
                  key={edu.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onMouseMove={handleMouseMove}
                  className="education-card rounded-lg"
                >
                  <Card className={cn("flex h-full flex-col overflow-hidden transition-shadow duration-300 bg-muted/30 backdrop-blur-sm group border-transparent", isEditMode ? "hover:shadow-lg" : "")}>
                    {isEditMode && (
                       <div className="absolute top-2 right-2 flex gap-1 z-10">
                          <EditEducationDialog education={edu}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                                  <Edit className="h-4 w-4" />
                              </Button>
                          </EditEducationDialog>
                         <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    aria-label="Delete education"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          "{edu.degree}"-г устгах гэж байна. Энэ үйлдэл буцаагдахгүй.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => edu.id && deleteEducation(edu.id)}>
                                          Устгах
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{edu.degree}</CardTitle>
                      <CardDescription>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground">{edu.school}</p>
                    </CardContent>
                    {edu.score && (
                        <CardFooter className="flex justify-end gap-2 bg-muted/50 p-4">
                            <div className="flex items-center gap-2 font-bold text-primary">
                                <GraduationCap className="h-5 w-5" />
                                <span>{edu.score}</span>
                            </div>
                        </CardFooter>
                    )}
                  </Card>
                </motion.div>
              ))}
               {isEditMode && (
                 <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                  <AddEducationDialog>
                    <button className="flex h-full min-h-[200px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/20 text-muted-foreground transition-colors hover:border-primary hover:bg-muted/50 hover:text-primary">
                      <PlusCircle size={48} />
                      <span className="mt-4 font-semibold">Боловсрол нэмэх</span>
                    </button>
                  </AddEducationDialog>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
