
"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { Github, ExternalLink, Trash2, Loader2, PlusCircle, Edit } from "lucide-react";
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

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

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
      className="relative h-full w-full rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800"
    >
        <div
            style={{
                transform: "translateZ(50px)",
                transformStyle: "preserve-3d",
            }}
            className="absolute inset-4 grid grid-rows-[auto_1fr_auto] place-content-center rounded-xl bg-neutral-950/80 backdrop-blur-sm shadow-lg border border-neutral-800/50"
        >
             <div 
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.08), transparent 40%)`,
                }}
            />
            <div style={{ transform: "translateZ(40px)" }}>
                 <div className="relative w-full h-40">
                    <Image
                        src="https://i.ibb.co/hK7f2g9/Screenshot-2024-07-27-at-21-42-01.png"
                        alt={project.name}
                        fill
                        className="object-cover rounded-t-xl"
                    />
                </div>
                <div className="p-4 space-y-2">
                    <CardTitle className="text-white">{project.name}</CardTitle>
                    <CardDescription className="text-neutral-400 text-sm line-clamp-3">{project.description}</CardDescription>
                </div>
            </div>
             <div className="p-4 self-end" style={{ transform: "translateZ(30px)" }}>
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="bg-cyan-900/50 text-cyan-300 border-cyan-700/50">
                        {tech}
                        </Badge>
                    ))}
                </div>
                 <div className="flex justify-end gap-2">
                    {project.link && (
                        <Button asChild variant="ghost" size="icon" className="text-white/70 hover:text-white">
                            <Link href={project.link} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                    {project.live && (
                        <Button asChild variant="ghost" size="icon" className="text-white/70 hover:text-white">
                            <Link href={project.live} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                 </div>
            </div>
        </div>
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
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8" style={{ perspective: "1000px" }}>
                {filteredProjects.map((project) => (
                  <div key={project.id} className="relative h-[450px] group">
                    <ProjectCard project={project} />
                     {isEditMode && (
                         <div className="absolute top-2 right-2 flex gap-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <EditProjectDialog project={project}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white bg-black/50 hover:bg-black/70">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </EditProjectDialog>
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-white bg-black/50 hover:bg-destructive/80"
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

