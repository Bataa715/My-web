
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { Note } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Trash2, Edit, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/shared/BackButton';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEditMode } from '@/contexts/EditModeContext';

export default function NotePage({ params }: { params: Promise<{ noteId: string }> }) {
  const { firestore, user } = useFirebase();
  const { isEditMode } = useEditMode();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const { toast } = useToast();
  const router = useRouter();
  const { noteId } = React.use(params);

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchNote = useCallback(async () => {
    if (!firestore || !user || !noteId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const noteDocRef = doc(firestore, `users/${user.uid}/notes`, noteId);
      const docSnap = await getDoc(noteDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Note;
        setNote({ id: docSnap.id, ...data });
        setTitle(data.title);
        setContent(data.content || '');
      } else {
        toast({ title: "Олдсонгүй", description: "Тэмдэглэл олдсонгүй.", variant: "destructive" });
        router.push('/tools/notes');
      }
    } catch (err) {
      console.error("Error fetching note:", err);
      toast({ title: "Алдаа", description: "Тэмдэглэл татахад алдаа гарлаа.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [firestore, user, noteId, router, toast]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const saveNote = useCallback(async () => {
    if (!firestore || !user || !note) return;
    setIsSaving(true);
    
    try {
      const noteDocRef = doc(firestore, `users/${user.uid}/notes`, note.id!);
      await updateDoc(noteDocRef, {
        title,
        content,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Хадгаллаа", description: "Өөрчлөлт амжилттай хадгалагдлаа." });
    } catch (error) {
      console.error("Error saving note: ", error);
      toast({ title: "Алдаа", description: "Хадгалахад алдаа гарлаа.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [firestore, user, note, title, content, toast]);
  
  const handleDeleteNote = async () => {
     if (!firestore || !user || !note) return;
     try {
         await deleteDoc(doc(firestore, `users/${user.uid}/notes`, note.id!));
         toast({title: "Амжилттай", description: "Тэмдэглэл устгагдлаа."});
         router.push('/tools/notes');
     } catch(e) {
         toast({title: "Алдаа", description: "Тэмдэглэл устгахад алдаа гарлаа.", variant: "destructive"});
     }
  }

  // Auto-save logic
  useEffect(() => {
    if (loading || !isEditMode) return;
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
        if(note?.title !== title || note?.content !== content) {
            saveNote();
        }
    }, 2000); // Save after 2 seconds of inactivity

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [title, content, saveNote, loading, note, isEditMode]);


  if (loading) {
    return (
      <div className="space-y-4 pt-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <BackButton />
         <div className="flex items-center gap-2">
            {isSaving && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" disabled={!isEditMode}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                    <AlertDialogDescription>"{title}" тэмдэглэлийг устгах гэж байна. Энэ үйлдэл буцаагдахгүй.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteNote}>Устгах</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
         </div>
      </div>
      
      {isEditMode ? (
        <>
            <div className="flex items-center gap-2">
                 <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-4xl font-bold border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                    placeholder="Гарчиг..."
                  />
            </div>
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[60vh] text-base border-0 shadow-none focus-visible:ring-0 p-0"
                placeholder="Энд бичиж эхэлнэ үү. Markdown ашиглах боломжтой..."
            />
        </>
      ) : (
        <>
            <h1 className="text-4xl font-bold">{title}</h1>
            <div className="prose dark:prose-invert max-w-none">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
        </>
      )}
    </div>
  );
}
