
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { Note } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/shared/BackButton';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function NotesPage() {
  const { firestore, user } = useFirebase();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!user || !firestore) {
      setLoading(false);
      return;
    }

    const fetchNotes = async () => {
      setLoading(true);
      try {
        const notesCollection = collection(firestore, `users/${user.uid}/notes`);
        const q = query(notesCollection, orderBy('updatedAt', 'desc'));
        const notesSnapshot = await getDocs(q);
        const notesList = notesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as any)?.toDate(),
                updatedAt: (data.updatedAt as any)?.toDate(),
            } as Note;
        });
        setNotes(notesList);
      } catch (error) {
        console.error("Error fetching notes: ", error);
        toast({ title: "Алдаа", description: "Тэмдэглэл татахад алдаа гарлаа.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [firestore, user, toast]);

  const handleCreateNewNote = async () => {
    if (!firestore || !user) {
        toast({ title: "Алдаа", description: "Тэмдэглэл үүсгэхийн тулд нэвтэрнэ үү.", variant: "destructive" });
        return;
    }
    try {
        const notesCollection = collection(firestore, `users/${user.uid}/notes`);
        const docRef = await addDoc(notesCollection, { 
            title: "Гарчиггүй тэмдэглэл",
            content: "# Эндээс эхэлнэ үү...",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        toast({ title: "Амжилттай", description: "Шинэ тэмдэглэл үүслээ." });
        router.push(`/tools/notes/${docRef.id}`);
    } catch (error) {
        console.error("Error creating new note: ", error);
        toast({ title: "Алдаа", description: "Тэмдэглэл үүсгэхэд алдаа гарлаа.", variant: "destructive" });
    }
  };
  
  const formatDate = (date: any) => {
    if (!date) return 'Unknown date';
    try {
      return format(date, 'yyyy-MM-dd HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  }

  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center pt-8 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold font-headline">Тэмдэглэл</h1>
          <Button variant="outline" size="icon" onClick={handleCreateNewNote}>
            <PlusCircle className="h-5 w-5" />
            <span className="sr-only">Шинэ тэмдэглэл үүсгэх</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : !user ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Тэмдэглэл харахын тулд нэвтэрнэ үү.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-8">
          {notes.length > 0 ? (
            notes.map((note) => (
              <Link href={`/tools/notes/${note.id}`} key={note.id}>
                <Card className="hover:border-primary/50 transition-colors h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="truncate">{note.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                     <p className="text-sm text-muted-foreground line-clamp-3">
                        {note.content?.replace(/^#+\s*/, '').substring(0, 100) || 'Агуулгагүй...'}
                     </p>
                  </CardContent>
                   <CardContent className="pt-2">
                        <p className="text-xs text-muted-foreground">
                            Last updated: {formatDate(note.updatedAt)}
                        </p>
                   </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">Одоогоор тэмдэглэл байхгүй байна. Шинээр үүсгэнэ үү.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
