"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Project } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { collection, getDocs, doc, query, orderBy, Timestamp, serverTimestamp, writeBatch } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const initialProjects: Omit<Project, 'id' | 'createdAt'>[] = [
    {
      name: "Хувийн вебсайт",
      description: "Миний ур чадвар, туршлага, хийсэн төслүүдийг нэгтгэсэн вебсайт.",
      technologies: ["Next.js", "React", "Tailwind CSS", "Firebase"],
      category: "Web",
      link: "https://github.com/Bataa715",
      live: "https://www.ka1zen.me",
    },
    {
      name: "Зургийн танигч",
      description: "TensorFlow ашиглан зураг таних, ангилах модель хөгжүүлсэн.",
      technologies: ["Python", "TensorFlow", "OpenCV"],
      category: "AI",
      link: "https://github.com/Bataa715",
    },
    {
      name: "Чат аппликейшн",
      description: "Real-time чатлах боломжтой, энгийн мессенжер.",
      technologies: ["Node.js", "Socket.IO", "React"],
      category: "Web",
      link: "https://github.com/Bataa715",
    },
];

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { firestore, user } = useFirebase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !firestore) {
        setLoading(false);
        setProjects([]);
        return;
    };
    const projectsCollectionRef = collection(firestore, `users/${user.uid}/projects`);

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const q = query(projectsCollectionRef, orderBy("createdAt", "desc"));
        const projectSnapshot = await getDocs(q);

        if (projectSnapshot.empty) {
            console.log("No projects found, seeding initial projects...");
            const batch = writeBatch(firestore);
            initialProjects.forEach(project => {
                const docRef = doc(projectsCollectionRef);
                batch.set(docRef, { ...project, createdAt: serverTimestamp() });
            });
            await batch.commit();
            
            // Re-fetch after seeding
            const newSnapshot = await getDocs(q);
            const projectList = newSnapshot.docs.map(doc => {
                 const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data,
                    createdAt: (data.createdAt as Timestamp)?.toDate() 
                } as Project;
            });
            setProjects(projectList);

        } else {
            const projectList = projectSnapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data,
                    createdAt: (data.createdAt as Timestamp)?.toDate() 
                } as Project;
            });
            setProjects(projectList);
        }

      } catch (error) {
        console.error("Error fetching projects: ", error);
        toast({
          title: "Алдаа",
          description: "Төслүүдийг дуудахад алдаа гарлаа.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [firestore, user, toast]);
  
  const addProject = async (project: Omit<Project, 'id' | 'createdAt'>) => {
    if (!firestore || !user) {
        toast({ title: "Алдаа", description: "Нэвтэрч орно уу.", variant: "destructive" });
        return;
    };
    try {
        const projectsCollection = collection(firestore, `users/${user.uid}/projects`);
        const newProjectData = { ...project, createdAt: serverTimestamp() };
        
        // Optimistically update UI
        const tempId = "temp-" + Date.now();
        const optimisticProject = { ...project, id: tempId, createdAt: new Date() };
        setProjects((prevProjects) => [optimisticProject, ...prevProjects]);

        const docRef = await addDoc(projectsCollection, newProjectData);
      
        // Replace temporary project with real one from Firestore
        setProjects((prevProjects) => prevProjects.map(p => p.id === tempId ? { ...optimisticProject, id: docRef.id } : p));

        toast({
            title: "Амжилттай нэмэгдлээ",
            description: `"${project.name}" төсөл нэмэгдлээ.`,
        });
    } catch (error) {
        console.error("Error adding project: ", error);
        toast({
            title: "Алдаа",
            description: "Төсөл нэмэхэд алдаа гарлаа.",
            variant: "destructive",
        });
        // Rollback optimistic update
        setProjects(prev => prev.filter(p => !p.id?.startsWith('temp-')));
    }
  };
  
  const deleteProject = async (projectId: string) => {
    if (!firestore || !user) {
         toast({ title: "Алдаа", description: "Нэвтэрч орно уу.", variant: "destructive" });
        return;
    };

    const projectToDelete = projects.find(p => p.id === projectId);
    if (!projectToDelete) return;

    // Optimistic UI update
    setProjects((prevProjects) => prevProjects.filter(p => p.id !== projectId));

    try {
      const projectDoc = doc(firestore, `users/${user.uid}/projects`, projectId);
      await deleteDoc(projectDoc);
      toast({
        title: "Устгагдлаа",
        description: `"${projectToDelete?.name}" төсөл устгагдлаа.`,
      });
    } catch (error) {
      console.error("Error deleting project: ", error);
      // Rollback UI update
      setProjects((prevProjects) => [...prevProjects, projectToDelete].sort((a,b) => (b.createdAt as any) - (a.createdAt as any)));
      toast({
        title: "Алдаа",
        description: "Төсөл устгахад алдаа гарлаа.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, deleteProject, loading }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
