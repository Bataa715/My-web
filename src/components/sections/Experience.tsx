"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
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


// Default images for experiences
const defaultImages = [
  '/images/exp1.png',
  '/images/exp2.png',
  '/images/exp3.png',
  '/images/exp4.png',
];

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

  // Use experience image or fallback to default based on index
  const imageSrc = experience.image || defaultImages[index % defaultImages.length];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative"
    >
      {/* Card with glass morphism effect */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl border border-border/30 p-6 h-full transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
        
        {/* Animated gradient border on hover */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Top glow accent */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
        
        {/* Spotlight effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
          style={{
            background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.15), transparent 50%)`
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex gap-5 items-start">
          {/* Image container with glow effect */}
          <div className="relative flex-shrink-0">
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl scale-90 group-hover:scale-110 transition-transform duration-500" />
            
            {/* Image */}
            <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300">
              <Image
                src={imageSrc}
                alt={experience.title}
                fill
                className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
          
          {/* Text content */}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
              {experience.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {experience.description}
            </p>
          </div>
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/50 to-transparent pointer-events-none rounded-b-3xl" />
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
