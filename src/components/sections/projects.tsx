
"use client";

import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { Github, ExternalLink, Trash2, Loader2, PlusCircle, Edit } from "lucide-react";
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


const ProjectCard = ({ project }: { project: Project }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12.5deg", "-12.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12.5deg", "12.5deg"]);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = e.currentTarget.getBoundingClientRect();
    
        const width = rect.width;
        const height = rect.height;
    
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
    
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
    
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

  return (
    <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
            rotateY,
            rotateX,
            transformStyle: "preserve-3d",
        }}
        className="group relative h-[450px] w-full cursor-pointer rounded-2xl border border-neutral-700/50 bg-neutral-900 shadow-lg"
    >
       <div 
        style={{
            transform: "translateZ(35px)",
            transformStyle: "preserve-3d",
        }}
        className="absolute inset-4 grid h-[calc(100%-2rem)] grid-rows-2 rounded-xl border border-neutral-700/50 bg-neutral-950 shadow-lg"
       >
           <div 
                style={{
                    transform: "translateZ(30px)",
                }}
                className="relative h-full w-full overflow-hidden rounded-t-xl bg-neutral-800"
            >
                <Image
                    src={project.image || "https://i.ibb.co/hK7f2g9/Screenshot-2024-07-27-at-21-42-01.png"}
                    alt={project.name}
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                />
           </div>

          <div 
            style={{
                transform: "translateZ(20px)",
            }}
            className="flex h-full flex-col justify-between rounded-b-xl p-4 bg-neutral-950/80"
          >
            <div>
                <h3 className="text-xl font-bold text-white">{project.name}</h3>
                <p className="mt-1 flex-grow text-sm text-neutral-400 line-clamp-2">{project.description}</p>
            </div>
            <div className="mt-2 flex items-end justify-between">
                <div className="flex items-center gap-2">
                    {project.technologies.slice(0, 5).map((techName) => (
                        <TechIcon key={techName} techName={techName} />
                    ))}
                </div>
                <div className="flex items-center gap-1">
                    {project.link && (
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full text-neutral-300 hover:bg-white/10 hover:text-white">
                            <Link href={project.link} target="_blank" rel="noopener noreferrer">
                                <Github className="h-5 w-5" />
                            </Link>
                        </Button>
                    )}
                    {project.live && (
                         <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full text-neutral-300 hover:bg-white/10 hover:text-white">
                            <Link href={project.live} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-5 w-5" />
                            </Link>
                        </Button>
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
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ perspective: "2000px" }}>
                {filteredProjects.map((project) => (
                  <div key={project.id} className="relative group">
                    <ProjectCard project={project} />
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
