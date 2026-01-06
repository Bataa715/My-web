'use client';

import { useEffect, useState, useCallback, use } from 'react';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import BackButton from '@/components/shared/BackButton';
import type { Language, Chapter, Note } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LanguageDojoPage({
  params,
}: {
  params: Promise<{ langId: string }>;
}) {
  const { langId } = use(params);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || !firestore || !langId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const langDocRef = doc(firestore, `users/${user.uid}/languages`, langId);
      const chaptersRef = collection(
        firestore,
        `users/${user.uid}/languages/${langId}/chapters`
      );
      const notesRef = collection(
        firestore,
        `users/${user.uid}/languages/${langId}/notes`
      );

      const [langSnap, chaptersSnap, notesSnap] = await Promise.all([
        getDoc(langDocRef),
        getDocs(query(chaptersRef, orderBy('order', 'asc'))),
        getDocs(query(notesRef, orderBy('updatedAt', 'desc'))),
      ]);

      if (langSnap.exists()) {
        setLanguage({ id: langSnap.id, ...langSnap.data() } as Language);
      } else {
        toast({
          title: 'Алдаа',
          description: 'Хэл олдсонгүй.',
          variant: 'destructive',
        });
      }

      const chaptersData = chaptersSnap.docs.map(
        doc => ({ id: doc.id, ...doc.data() }) as Chapter
      );
      setChapters(chaptersData);

      const notesData = notesSnap.docs.map(
        doc => ({ id: doc.id, ...doc.data() }) as Note
      );
      setNotes(notesData);
    } catch (error) {
      console.error('Error fetching language data:', error);
      toast({
        title: 'Алдаа',
        description: 'Мэдээлэл татахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [firestore, user, langId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-10 w-24" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-[60vh] lg:col-span-1 rounded-lg" />
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!language) {
    return (
      <div className="p-4 md:p-8">
        <BackButton />
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-muted-foreground">Хэл олдсонгүй.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <BackButton />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-bold text-primary">
            {language.name} Workspace
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Бүлгүүд</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {chapters.map(chapter => (
                  <li
                    key={chapter.id}
                    className="py-2 border-b border-border last:border-b-0"
                  >
                    {chapter.title}
                  </li>
                ))}
                {chapters.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Бүлэг байхгүй байна.
                  </p>
                )}
              </ul>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notebook</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Сүүлийн үеийн тэмдэглэлүүд энд харагдана.
              </p>
              {/* Notes list will go here */}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Arena</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Өөрийгөө сорьж, мэдлэгээ бататгаарай.
                </p>
                <Button>Шалгалт өгөх</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Code Snippets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Түгээмэл ашигладаг кодын хэсгүүд.
                </p>
                {/* Snippets will go here */}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
