'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useFirebase } from '@/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { readCache, writeCache } from '@/lib/firestore-cache';

export interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: string; // Path to image like /images/exp1.png
}

interface ExperienceContextType {
  experiences: ExperienceItem[];
  loading: boolean;
  addExperience: (experience: Omit<ExperienceItem, 'id'>) => Promise<void>;
  updateExperience: (
    id: string,
    experience: Omit<ExperienceItem, 'id'>
  ) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(
  undefined
);

export const ExperienceProvider = ({ children }: { children: ReactNode }) => {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore || !user) {
      setLoading(false);
      setExperiences([]);
      return;
    }

    // 1. Hydrate from cache for instant first paint
    const cacheKey = `experiences::${user.uid}`;
    const cached = readCache<ExperienceItem[]>(cacheKey);
    if (cached && cached.length) {
      setExperiences(cached);
      setLoading(false);
    }

    // 2. Live snapshot subscription
    const experiencesRef = collection(
      firestore,
      'users',
      user.uid,
      'experiences'
    );
    const unsubscribe = onSnapshot(
      experiencesRef,
      snapshot => {
        const experiencesData = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        })) as ExperienceItem[];
        setExperiences(experiencesData);
        writeCache(cacheKey, experiencesData);
        setLoading(false);
      },
      error => {
        console.error('Error subscribing to experiences:', error);
        toast({
          title: 'Алдаа',
          description: 'Туршлагын мэдээллийг татахад алдаа гарлаа.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [firestore, user, toast]);

  const addExperience = async (experience: Omit<ExperienceItem, 'id'>) => {
    if (!firestore || !user) return;

    try {
      const experiencesRef = collection(
        firestore,
        'users',
        user.uid,
        'experiences'
      );
      const docRef = await addDoc(experiencesRef, experience);
      setExperiences(prev => [...prev, { id: docRef.id, ...experience }]);
      toast({ title: 'Амжилттай', description: 'Туршлага нэмэгдлээ.' });
    } catch (error) {
      console.error('Error adding experience:', error);
      toast({
        title: 'Алдаа',
        description: 'Туршлага нэмэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  const updateExperience = async (
    id: string,
    experience: Omit<ExperienceItem, 'id'>
  ) => {
    if (!firestore || !user) return;

    try {
      const experienceRef = doc(
        firestore,
        'users',
        user.uid,
        'experiences',
        id
      );
      await updateDoc(experienceRef, experience);
      setExperiences(prev =>
        prev.map(exp => (exp.id === id ? { id, ...experience } : exp))
      );
      toast({ title: 'Амжилттай', description: 'Туршлага шинэчлэгдлээ.' });
    } catch (error) {
      console.error('Error updating experience:', error);
      toast({
        title: 'Алдаа',
        description: 'Туршлага шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  const deleteExperience = async (id: string) => {
    if (!firestore || !user) return;

    try {
      const experienceRef = doc(
        firestore,
        'users',
        user.uid,
        'experiences',
        id
      );
      await deleteDoc(experienceRef);
      setExperiences(prev => prev.filter(exp => exp.id !== id));
      toast({ title: 'Амжилттай', description: 'Туршлага устгагдлаа.' });
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast({
        title: 'Алдаа',
        description: 'Туршлага устгахад алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  return (
    <ExperienceContext.Provider
      value={{
        experiences,
        loading,
        addExperience,
        updateExperience,
        deleteExperience,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error('useExperience must be used within ExperienceProvider');
  }
  return context;
};
