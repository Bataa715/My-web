'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import type { Experience } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import {
  collection,
  onSnapshot,
  doc,
  query,
  orderBy,
  serverTimestamp,
  addDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

interface ExperienceContextType {
  experiences: Experience[];
  addExperience: (exp: Omit<Experience, 'id' | 'createdAt'>) => Promise<void>;
  updateExperience: (
    id: string,
    exp: Partial<Omit<Experience, 'id' | 'createdAt'>>
  ) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  loading: boolean;
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(
  undefined
);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const { firestore, user } = useFirebase();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !firestore) {
      setLoading(false);
      setExperiences([]);
      return;
    }

    const colRef = collection(firestore, 'users', user.uid, 'experiences');
    const q = query(colRef, orderBy('startDate', 'desc'));
    const unsub = onSnapshot(
      q,
      snap => {
        setExperiences(
          snap.docs.map(d => ({ id: d.id, ...d.data() } as Experience))
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [user, firestore]);

  const addExperience = async (exp: Omit<Experience, 'id' | 'createdAt'>) => {
    if (!user || !firestore) return;
    try {
      await addDoc(collection(firestore, 'users', user.uid, 'experiences'), {
        ...exp,
        createdAt: serverTimestamp(),
      });
      toast({ title: '✓ Ажилын туршлага нэмлээ' });
    } catch {
      toast({ title: 'Алдаа гарлаа', variant: 'destructive' });
    }
  };

  const updateExperience = async (
    id: string,
    exp: Partial<Omit<Experience, 'id' | 'createdAt'>>
  ) => {
    if (!user || !firestore) return;
    try {
      await updateDoc(
        doc(firestore, 'users', user.uid, 'experiences', id),
        exp
      );
      toast({ title: '✓ Шинэчлэлт хадгалагдлаа' });
    } catch {
      toast({ title: 'Алдаа гарлаа', variant: 'destructive' });
    }
  };

  const deleteExperience = async (id: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'experiences', id));
      toast({ title: 'Устгалаа' });
    } catch {
      toast({ title: 'Устгаж чадсангүй', variant: 'destructive' });
    }
  };

  return (
    <ExperienceContext.Provider
      value={{
        experiences,
        addExperience,
        updateExperience,
        deleteExperience,
        loading,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx)
    throw new Error('useExperience must be used within ExperienceProvider');
  return ctx;
}
