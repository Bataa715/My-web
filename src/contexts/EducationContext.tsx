"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Education } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { collection, getDocs, doc, query, orderBy, Timestamp, serverTimestamp, writeBatch, addDoc, deleteDoc, updateDoc } from "firebase/firestore";

interface EducationContextType {
  education: Education[];
  addEducation: (education: Omit<Education, 'id' | 'createdAt'>) => Promise<void>;
  updateEducation: (educationId: string, education: Partial<Omit<Education, 'id' | 'createdAt'>>) => Promise<void>;
  deleteEducation: (educationId: string) => Promise<void>;
  loading: boolean;
}

const EducationContext = createContext<EducationContextType | undefined>(undefined);

const initialEducation: Omit<Education, 'id' | 'createdAt'>[] = [
    {
      degree: "Ерөнхий боловсрол",
      school: "Оюуны Ирээдүй Цогцолбор",
      startDate: new Date("2019-09-01"),
      endDate: new Date("2022-06-15"),
      score: "98.5",
    },
    {
      degree: "Мэдээллийн технологийн бакалавр",
      school: "Монгол Улсын Их Сургууль",
      startDate: new Date("2022-09-01"),
      endDate: new Date("2026-06-15"),
      score: "3.7",
    },
];

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
    };
    const educationCollectionRef = collection(firestore, `users/${user.uid}/education`);

    const fetchEducation = async () => {
      setLoading(true);
      try {
        const q = query(educationCollectionRef, orderBy("startDate", "desc"));
        const educationSnapshot = await getDocs(q);

        if (educationSnapshot.empty) {
            console.log("No education found, seeding initial education...");
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
                    startDate: (data.startDate as Timestamp)?.toDate(),
                    endDate: (data.endDate as Timestamp)?.toDate(),
                    createdAt: (data.createdAt as Timestamp)?.toDate() 
                } as Education;
            });
            setEducation(educationList);

        } else {
            const educationList = educationSnapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data,
                    startDate: (data.startDate as Timestamp)?.toDate(),
                    endDate: (data.endDate as Timestamp)?.toDate(),
                    createdAt: (data.createdAt as Timestamp)?.toDate() 
                } as Education;
            });
            setEducation(educationList);
        }

      } catch (error) {
        console.error("Error fetching education: ", error);
        toast({
          title: "Алдаа",
          description: "Боловсролын мэдээллийг дуудахад алдаа гарлаа.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
  }, [firestore, user, toast]);
  
  const addEducation = async (edu: Omit<Education, 'id' | 'createdAt'>) => {
    if (!firestore || !user) {
        toast({ title: "Алдаа", description: "Нэвтэрч орно уу.", variant: "destructive" });
        return;
    };
    const educationCollection = collection(firestore, `users/${user.uid}/education`);
    try {
        const newEducationData = { 
            ...edu, 
            startDate: new Date(edu.startDate),
            endDate: new Date(edu.endDate),
            createdAt: serverTimestamp() 
        };
        
        const docRef = await addDoc(educationCollection, newEducationData);
        const newEducation = { 
            ...edu, 
            id: docRef.id, 
            startDate: new Date(edu.startDate),
            endDate: new Date(edu.endDate),
            createdAt: new Date() 
        } as Education;
      
        setEducation((prev) => [newEducation, ...prev].sort((a, b) => (b.startDate as Date).getTime() - (a.startDate as Date).getTime()));

        toast({
            title: "Амжилттай нэмэгдлээ",
            description: `"${edu.degree}" нэмэгдлээ.`,
        });
    } catch (error) {
        console.error("Error adding education: ", error);
        toast({
            title: "Алдаа",
            description: "Боловсрол нэмэхэд алдаа гарлаа.",
            variant: "destructive",
        });
    }
  };

  const updateEducation = async (educationId: string, eduUpdate: Partial<Omit<Education, 'id' | 'createdAt'>>) => {
    if (!firestore || !user) {
      toast({ title: "Алдаа", description: "Нэвтэрч орно уу.", variant: "destructive" });
      return;
    }
    const originalEducation = education;
    const formattedUpdate = {
        ...eduUpdate,
        ...(eduUpdate.startDate && { startDate: new Date(eduUpdate.startDate) }),
        ...(eduUpdate.endDate && { endDate: new Date(eduUpdate.endDate) }),
    }

    setEducation(prev => prev.map(e => e.id === educationId ? { ...e, ...formattedUpdate } as Education : e));

    try {
      const educationDoc = doc(firestore, `users/${user.uid}/education`, educationId);
      await updateDoc(educationDoc, formattedUpdate);
      toast({
        title: "Амжилттай шинэчлэгдлээ",
        description: `Боловсролын мэдээлэл шинэчлэгдлээ.`,
      });
    } catch (error) {
      console.error("Error updating education: ", error);
      setEducation(originalEducation);
      toast({
        title: "Алдаа",
        description: "Боловсрол шинэчлэхэд алдаа гарлаа.",
        variant: "destructive",
      });
    }
  };
  
  const deleteEducation = async (educationId: string) => {
    if (!firestore || !user) {
         toast({ title: "Алдаа", description: "Нэвтэрч орно уу.", variant: "destructive" });
        return;
    };

    const originalEducation = [...education];
    const educationToDelete = education.find(p => p.id === educationId);
    if (!educationToDelete) return;

    setEducation((prev) => prev.filter(p => p.id !== educationId));

    try {
      const educationDoc = doc(firestore, `users/${user.uid}/education`, educationId);
      await deleteDoc(educationDoc);
      toast({
        title: "Устгагдлаа",
        description: `"${educationToDelete?.degree}" устгагдлаа.`,
      });
    } catch (error) {
      console.error("Error deleting education: ", error);
      setEducation(originalEducation);
      toast({
        title: "Алдаа",
        description: "Боловсрол устгахад алдаа гарлаа.",
        variant: "destructive",
      });
    }
  };

  return (
    <EducationContext.Provider value={{ education, addEducation, updateEducation, deleteEducation, loading }}>
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
