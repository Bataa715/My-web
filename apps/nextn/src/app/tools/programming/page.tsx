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
import type { Language } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import LanguageCard from './components/LanguageCard';
import { AddLanguageDialog } from './components/AddLanguageDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Code } from 'lucide-react';
import ToolPageShell from '@/components/shared/ToolPageShell';
import { AnimatePresence } from 'framer-motion';

const colorCycle = [
  '168, 85, 247',
  '59, 130, 246',
  '16, 185, 129',
  '249, 115, 22',
  '244, 63, 94',
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
    setLanguages(prev => prev.filter(s => s.id !== id));
    try {
      const skillDoc = doc(firestore, `users/${user.uid}/languages`, id);
      await deleteDoc(skillDoc);
      toast({ title: 'Амжилттай', description: `"${name}" хэл устгагдлаа.` });
    } catch (error) {
      setLanguages(originalLanguages);
      console.error('Error deleting language: ', error);
      toast({ title: 'Алдаа', description: 'Хэл устгахад алдаа гарлаа.', variant: 'destructive' });
    }
  };

  return (
    <ToolPageShell
      title="Програмчлалын хэл"
      eyebrow="Код бичиж сур"
      icon={<Code className="h-8 w-8" />}
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/tools' },
        { label: 'Програмчлал' },
      ]}
    >
      <div className="space-y-6 pt-2">
        <div className="flex justify-end">
          <AddLanguageDialog onAddLanguage={handleAddLanguage}>
            <Button className="bg-primary text-primary-foreground border-0 shadow-lg gap-2">
              <PlusCircle className="h-4 w-4" />
              Шинэ хэл нэмэх
            </Button>
          </AddLanguageDialog>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl bg-card/50" />
            ))}
          </div>
        ) : !user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-card/50 backdrop-blur-xl rounded-2xl"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Code className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground">
              Хэлнүүдийг харахын тулд нэвтэрнэ үү.
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
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
    </ToolPageShell>
  );
}
