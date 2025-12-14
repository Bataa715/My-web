"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { EnglishWord, JapaneseWord } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, setDoc, query } from "firebase/firestore";

type Word = EnglishWord | JapaneseWord;

interface VocabularyManagerProps<T extends Word> {
  collectionPath: string;
  initialWords: T[];
  wordType: 'english' | 'japanese';
  columns: { key: keyof T; header: string; }[];
}

export default function VocabularyManager<T extends Word>({
  collectionPath,
  initialWords,
  wordType,
  columns,
}: VocabularyManagerProps<T>) {
  const { firestore, user } = useFirebase();
  const [words, setWords] = useState<T[]>(initialWords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentWord, setCurrentWord] = useState<T | null>(null);
  const { toast } = useToast();

  const userWordsCollection = user ? collection(firestore, `users/${user.uid}/${collectionPath}`) : null;
  const publicWordsCollection = firestore ? collection(firestore, collectionPath) : null;

  useEffect(() => {
    const fetchWords = async () => {
        if (!firestore) return;
        
        // 1. Fetch public words
        const publicWordsQuery = query(publicWordsCollection!);
        const publicWordsSnapshot = await getDocs(publicWordsQuery);
        const publicWords = publicWordsSnapshot.docs.map(d => ({ ...d.data(), id: d.id, memorized: false } as T));

        if (!user || !userWordsCollection) {
            setWords(publicWords);
            return;
        }

        // 2. Fetch user-specific words and statuses
        const userWordsQuery = query(userWordsCollection);
        const userWordsSnapshot = await getDocs(userWordsQuery);
        
        const userWordMap = new Map<string, T>();
        userWordsSnapshot.docs.forEach(doc => {
            userWordMap.set(doc.id, { id: doc.id, ...doc.data() } as T);
        });

        // 3. Merge public words with user's memorized status
        const mergedWords = publicWords.map(publicWord => {
            const userWord = userWordMap.get(publicWord.id!);
            if (userWord) {
                userWordMap.delete(publicWord.id!); // Remove from map to leave only user-added words
                return { ...publicWord, memorized: userWord.memorized };
            }
            return publicWord; // User hasn't interacted with this public word
        });

        // 4. Add user-created words
        const userAddedWords = Array.from(userWordMap.values());
        
        setWords([...mergedWords, ...userAddedWords]);
    };

    fetchWords();
  }, [firestore, user, collectionPath]);



  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !userWordsCollection) {
         toast({ title: "Алдаа", description: "Үг хадгалахын тулд нэвтэрнэ үү.", variant: "destructive" });
        return
    };

    const formData = new FormData(e.currentTarget);
    const newWordData: { [key: string]: any } = { memorized: currentWord?.memorized || false };
    columns.forEach(col => {
      if (col.key !== 'id' && col.key !== 'memorized') {
        newWordData[col.key] = formData.get(col.key as string) as string;
      }
    });

    try {
      if (currentWord?.id) { // Edit existing word
        const isPublicWord = initialWords.some(w => w.id === currentWord.id);
        const docRef = doc(userWordsCollection, currentWord.id);
        
        if (isPublicWord) {
            // Only update the memorized status for public words in user's subcollection
            await setDoc(docRef, { memorized: currentWord.memorized }, { merge: true });
        } else {
            // Update the whole user-created word
            await updateDoc(docRef, newWordData);
            setWords(words.map(w => w.id === currentWord.id ? { ...w, ...newWordData } as T : w));
        }

        toast({ title: "Амжилттай заслаа", description: "Үгийн мэдээлэл шинэчлэгдлээ." });
      } else { // Add new word (always goes to user's collection)
        const docRef = await addDoc(userWordsCollection, newWordData);
        const newWord = { id: docRef.id, ...newWordData } as T;
        setWords([newWord, ...words]);
        toast({ title: "Амжилттай нэмлээ", description: "Шинэ үг таны санд нэмэгдлээ." });
      }
    } catch (error) {
       toast({ title: "Алдаа гарлаа", variant: "destructive" });
       console.error(error);
    }
    
    setIsDialogOpen(false);
    setCurrentWord(null);
  };

  const handleDelete = async (id: string) => {
    if (!user || !userWordsCollection) return;
     if (initialWords.some(iw => iw.id === id)) {
      toast({ title: "Анхааруулга", description: "Анхдагч үгийг устгах боломжгүй.", variant: "destructive" });
      return;
    }
    setWords(words.filter(w => w.id !== id));
    try {
        const docRef = doc(userWordsCollection, id);
        await deleteDoc(docRef);
        toast({ title: "Амжилттай устгалаа", variant: "destructive" });
    } catch(e) {
        setWords(words); // rollback
        toast({ title: "Алдаа гарлаа", variant: "destructive" });
    }
  };

  const toggleMemorized = async (id: string, checked: boolean) => {
    if (!user || !userWordsCollection) {
        toast({ title: "Алдаа", description: "Тэмдэглэхийн тулд нэвтэрнэ үү.", variant: "destructive" });
        return;
    };

    const originalWords = words;
    setWords(words.map(w => w.id === id ? { ...w, memorized: checked } : w));
    
    const docRef = doc(userWordsCollection, id);
    try {
      // Use setDoc with merge to create or update the memorized status
      await setDoc(docRef, { memorized: checked }, { merge: true });
    } catch (e) {
      console.error("Error updating memorized status:", e);
      setWords(originalWords); // Rollback on error
      toast({ title: "Алдаа гарлаа", variant: "destructive" });
    }
  };
  
  const openDialog = (word: T | null = null) => {
    setCurrentWord(word);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Үг цээжлэх</CardTitle>
          <CardDescription>Шинэ үг нэмэх, засах, устгах, цээжилснээ тэмдэглэх.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen) setCurrentWord(null);
            setIsDialogOpen(isOpen);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} disabled={!user}>
              <PlusCircle className="mr-2 h-4 w-4" /> Шинэ үг
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentWord ? 'Үг засах' : 'Шинэ үг нэмэх'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              {columns.map(col => {
                if (col.key !== 'id' && col.key !== 'memorized') {
                  const isPublicAndEditing = currentWord && initialWords.some(iw => iw.id === currentWord.id);
                  return (
                    <div key={col.key as string}>
                      <Label htmlFor={col.key as string}>{col.header}</Label>
                      <Input
                        id={col.key as string}
                        name={col.key as string}
                        defaultValue={currentWord ? currentWord[col.key] as string : ''}
                        required
                        disabled={isPublicAndEditing}
                      />
                       {isPublicAndEditing && <p className="text-xs text-muted-foreground pt-1">Анхдагч үгийн мэдээллийг засах боломжгүй.</p>}
                    </div>
                  );
                }
                return null;
              })}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Цуцлах</Button>
                </DialogClose>
                <Button type="submit">Хадгалах</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => <TableHead key={col.key as string}>{col.header}</TableHead>)}
                <TableHead>Цээжилсэн</TableHead>
                <TableHead className="text-right">Үйлдэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {words.map(word => (
                <TableRow key={word.id} className={word.memorized ? 'bg-green-100/50 dark:bg-green-900/20' : ''}>
                  {columns.map(col => <TableCell key={`${word.id}-${col.key as string}`}>{word[col.key] as string}</TableCell>)}
                  <TableCell>
                    <Checkbox
                      checked={word.memorized}
                      onCheckedChange={(checked) => toggleMemorized(word.id!, !!checked)}
                      disabled={!user}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(word)} disabled={!user}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            disabled={!user || initialWords.some(iw => iw.id === word.id)}
                          >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Та итгэлтэй байна уу?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Энэ үйлдлийг буцаах боломжгүй. Энэ үг таны сангаас бүрмөсөн устгагдах болно.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(word.id!)}>Устгах</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
