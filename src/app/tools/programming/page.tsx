'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  collection,
  getDocs,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import BackButton from '@/components/shared/BackButton';
import type { Language } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import LanguageCard from './components/LanguageCard';
import { AddLanguageDialog } from './components/AddLanguageDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Code, Sparkles } from 'lucide-react';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import { AnimatePresence } from 'framer-motion';

const colorCycle = [
  '168, 85, 247', // Primary (purple)
  '59, 130, 246', // Blue
  '16, 185, 129', // Green
  '249, 115, 22', // Orange
  '244, 63, 94', // Rose
];

export default function ProgrammingPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || !firestore) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const languagesRef = collection(firestore, `users/${user.uid}/languages`);
      const q = query(languagesRef, orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);

      const langData = snapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() }) as Language
      );
      setLanguages(langData);
    } catch (error) {
      console.error('Error fetching programming languages:', error);
      toast({
        title: 'Алдаа',
        description: 'Програмчлалын хэлний мэдээлэл татахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [firestore, user, toast]);

  useEffect(() => {
    if (user && firestore) {
      fetchData();
    } else if (!user) {
      setLoading(false);
    }
  }, [user, firestore, fetchData]);

  const handleAddLanguage = async (
    language: Omit<Language, 'id' | 'createdAt' | 'progress' | 'primaryColor'>
  ) => {
    if (!user || !firestore) return;
    const langRef = collection(firestore, `users/${user.uid}/languages`);
    try {
      const newLang = {
        ...language,
        progress: 0,
        createdAt: serverTimestamp(),
        primaryColor: colorCycle[languages.length % colorCycle.length],
      };
      const docRef = await addDoc(langRef, newLang);
      setLanguages(prev => [
        ...prev,
        {
          ...language,
          id: docRef.id,
          progress: 0,
          primaryColor: newLang.primaryColor,
          createdAt: new Date(),
        } as Language,
      ]);
      toast({ title: 'Амжилттай нэмэгдлээ.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Алдаа гарлаа', variant: 'destructive' });
    }
  };

  const handleDeleteLanguage = async (id: string, name: string) => {
    if (!user || !firestore) return;
    const originalLanguages = [...languages];
    const skillToDelete = languages.find(s => s.id === id);
    if (!skillToDelete) return;
    setLanguages(prev => prev.filter(s => s.id !== id));
    try {
      const skillDoc = doc(firestore, `users/${user.uid}/languages`, id);
      await deleteDoc(skillDoc);
      toast({
        title: 'Амжилттай',
        description: `"${name}" хэл устгагдлаа.`,
      });
    } catch (error) {
      setLanguages(originalLanguages);
      console.error('Error deleting language: ', error);
      toast({
        title: 'Алдаа',
        description: 'Хэл устгахад алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative min-h-screen"
    >
      <InteractiveParticles quantity={50} />
      <div className="space-y-8 p-4 md:p-8 relative z-10">
        <div className="flex justify-between items-center">
          <BackButton />
          <AddLanguageDialog onAddLanguage={handleAddLanguage}>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-lg shadow-orange-500/25">
              <PlusCircle className="mr-2 h-4 w-4" />
              Шинэ хэл нэмэх
            </Button>
          </AddLanguageDialog>
        </div>

        {/* Hero Section */}
        <div className="text-center pt-4 pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 mb-6"
          >
            <Code className="h-4 w-4" />
            <span className="text-sm font-medium">Код бичиж сур</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
            The Language Library
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Өөрийн суралцах програмчлалын хэлнүүдээ удирдаарай
          </p>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl bg-card/50" />
            ))}
          </div>
        ) : !user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20 mt-4 bg-card/50 backdrop-blur-xl rounded-2xl border-0"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 mb-4">
              <Code className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-lg text-muted-foreground">
              Хэлнүүдийг харахын тулд нэвтэрнэ үү.
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            <AnimatePresence>
              {languages.map((lang, index) => (
                <LanguageCard
                  key={lang.id}
                  language={lang}
                  index={index}
                  onDelete={handleDeleteLanguage}
                />
              ))}
            </AnimatePresence>
            {languages.length === 0 && (
              <div className="col-span-full text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                  <Code className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Та одоогоор ямар ч хэл нэмээгүй байна.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
