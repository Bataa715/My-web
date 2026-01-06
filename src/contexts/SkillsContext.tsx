'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import type { Skill } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useMemoFirebase } from '@/firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

interface SkillsContextType {
  skills: Skill[];
  loading: boolean;
  addSkillGroup: (group: Omit<Skill, 'id' | 'createdAt'>) => Promise<void>;
  updateSkillGroup: (
    id: string,
    updates: Partial<Omit<Skill, 'id' | 'createdAt'>>
  ) => Promise<void>;
  deleteSkillGroup: (id: string) => Promise<void>;
}

const SkillsContext = createContext<SkillsContextType | undefined>(undefined);

const initialSkillsData: Omit<Skill, 'id' | 'createdAt'>[] = [];

export function SkillsProvider({ children }: { children: ReactNode }) {
  const { firestore, user } = useFirebase();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const skillsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/skills`);
  }, [user, firestore]);

  useEffect(() => {
    if (!skillsCollectionRef) {
      if (!user) {
        setLoading(false);
        setSkills([]);
      }
      return;
    }
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const q = query(skillsCollectionRef, orderBy('createdAt', 'asc'));
        const skillsSnapshot = await getDocs(q);

        const skillsList = skillsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate(),
          } as Skill;
        });
        setSkills(skillsList);

      } catch (error) {
        toast({
          title: 'Алдаа',
          description: 'Ур чадваруудыг дуудахад алдаа гарлаа.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [skillsCollectionRef, toast, user, firestore]);

  const addSkillGroup = async (group: Omit<Skill, 'id' | 'createdAt'>) => {
    if (!skillsCollectionRef) return;
    try {
      const newGroup = { ...group, createdAt: serverTimestamp() };
      const docRef = await addDoc(skillsCollectionRef, newGroup);
      setSkills(prev => [
        ...prev,
        { ...group, id: docRef.id, createdAt: new Date() } as Skill,
      ]);
      toast({
        title: 'Амжилттай',
        description: 'Шинэ ур чадварын бүлэг нэмэгдлээ.',
      });
    } catch (error) {
      toast({
        title: 'Алдаа',
        description: 'Бүлэг нэмэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  const updateSkillGroup = async (
    id: string,
    updates: Partial<Omit<Skill, 'id' | 'createdAt'>>
  ) => {
    if (!user || !firestore) return;
    const originalSkills = skills;
    setSkills(prev =>
      prev.map(s => (s.id === id ? ({ ...s, ...updates } as Skill) : s))
    );
    try {
      const skillDoc = doc(firestore, `users/${user.uid}/skills`, id);
      await updateDoc(skillDoc, updates);
      toast({
        title: 'Амжилттай',
        description: 'Ур чадварын бүлэг шинэчлэгдлээ.',
      });
    } catch (error) {
      setSkills(originalSkills);
      console.error('Error updating skill group: ', error);
      toast({
        title: 'Алдаа',
        description: 'Бүлэг шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  const deleteSkillGroup = async (id: string) => {
    if (!user || !firestore) return;
    const originalSkills = [...skills];
    const skillToDelete = skills.find(s => s.id === id);
    if (!skillToDelete) return;
    setSkills(prev => prev.filter(s => s.id !== id));
    try {
      const skillDoc = doc(firestore, `users/${user.uid}/skills`, id);
      await deleteDoc(skillDoc);
      toast({
        title: 'Амжилттай',
        description: `"${skillToDelete.name}" бүлэг устгагдлаа.`,
      });
    } catch (error) {
      setSkills(originalSkills);
      console.error('Error deleting skill group: ', error);
      toast({
        title: 'Алдаа',
        description: 'Бүлэг устгахад алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  return (
    <SkillsContext.Provider
      value={{
        skills,
        loading,
        addSkillGroup,
        updateSkillGroup,
        deleteSkillGroup,
      }}
    >
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
