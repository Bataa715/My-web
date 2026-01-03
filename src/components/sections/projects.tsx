
"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { Github, ExternalLink, Trash2, Loader2, PlusCircle, Edit, ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";


const ProjectCard = ({ project }: { project: Project }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    e.currentTarget.style.setProperty('--mouse-x', `${mouseX}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${mouseY}px`);

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="relative h-[450px] w-full rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-700/50 group"
    >
        <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }} className="absolute inset-0">
            {/* Image */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
                 <Image
                    src="https://i.ibb.co/hK7f2g9/Screenshot-2024-07-27-at-21-42-01.png"
                    alt={project.name}
                    fill
                    className="object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"/>
            </div>

             {/* Content */}
             <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end h-full">
                <div style={{ transform: "translateZ(50px)" }}>
                    <h3 className="text-xl lg:text-2xl font-bold text-white">{project.name}</h3>
                    <p className="mt-2 text-sm text-neutral-400 line-clamp-2">{project.description}</p>
                </div>
                
                 <div className="mt-4 flex items-end justify-between" style={{ transform: "translateZ(30px)" }}>
                    <div className="flex gap-2">
                        {project.technologies.slice(0, 4).map((tech) => (
                            <div key={tech} className="h-9 w-9 bg-black/50 rounded-full flex items-center justify-center text-xs font-bold text-neutral-300 border border-neutral-700">
                                {tech.slice(0, 2).toUpperCase()}
                            </div>
                        ))}
                    </div>
                     <div className="flex items-center gap-2">
                        {project.link && (
                            <Button asChild variant="ghost" size="icon" className="h-9 w-9 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full">
                                <Link href={project.link} target="_blank" rel="noopener noreferrer">
                                <Github className="h-5 w-5" />
                                </Link>
                            </Button>
                        )}
                        {project.live && (
                            <Button asChild variant="ghost" className="text-neutral-300 hover:text-white hover:bg-white/10 rounded-full px-4 py-2 text-sm">
                                <Link href={project.live} target="_blank" rel="noopener noreferrer">
                                Лайв <ArrowUpRight className="h-4 w-4 ml-1" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Spotlight Effect */}
         <div 
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
                background: `radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.1), transparent 40%)`,
            }}
        />
    </motion.div>
  );
};


export default function Projects() {
  const { projects, deleteProject, loading } = useProjects();
  const { isEditMode } = useEditMode();
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);
      
  return (
    <section id="projects" className="py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Миний төслүүд</h2>
             {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : (
                <div className="flex justify-center flex-wrap gap-2 py-8">
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            onClick={() => setSelectedCategory(category)}
                            className="rounded-full transition-colors duration-300"
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            )}
        </div>


        {!loading && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8" style={{ perspective: "2000px" }}>
                {filteredProjects.map((project) => (
                  <div key={project.id} className="relative group">
                    <ProjectCard project={project} />
                     {isEditMode && (
                         <div className="absolute top-4 right-4 flex gap-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <EditProjectDialog project={project}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white bg-black/50 hover:bg-black/70 rounded-full">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </EditProjectDialog>
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-white bg-black/50 hover:bg-destructive/80 rounded-full"
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
                  </div>
                ))}
                 {isEditMode && (
                   <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <AddProjectDialog>
                      <button className="flex h-[450px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-950/50 text-neutral-500 transition-colors hover:border-primary hover:bg-neutral-900 hover:text-primary">
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
