
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Project } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { collection, getDocs, doc, query, orderBy, Timestamp, serverTimestamp, writeBatch, addDoc, deleteDoc, updateDoc } from "firebase/firestore";

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (projectId: string, project: Partial<Omit<Project, 'id' | 'createdAt'>>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const initialProjects: Omit<Project, 'id' | 'createdAt'>[] = [];

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
    const projectsCollection = collection(firestore, `users/${user.uid}/projects`);
    try {
        const newProjectData = { ...project, createdAt: serverTimestamp() };
        
        const docRef = await addDoc(projectsCollection, newProjectData);
        const newProject = { ...project, id: docRef.id, createdAt: new Date() } as Project;
      
        setProjects((prevProjects) => [newProject, ...prevProjects]);

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
    }
  };

  const updateProject = async (projectId: string, projectUpdate: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    if (!firestore || !user) {
      toast({ title: "Алдаа", description: "Нэвтэрч орно уу.", variant: "destructive" });
      return;
    }
    const originalProjects = projects;
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...projectUpdate } as Project : p));

    try {
      const projectDoc = doc(firestore, `users/${user.uid}/projects`, projectId);
      await updateDoc(projectDoc, projectUpdate);
      toast({
        title: "Амжилттай шинэчлэгдлээ",
        description: `Төсөл шинэчлэгдлээ.`,
      });
    } catch (error) {
      console.error("Error updating project: ", error);
      setProjects(originalProjects);
      toast({
        title: "Алдаа",
        description: "Төсөл шинэчлэхэд алдаа гарлаа.",
        variant: "destructive",
      });
    }
  };
  
  const deleteProject = async (projectId: string) => {
    if (!firestore || !user) {
         toast({ title: "Алдаа", description: "Нэвтэрч орно уу.", variant: "destructive" });
        return;
    };

    const originalProjects = [...projects];
    const projectToDelete = projects.find(p => p.id === projectId);
    if (!projectToDelete) return;

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
      setProjects(originalProjects);
      toast({
        title: "Алдаа",
        description: "Төсөл устгахад алдаа гарлаа.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProject, deleteProject, loading }}>
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
