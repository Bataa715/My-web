'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import type { Education } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import {
  collection,
  getDocs,
  doc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
  writeBatch,
  addDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

// Helper function to convert Timestamp or Date to Date
const toDate = (value: any): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'string') return new Date(value);
  if (typeof value === 'object' && value.seconds)
    return new Timestamp(value.seconds, value.nanoseconds).toDate();
  return new Date();
};

interface EducationContextType {
  education: Education[];
  addEducation: (
    education: Omit<Education, 'id' | 'createdAt'>
  ) => Promise<void>;
  updateEducation: (
    educationId: string,
    education: Partial<Omit<Education, 'id' | 'createdAt'>>
  ) => Promise<void>;
  deleteEducation: (educationId: string) => Promise<void>;
  loading: boolean;
}

const EducationContext = createContext<EducationContextType | undefined>(
  undefined
);

const initialEducation: Omit<Education, 'id' | 'createdAt'>[] = [];

export function EducationProvider({ children }: { children: ReactNode }) {
  const { firestore, user } = useFirebase();
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !firestore) {
      setLoading(false);
      setEducation([]);
      return;
    }
    const educationCollectionRef = collection(
      firestore,
      `users/${user.uid}/education`
    );

    const fetchEducation = async () => {
      setLoading(true);
      try {
        const q = query(educationCollectionRef, orderBy('startDate', 'asc'));
        const educationSnapshot = await getDocs(q);

        if (educationSnapshot.empty) {
          const batch = writeBatch(firestore);
          initialEducation.forEach(edu => {
            const docRef = doc(educationCollectionRef);
            batch.set(docRef, { ...edu, createdAt: serverTimestamp() });
          });
          await batch.commit();

          const newSnapshot = await getDocs(q);
          const educationList = newSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              startDate: toDate(data.startDate),
              endDate: toDate(data.endDate),
              createdAt: toDate(data.createdAt),
            } as Education;
          });
          setEducation(educationList);
        } else {
          const educationList = educationSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              startDate: toDate(data.startDate),
              endDate: toDate(data.endDate),
              createdAt: toDate(data.createdAt),
            } as Education;
          });
          setEducation(educationList);
        }
      } catch (error) {
        console.error('Error fetching education: ', error);
        toast({
          title: 'Алдаа',
          description: 'Боловсролын мэдээллийг дуудахад алдаа гарлаа.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
  }, [firestore, user, toast]);

  const addEducation = async (edu: Omit<Education, 'id' | 'createdAt'>) => {
    if (!firestore || !user) {
      toast({
        title: 'Алдаа',
        description: 'Нэвтэрч орно уу.',
        variant: 'destructive',
      });
      return;
    }
    const educationCollection = collection(
      firestore,
      `users/${user.uid}/education`
    );
    try {
      const newEducationData = {
        ...edu,
        startDate: toDate(edu.startDate),
        endDate: toDate(edu.endDate),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(educationCollection, newEducationData);
      const newEducation = {
        ...edu,
        id: docRef.id,
        startDate: toDate(edu.startDate),
        endDate: toDate(edu.endDate),
        createdAt: new Date(),
      } as Education;

      setEducation(prev =>
        [...prev, newEducation].sort(
          (a, b) =>
            toDate(a.startDate).getTime() - toDate(b.startDate).getTime()
        )
      );

      toast({
        title: 'Амжилттай нэмэгдлээ',
        description: `"${edu.degree}" нэмэгдлээ.`,
      });
    } catch (error) {
      console.error('Error adding education: ', error);
      toast({
        title: 'Алдаа',
        description: 'Боловсрол нэмэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  const updateEducation = async (
    educationId: string,
    eduUpdate: Partial<Omit<Education, 'id' | 'createdAt'>>
  ) => {
    if (!firestore || !user) {
      toast({
        title: 'Алдаа',
        description: 'Нэвтэрч орно уу.',
        variant: 'destructive',
      });
      return;
    }
    const originalEducation = education;
    const formattedUpdate = {
      ...eduUpdate,
      ...(eduUpdate.startDate && { startDate: toDate(eduUpdate.startDate) }),
      ...(eduUpdate.endDate && { endDate: toDate(eduUpdate.endDate) }),
    };

    setEducation(prev =>
      prev
        .map(e =>
          e.id === educationId ? ({ ...e, ...formattedUpdate } as Education) : e
        )
        .sort(
          (a, b) =>
            toDate(a.startDate).getTime() - toDate(b.startDate).getTime()
        )
    );

    try {
      const educationDoc = doc(
        firestore,
        `users/${user.uid}/education`,
        educationId
      );
      await updateDoc(educationDoc, formattedUpdate);
      toast({
        title: 'Амжилттай шинэчлэгдлээ',
        description: `Боловсролын мэдээлэл шинэчлэгдлээ.`,
      });
    } catch (error) {
      console.error('Error updating education: ', error);
      setEducation(originalEducation);
      toast({
        title: 'Алдаа',
        description: 'Боловсрол шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  const deleteEducation = async (educationId: string) => {
    if (!firestore || !user) {
      toast({
        title: 'Алдаа',
        description: 'Нэвтэрч орно уу.',
        variant: 'destructive',
      });
      return;
    }

    const originalEducation = [...education];
    const educationToDelete = education.find(p => p.id === educationId);
    if (!educationToDelete) return;

    setEducation(prev => prev.filter(p => p.id !== educationId));

    try {
      const educationDoc = doc(
        firestore,
        `users/${user.uid}/education`,
        educationId
      );
      await deleteDoc(educationDoc);
      toast({
        title: 'Устгагдлаа',
        description: `"${educationToDelete?.degree}" устгагдлаа.`,
      });
    } catch (error) {
      console.error('Error deleting education: ', error);
      setEducation(originalEducation);
      toast({
        title: 'Алдаа',
        description: 'Боловсрол устгахад алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  return (
    <EducationContext.Provider
      value={{
        education,
        addEducation,
        updateEducation,
        deleteEducation,
        loading,
      }}
    >
      {children}
    </EducationContext.Provider>
  );
}

export function useEducation() {
  const context = useContext(EducationContext);
  if (context === undefined) {
    throw new Error('useEducation must be used within an EducationProvider');
  }
  return context;
}
