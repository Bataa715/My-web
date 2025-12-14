"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Skill } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, Timestamp, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


interface SkillsContextType {
  skills: Skill[];
  loading: boolean;
  addSkillGroup: (group: Omit<Skill, 'id' | 'createdAt'>) => Promise<void>;
  updateSkillGroup: (id: string, updates: Partial<Skill>) => Promise<void>;
  deleteSkillGroup: (id: string) => Promise<void>;
}

const SkillsContext = createContext<SkillsContextType | undefined>(undefined);

export function SkillsProvider({ children }: { children: ReactNode }) {
  const { firestore, user } = useFirebase();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore || !user) return;
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const skillsCollection = collection(firestore, `users/${user.uid}/skills`);
        const q = query(skillsCollection, orderBy("createdAt", "asc"));
        const skillsSnapshot = await getDocs(q);
        const skillsList = skillsSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate() 
            } as Skill;
        });
        setSkills(skillsList);
      } catch (error) {
        console.error("Error fetching skills: ", error);
        toast({ title: "Алдаа", description: "Ур чадваруудыг дуудахад алдаа гарлаа.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [firestore, user, toast]);

  const addSkillGroup = async (group: Omit<Skill, 'id' | 'createdAt'>) => {
    if (!firestore || !user) return;
    try {
      const skillsCollection = collection(firestore, `users/${user.uid}/skills`);
      const newGroup = { ...group, createdAt: serverTimestamp() };
      const docRef = await addDocumentNonBlocking(skillsCollection, newGroup);
      setSkills(prev => [...prev, { ...group, id: docRef.id, createdAt: new Date() }]);
      toast({ title: "Амжилттай", description: "Шинэ ур чадварын бүлэг нэмэгдлээ." });
    } catch (error) {
      console.error("Error adding skill group: ", error);
      toast({ title: "Алдаа", description: "Бүлэг нэмэхэд алдаа гарлаа.", variant: "destructive" });
    }
  };

  const updateSkillGroup = async (id: string, updates: Partial<Skill>) => {
    if (!firestore || !user) return;
    try {
      const skillDoc = doc(firestore, `users/${user.uid}/skills`, id);
      await updateDocumentNonBlocking(skillDoc, updates);
      setSkills(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      toast({ title: "Амжилттай", description: "Ур чадварын бүлэг шинэчлэгдлээ." });
    } catch (error) {
      console.error("Error updating skill group: ", error);
      toast({ title: "Алдаа", description: "Бүлэг шинэчлэхэд алдаа гарлаа.", variant: "destructive" });
    }
  };

  const deleteSkillGroup = async (id: string) => {
    if (!firestore || !user) return;
    try {
      const skillDoc = doc(firestore, `users/${user.uid}/skills`, id);
      await deleteDocumentNonBlocking(skillDoc);
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
