
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { Github, ExternalLink, Trash2, Loader2, PlusCircle, Edit, ArrowUpRight, Globe, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/contexts/ProjectContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { AddProjectDialog } from "../AddProjectDialog";
import { EditProjectDialog } from "../EditProjectDialog";
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
import type { Project } from "@/lib/types";
import TechIcon from "../shared/TechIcon";


const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isExpanded, setIsExpanded] = useState(false);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
    const brightness = useTransform(mouseYSpring, [-0.5, 0.5], [1.1, 0.9]);
    
    // Accent colors for each card
    const accentColors = [
      { gradient: "from-violet-500 to-purple-600", glow: "139, 92, 246", border: "violet-500/50" },
      { gradient: "from-cyan-500 to-blue-600", glow: "6, 182, 212", border: "cyan-500/50" },
      { gradient: "from-emerald-500 to-green-600", glow: "16, 185, 129", border: "emerald-500/50" },
      { gradient: "from-orange-500 to-amber-600", glow: "249, 115, 22", border: "orange-500/50" },
      { gradient: "from-rose-500 to-pink-600", glow: "244, 63, 94", border: "rose-500/50" },
      { gradient: "from-indigo-500 to-blue-600", glow: "99, 102, 241", border: "indigo-500/50" },
    ];
    const accent = accentColors[index % accentColors.length];
    
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
            transformStyle: "preserve-3d",
        }}
        className="group relative h-[420px] md:h-[450px] w-full cursor-pointer"
    >
       {/* Outer glow effect */}
       <div 
         className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
         style={{
           background: `linear-gradient(135deg, rgba(${accent.glow}, 0.4), transparent 50%)`
         }}
       />
       
       {/* Main card container */}
       <div className="relative h-full w-full rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden transition-all duration-300 group-hover:border-neutral-700 flex flex-col">
         
         {/* Interactive spotlight overlay */}
         <div 
           className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
           style={{
             background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(${accent.glow}, 0.08), transparent 40%)`
           }}
         />
         
         {/* Glare effect */}
         <div 
           className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"
           style={{
             background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.06), transparent 40%)`
           }}
         />
         
         {/* Image section */}
         <div 
           style={{ transform: "translateZ(50px)" }}
           className="relative h-40 md:h-44 w-full overflow-hidden bg-neutral-900 flex-shrink-0"
         >
           <motion.div 
             className="relative h-full w-full"
             style={{ scale: useTransform(mouseYSpring, [-0.5, 0.5], [1.05, 1]) }}
           >
             {project.image ? (
               <Image
                 src={project.image}
                 alt={project.name}
                 fill
                 className="object-cover transition-all duration-700 group-hover:scale-110"
               />
             ) : (
               <div className={`absolute inset-0 bg-gradient-to-br ${accent.gradient} opacity-30`} />
             )}
           </motion.div>
           
           {/* Image overlay gradient */}
           <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
           
           {/* Top accent line */}
           <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accent.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
         </div>

         {/* Content section */}
         <div 
           style={{ transform: "translateZ(60px)" }}
           className="relative flex-1 flex flex-col p-4 md:p-5"
         >
           {/* Header with title and action icons */}
           <div className="flex items-start justify-between gap-2 mb-3">
             <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-400 transition-all duration-300 line-clamp-1 flex-1">
               {project.name}
             </h3>
             
             {/* Action icons in top right */}
             <div className="flex items-center gap-1.5 flex-shrink-0">
               {project.link && (
                 <Link 
                   href={project.link} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   onClick={(e) => e.stopPropagation()}
                   className="p-2 rounded-lg bg-neutral-800/60 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all duration-300"
                 >
                   <Github className="h-4 w-4" />
                 </Link>
               )}
               {project.live && (
                 <Link 
                   href={project.live} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   onClick={(e) => e.stopPropagation()}
                   className={`p-2 rounded-lg bg-gradient-to-r ${accent.gradient} text-white transition-all duration-300 hover:shadow-lg hover:shadow-${accent.border}`}
                 >
                   <Globe className="h-4 w-4" />
                 </Link>
               )}
             </div>
           </div>
           
           {/* Description with expand/collapse */}
           <div className="flex-1 overflow-hidden">
             <p className={`text-sm text-neutral-400 leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
               {project.description}
             </p>
             {project.description && project.description.length > 80 && (
               <button
                 onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
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
           <div className="mt-auto pt-3 border-t border-neutral-800">
             <div className="flex items-center gap-2 flex-wrap">
               {project.technologies.slice(0, 5).map((techName) => (
                 <TechIcon key={techName} techName={techName} />
               ))}
               {project.technologies.length > 5 && (
                 <span className="text-xs text-neutral-500">+{project.technologies.length - 5}</span>
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
    <section id="projects" className="py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary animate-gradient">
              Миний төслүүд
            </h2>
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            )}
        </div>


        {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" style={{ perspective: "2000px" }}>
                {projects.map((project, index) => (
                  <motion.div 
                    key={project.id} 
                    className="relative group"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProjectCard project={project} index={index} />
                     {isEditMode && (
                         <div className="absolute top-4 right-4 z-[100] flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <EditProjectDialog project={project}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </EditProjectDialog>
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-destructive/80"
                                      aria-label="Delete project"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            "{project.name}" төслийг устгах гэж байна. Энэ үйлдэл буцаагдахгүй.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => project.id && deleteProject(project.id)}>
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
                   <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <AddProjectDialog>
                      <button className="flex h-full min-h-[380px] md:min-h-[420px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-800 bg-neutral-950/50 text-neutral-500 transition-all duration-300 hover:border-primary hover:bg-neutral-900/50 hover:text-primary hover:shadow-lg hover:shadow-primary/10">
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
