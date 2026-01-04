
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { GraduationCap, Trash2, Loader2, PlusCircle, Edit, Calendar, Award, Building2 } from "lucide-react";
import { format } from 'date-fns';

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
        return format(d, 'yyyy оны MM сар');
    } catch {
        return '';
    }
};

// 3D Card component with tilt effect
function EducationCard({ edu, index, isEditMode, onDelete }: { 
  edu: EducationType; 
  index: number; 
  isEditMode: boolean;
  onDelete: (id: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Color accents based on index
  const accents = [
    { gradient: "from-primary via-primary/80 to-primary/60", glow: "primary" },
    { gradient: "from-blue-500 via-blue-400 to-cyan-400", glow: "blue-500" },
    { gradient: "from-violet-500 via-purple-500 to-fuchsia-500", glow: "violet-500" },
    { gradient: "from-amber-500 via-orange-500 to-red-500", glow: "amber-500" },
    { gradient: "from-emerald-500 via-green-500 to-teal-500", glow: "emerald-500" },
  ];
  const accent = accents[index % accents.length];

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative group cursor-pointer"
    >
      {/* Glow effect */}
      <motion.div
        className={cn(
          "absolute -inset-1 rounded-2xl bg-gradient-to-r opacity-0 blur-xl transition-opacity duration-500",
          accent.gradient
        )}
        animate={{ opacity: isHovered ? 0.4 : 0 }}
      />

      {/* Card */}
      <div className="relative h-full rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm overflow-hidden">
        {/* Top gradient accent */}
        <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", accent.gradient)} />
        
        {/* Spotlight effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${mouseX.get() * 100 + 50}% ${mouseY.get() * 100 + 50}%, rgba(255,255,255,0.06), transparent 40%)`,
          }}
        />

        {/* Edit buttons */}
        {isEditMode && (
          <div className="absolute top-3 right-3 flex gap-1.5 z-20">
            <EditEducationDialog education={edu}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-lg backdrop-blur-sm"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </EditEducationDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 bg-neutral-800/80 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded-lg backdrop-blur-sm"
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
                  <AlertDialogAction onClick={() => edu.id && onDelete(edu.id)}>
                    Устгах
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Content */}
        <div className="relative p-6 pt-8" style={{ transform: "translateZ(50px)" }}>
          {/* Icon */}
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br",
            accent.gradient
          )}>
            <GraduationCap className="w-7 h-7 text-white" />
          </div>

          {/* Degree title */}
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
            {edu.degree}
          </h3>

          {/* School */}
          <div className="flex items-center gap-2 text-neutral-400 mb-3">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{edu.school}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-neutral-500 mb-4">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">
              {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
            </span>
          </div>

          {/* Score badge */}
          {edu.score && (
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r",
              accent.gradient
            )}>
              <Award className="w-4 h-4 text-white" />
              <span className="text-white">{edu.score}</span>
            </div>
          )}
        </div>

        {/* Bottom decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-neutral-950/50 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}

export default function Education() {
  const { education, deleteEducation, loading } = useEducation();
  const { isEditMode } = useEditMode();

  return (
    <section id="education" className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container px-4 md:px-6 relative">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <div className="flex items-center gap-4 justify-center">
            <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Боловсрол
            </h2>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 h-12 w-12 animate-ping text-primary opacity-20">
                <Loader2 className="h-12 w-12" />
              </div>
            </div>
          </div>
        ) : (
          <motion.div 
            layout 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            style={{ perspective: "1000px" }}
          >
            <AnimatePresence>
              {education.map((edu, index) => (
                <EducationCard
                  key={edu.id}
                  edu={edu}
                  index={index}
                  isEditMode={isEditMode}
                  onDelete={deleteEducation}
                />
              ))}
              {isEditMode && (
                <motion.div 
                  layout 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ duration: 0.3, delay: education.length * 0.1 }}
                >
                  <AddEducationDialog>
                    <button className="flex h-full min-h-[280px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900/50 text-neutral-500 transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary group">
                      <div className="w-16 h-16 rounded-2xl bg-neutral-800 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors duration-300">
                        <PlusCircle className="w-8 h-8" />
                      </div>
                      <span className="font-semibold text-lg">Боловсрол нэмэх</span>
                      <span className="text-sm text-neutral-600 mt-1">Шинэ мэдээлэл нэмэх</span>
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
