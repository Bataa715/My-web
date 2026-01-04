"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { PlusCircle, Trash2, Edit, AlertTriangle } from "lucide-react";
import { useExperience } from "@/contexts/ExperienceContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { AddExperienceDialog } from "../AddExperienceDialog";
import { EditExperienceDialog } from "../EditExperienceDialog";
import { Button } from "../ui/button";
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
import type { ExperienceItem } from "@/contexts/ExperienceContext";


const getIcon = (iconName: string) => {
  const LucideIcon = (require('lucide-react') as any)[iconName];
  return LucideIcon ? <LucideIcon className="h-10 w-10" /> : <AlertTriangle className="h-10 w-10 text-destructive" />;
};

const ExperienceCard = ({ experience, index }: { experience: ExperienceItem; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative"
    >
      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 p-6 h-full transition-all duration-300 hover:border-neutral-700">
        
        {/* Glowing accent line at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary rounded-b-full blur-sm" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-primary rounded-b-full" />
        
        {/* Spotlight effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.1), transparent 40%)`
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex gap-5">
          {/* Icon */}
          <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl bg-primary/10 text-primary border border-primary/20">
            {getIcon(experience.icon)}
          </div>
          
          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300">
              {experience.title}
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3">
              {experience.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Experience() {
  const { experiences, loading, deleteExperience } = useExperience();
  const { isEditMode } = useEditMode();
  
  return (
    <section id="experience" className="py-16 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold">
            Миний <span className="text-primary">туршлага</span>
          </h2>
        </motion.div>
        
        {/* Experience Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto" style={{ perspective: "1000px" }}>
          {experiences.map((experience, index) => (
            <div key={experience.id} className="relative group">
              <ExperienceCard experience={experience} index={index} />
              {isEditMode && (
                <div className="absolute top-3 right-3 flex gap-1 z-20">
                  <EditExperienceDialog experience={experience}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white rounded-md">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </EditExperienceDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/50 hover:bg-destructive/80 text-white rounded-md">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{experience.title}"-г устгах гэж байна. Энэ үйлдэл буцаагдахгүй.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteExperience(experience.id)}>Устгах</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))}
          {isEditMode && (
            <motion.div 
              layout 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.3 }}
              className="h-full min-h-[200px]"
            >
              <AddExperienceDialog>
                <button className="flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900/30 text-neutral-500 transition-all duration-300 hover:border-primary hover:bg-neutral-900/50 hover:text-primary hover:shadow-lg hover:shadow-primary/10">
                  <PlusCircle size={48} />
                  <span className="mt-4 font-semibold">Шинэ туршлага нэмэх</span>
                </button>
              </AddExperienceDialog>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
