"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Skill } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, Timestamp, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const initialSkills: Omit<Skill, 'id' | 'createdAt'>[] = [
    { name: 'Програмчлалын хэл', icon: 'Code', items: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'HTML/CSS'] },
    { name: 'Framework & Libraries', icon: 'Library', items: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS'] },
    { name: 'Багж хэрэгсэл', icon: 'Terminal', items: ['Git & GitHub', 'Docker', 'VS Code', 'Figma', 'Firebase'] },
    { name: 'Мэдээллийн сан', icon: 'Database', items: ['MongoDB', 'PostgreSQL', 'MySQL', 'Firestore'] },
];

interface SkillsContextType {
  skills: Skill[];
  loading: boolean;
  addSkillGroup: (group: Omit<Skill, 'id' | 'createdAt'>) => Promise<void>;
  updateSkillGroup: (id: string, updates: Partial<Omit<Skill, 'id'>>) => Promise<void>;
  deleteSkillGroup: (id: string) => Promise<void>;
}

const SkillsContext = createContext<SkillsContextType | undefined>(undefined);

export function SkillsProvider({ children }: { children: ReactNode }) {
  const { firestore, user } = useFirebase();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const skillsCollectionRef = user ? collection(firestore, `users/${user.uid}/skills`) : null;


  useEffect(() => {
    if (!skillsCollectionRef) {
        setLoading(false);
        return;
    };
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const q = query(skillsCollectionRef, orderBy("createdAt", "asc"));
        const skillsSnapshot = await getDocs(q);
        if (skillsSnapshot.empty) {
          const batch = initialSkills.map(s => addDocumentNonBlocking(skillsCollectionRef, { ...s, createdAt: serverTimestamp() }));
          await Promise.all(batch);
          const newSnapshot = await getDocs(q);
          const skillsList = newSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate() 
            } as Skill;
          });
          setSkills(skillsList);
        } else {
            const skillsList = skillsSnapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data,
                    createdAt: (data.createdAt as Timestamp)?.toDate() 
                } as Skill;
            });
            setSkills(skillsList);
        }
      } catch (error) {
        console.error("Error fetching skills: ", error);
        toast({ title: "Алдаа", description: "Ур чадваруудыг дуудахад алдаа гарлаа.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [skillsCollectionRef, toast]);

  const addSkillGroup = async (group: Omit<Skill, 'id' | 'createdAt'>) => {
    if (!skillsCollectionRef) return;
    try {
      const newGroup = { ...group, createdAt: serverTimestamp() };
      const docRef = await addDocumentNonBlocking(skillsCollectionRef, newGroup);
      setSkills(prev => [...prev, { ...group, id: docRef.id, createdAt: new Date() }]);
      toast({ title: "Амжилттай", description: "Шинэ ур чадварын бүлэг нэмэгдлээ." });
    } catch (error) {
      console.error("Error adding skill group: ", error);
      toast({ title: "Алдаа", description: "Бүлэг нэмэхэд алдаа гарлаа.", variant: "destructive" });
    }
  };

  const updateSkillGroup = async (id: string, updates: Partial<Omit<Skill, 'id'>>) => {
    if (!skillsCollectionRef || !user) return;
    try {
      const skillDoc = doc(firestore, `users/${user.uid}/skills`, id);
      updateDocumentNonBlocking(skillDoc, updates);
      setSkills(prev => prev.map(s => s.id === id ? { ...s, ...updates } as Skill : s));
      toast({ title: "Амжилттай", description: "Ур чадварын бүлэг шинэчлэгдлээ." });
    } catch (error) {
      console.error("Error updating skill group: ", error);
      toast({ title: "Алдаа", description: "Бүлэг шинэчлэхэд алдаа гарлаа.", variant: "destructive" });
    }
  };

  const deleteSkillGroup = async (id: string) => {
    if (!skillsCollectionRef || !user) return;
    try {
      const skillDoc = doc(firestore, `users/${user.uid}/skills`, id);
      deleteDocumentNonBlocking(skillDoc);
      setSkills(prev => prev.filter(s => s.id !== id));
      toast({ title: "Амжилттай", description: "Ур чадварын бүлэг устгагдлаа." });
    } catch (error) {
      console.error("Error deleting skill group: ", error);
      toast({ title: "Алдаа", description: "Бүлэг устгахад алдаа гарлаа.", variant: "destructive" });
    }
  };


  return (
    <SkillsContext.Provider value={{ skills, loading, addSkillGroup, updateSkillGroup, deleteSkillGroup }}>
      {children}
    </SkillsContext.Provider>
  );
}

export function useSkills() {
  const context = useContext(SkillsContext);
  if (context === undefined) {
    throw new Error('useSkills must be used within a SkillsProvider');
  }
  return context;
}
