'use client';

import { useProjects } from '@/contexts/ProjectContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { Button } from '../ui/button';
import { ArrowRight, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { useEditMode } from '@/contexts/EditModeContext';
import { AddProjectDialog } from '../AddProjectDialog';


const Projects = () => {
  const { projects, loading, deleteProject } = useProjects();
  const { isEditMode } = useEditMode();

  return (
    <section id="projects" className="container py-12 md:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold font-headline">Миний төслүүд</h2>
        <p className="mt-2 text-muted-foreground">Би юу хийж бүтээсэн бэ?</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="mt-4 h-8 w-3/4" />
              <Skeleton className="mt-2 h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>>
        ))}

        {!loading && projects.map((project) => (
          <Card key={project.id} className="group relative flex flex-col">
             {isEditMode && (
              <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={() => deleteProject(project.id)}>
                <Trash2 />
              </Button>
            )}
            <CardHeader>
              <div className="relative h-64 w-full overflow-hidden rounded-t-lg">
                <Image
                  src={project.imageUrl}
                  alt={project.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardTitle className="mt-4">{project.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription>{project.description}</CardDescription>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href={project.link} target="_blank">
                  Дэлгэрэнгүй <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
         {isEditMode && (
          <AddProjectDialog>
            <button className="flex h-full min-h-[400px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/20 text-muted-foreground transition-colors hover:border-primary hover:bg-muted/50 hover:text-primary">
              <PlusCircle size={48} />
              <span className="mt-4 font-semibold">Шинэ төсөл нэмэх</span>
            </button>
          </AddProjectDialog>
        )}
      </div>
    </section>
  );
};

export default Projects;
