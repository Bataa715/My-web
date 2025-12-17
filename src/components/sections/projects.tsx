"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Github, ExternalLink, Trash2, Loader2, PlusCircle, Edit } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
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

export default function Projects() {
  const { projects, deleteProject, loading } = useProjects();
  const { isEditMode } = useEditMode();
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);
      
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section id="projects" className="py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">Миний төслүүд</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Миний хийсэн ажлууд, технологийн шийдлүүдтэй танилцана уу.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
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
            <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <AnimatePresence>
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onMouseMove={handleMouseMove}
                    className="project-card rounded-lg"
                  >
                    <Card className={cn("flex h-full flex-col overflow-hidden transition-shadow duration-300 bg-card/80 backdrop-blur-sm group border-transparent", isEditMode ? "hover:shadow-lg" : "")}>
                      {isEditMode && (
                         <div className="absolute top-2 right-2 flex gap-1 z-10">
                            <EditProjectDialog project={project}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </EditProjectDialog>
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
                      <CardHeader>
                        <CardTitle className="font-headline">{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="secondary">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 bg-muted/50 p-4">
                        {project.link && (
                          <Button asChild variant="ghost" size="icon">
                            <Link href={project.link} target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository">
                              <Github className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {project.live && (
                          <Button asChild variant="ghost" size="icon">
                            <Link href={project.live} target="_blank" rel="noopener noreferrer" aria-label="Live Demo">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
                 {isEditMode && (
                   <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <AddProjectDialog>
                      <button className="flex h-full min-h-[400px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/20 text-muted-foreground transition-colors hover:border-primary hover:bg-muted/50 hover:text-primary">
                        <PlusCircle size={48} />
                        <span className="mt-4 font-semibold">Шинэ төсөл нэмэх</span>
                      </button>
                    </AddProjectDialog>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
