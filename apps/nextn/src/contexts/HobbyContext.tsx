'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import type { Hobby } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import {
  collection,
  getDocs,
  doc,
  query,
  Timestamp,
  serverTimestamp,
  writeBatch,
  addDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

const toDateSafe = (value: any): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'string') return new Date(value);
  if (typeof value === 'object' && value.seconds) {
    return new Timestamp(value.seconds, value.nanoseconds).toDate();
  }
  return new Date();
};

interface HobbyContextType {
  hobbies: Hobby[];
  addHobby: (hobby: Omit<Hobby, 'id' | 'createdAt'>) => Promise<void>;
  updateHobby: (
    hobbyId: string,
    hobby: Partial<Omit<Hobby, 'id' | 'createdAt'>>
  ) => Promise<void>;
  deleteHobby: (hobbyId: string) => Promise<void>;
  loading: boolean;
}

const HobbyContext = createContext<HobbyContextType | undefined>(undefined);

const initialHobbies: Omit<Hobby, 'id' | 'createdAt'>[] = [];

export function HobbyProvider({ children }: { children: ReactNode }) {
  const { firestore, user } = useFirebase();
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !firestore) {
      setLoading(false);
      setHobbies([]);
      return;
    }

    const hobbiesCollectionRef = collection(
      firestore,
      `users/${user.uid}/hobbies`
    );

    const fetchHobbies = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(hobbiesCollectionRef);
        const hobbiesList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: toDateSafe(data.createdAt),
          } as Hobby;
        });
        setHobbies(
          hobbiesList.sort(
            (a, b) =>
              (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime()
          )
        );
      } catch (error) {
        console.error('Error fetching hobbies: ', error);
        toast({
          title: 'Алдаа',
          description: 'Хоббины мэдээллийг дуудахад алдаа гарлаа.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHobbies();
  }, [firestore, user, toast]);

  const addHobby = async (hobby: Omit<Hobby, 'id' | 'createdAt'>) => {
    if (!firestore || !user) {
      toast({
        title: 'Алдаа',
        description: 'Нэвтэрч орно уу.',
        variant: 'destructive',
      });
      return;
    }
    const hobbiesCollection = collection(
      firestore,
      `users/${user.uid}/hobbies`
    );
    try {
      const newHobbyData = {
        ...hobby,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(hobbiesCollection, newHobbyData);
      const newHobby = {
        ...hobby,
        id: docRef.id,
        createdAt: new Date(),
      } as Hobby;

      setHobbies(prev =>
        [...prev, newHobby].sort(
          (a, b) =>
            (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime()
        )
      );

      toast({
        title: 'Амжилттай нэмэгдлээ',
        description: `"${hobby.title}" нэмэгдлээ.`,
      });
    } catch (error) {
      console.error('Error adding hobby: ', error);
      toast({
        title: 'Алдаа',
        description: 'Хобби нэмэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  const updateHobby = async (
    hobbyId: string,
    hobbyUpdate: Partial<Omit<Hobby, 'id' | 'createdAt'>>
  ) => {
    if (!firestore || !user) {
      toast({
        title: 'Алдаа',
        description: 'Нэвтэрч орно уу.',
        variant: 'destructive',
      });
      return;
    }
    const originalHobbies = hobbies;

    setHobbies(prev =>
      prev
        .map(h => (h.id === hobbyId ? ({ ...h, ...hobbyUpdate } as Hobby) : h))
        .sort(
          (a, b) =>
            (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime()
        )
    );

    try {
      const hobbyDoc = doc(firestore, `users/${user.uid}/hobbies`, hobbyId);
      await updateDoc(hobbyDoc, hobbyUpdate);
      toast({
        title: 'Амжилттай шинэчлэгдлээ',
        description: `Хоббины мэдээлэл шинэчлэгдлээ.`,
      });
    } catch (error) {
      console.error('Error updating hobby: ', error);
      setHobbies(originalHobbies);
      toast({
        title: 'Алдаа',
        description: 'Хобби шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  const deleteHobby = async (hobbyId: string) => {
    if (!firestore || !user) {
      toast({
        title: 'Алдаа',
        description: 'Нэвтэрч орно уу.',
        variant: 'destructive',
      });
      return;
    }

    const originalHobbies = [...hobbies];
    const hobbyToDelete = hobbies.find(p => p.id === hobbyId);
    if (!hobbyToDelete) return;

    setHobbies(prev => prev.filter(p => p.id !== hobbyId));

    try {
      const hobbyDoc = doc(firestore, `users/${user.uid}/hobbies`, hobbyId);
      await deleteDoc(hobbyDoc);
      toast({
        title: 'Устгагдлаа',
        description: `"${hobbyToDelete?.title}" устгагдлаа.`,
      });
    } catch (error) {
      console.error('Error deleting hobby: ', error);
      setHobbies(originalHobbies);
      toast({
        title: 'Алдаа',
        description: 'Хобби устгахад алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  return (
    <HobbyContext.Provider
      value={{ hobbies, addHobby, updateHobby, deleteHobby, loading }}
    >
      {children}
    </HobbyContext.Provider>
  );
}

export function useHobbies() {
  const context = useContext(HobbyContext);
  if (context === undefined) {
    throw new Error('useHobbies must be used within a HobbyProvider');
  }
  return context;
}
