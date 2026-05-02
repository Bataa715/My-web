'use client';

import { useState, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  GraduationCap,
  Trash2,
  Loader2,
  PlusCircle,
  Edit,
  Calendar,
  Award,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { useEducation } from '@/contexts/EducationContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { AddEducationDialog } from '../AddEducationDialog';
import { EditEducationDialog } from '../EditEducationDialog';
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
import type { Education as EducationType } from '@/lib/types';
import { cn } from '@/lib/utils';

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
function EducationCard({
  edu,
  index,
  isEditMode,
  onDelete,
}: {
  edu: EducationType;
  index: number;
  isEditMode: boolean;
  onDelete: (id: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

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

  const accents = [
    { gradient: 'from-primary to-primary/60' },
    { gradient: 'from-accent to-accent/60' },
    { gradient: 'from-primary to-accent' },
    { gradient: 'from-accent to-primary/60' },
    { gradient: 'from-primary/80 via-accent/70 to-primary/60' },
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
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative group cursor-pointer"
    >
      {/* Glow effect */}
      <motion.div
        className={cn(
          'absolute -inset-1 rounded-2xl bg-linear-to-r opacity-0 blur-xl transition-opacity duration-500',
          accent.gradient
        )}
        animate={{ opacity: isHovered ? 0.4 : 0 }}
      />

      {/* Card */}
      <div className="relative h-full rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md overflow-hidden">
        {/* Top gradient accent */}
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-1 bg-linear-to-r',
            accent.gradient
          )}
        />

        {/* Spotlight effect */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl"
          style={{ background: 'radial-gradient(circle at 50% 30%, hsl(var(--primary) / 0.07), transparent 60%)' }}
        />

        {/* Edit buttons */}
        {isEditMode && (
          <div className="absolute top-3 right-3 flex gap-1.5 z-20">
            <EditEducationDialog education={edu}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-card/80 hover:bg-card text-muted-foreground hover:text-foreground rounded-lg backdrop-blur-xs"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </EditEducationDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-card/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-lg backdrop-blur-xs"
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
        <div
          className="relative p-6 pt-8"
          style={{ transform: 'translateZ(50px)' }}
        >
          {/* Icon */}
          <div
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-linear-to-br',
              accent.gradient
            )}
          >
            <GraduationCap className="w-7 h-7 text-primary-foreground" />
          </div>

          {/* Degree title */}
          <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
            {edu.degree}
          </h3>

          {/* School */}
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="text-sm line-clamp-1">{edu.school}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-muted-foreground/70 mb-4">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="text-sm">
              {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
            </span>
          </div>

          {/* Score badge */}
          {edu.score && (
            <div
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-linear-to-r',
                accent.gradient
              )}
            >
              <Award className="w-4 h-4 text-primary-foreground" />
              <span className="text-primary-foreground">{edu.score}</span>
            </div>
          )}
        </div>

        {/* Bottom decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-background/50 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}

export default function Education() {
  const { education, deleteEducation, loading } = useEducation();
  const { isEditMode } = useEditMode();

  return (
    <section
      id="education"
      className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative">
        <PageHeader
          eyebrow="Боловсрол"
          icon={<GraduationCap className="h-3.5 w-3.5" />}
        />
        <div className="mb-10" />

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
            className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
            style={{ perspective: '1000px' }}
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
                    <button className="flex h-full min-h-[280px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-card/30 backdrop-blur-md text-muted-foreground transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary group">
                      <div className="w-16 h-16 rounded-2xl bg-muted group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors duration-300">
                        <PlusCircle className="w-8 h-8" />
                      </div>
                      <span className="font-semibold text-lg">
                        Боловсрол нэмэх
                      </span>
                      <span className="text-sm text-muted-foreground/60 mt-1">
                        Шинэ мэдээлэл нэмэх
                      </span>
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
