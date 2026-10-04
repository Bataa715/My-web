'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  DialogDescription,
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
import {
  PlusCircle,
  Edit,
  Trash2,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { EnglishWord, JapaneseWord } from '@/lib/types';
import { useSupabase } from '@/supabase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  setDoc,
  query,
  serverTimestamp,
  writeBatch,
} from '@/supabase/db';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { initialEnglishWords } from '@/features/language/data/english';
import { initialJapaneseWords } from '@/features/language/data/japanese';
import { Skeleton } from '@/components/ui/skeleton';
import FlashcardGame from '@/features/language/components/FlashcardGame';
import TestGame from '@/features/language/components/TestGame';
import MatchingGame from '@/features/language/components/MatchingGame';
import { motion } from 'framer-motion';
import { packsFor, type WordPack } from '@/features/language/data/packs';
import {
  PackList,
  PracticeModes,
  VocabOverview,
  type GameMode,
} from '@/features/language/components/VocabularyExtras';

type Word = EnglishWord | JapaneseWord;

interface VocabularyManagerProps<T extends Word> {
  wordType: 'english' | 'japanese';
  columns: { key: keyof T; header: string }[];
  title: string;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function VocabularyManager<T extends Word>({
  wordType,
  columns,
  title,
}: VocabularyManagerProps<T>) {
  const { firestore, user } = useSupabase();
  const [words, setWords] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlphabetModalOpen, setIsAlphabetModalOpen] = useState(false);
  const [currentWord, setCurrentWord] = useState<T | null>(null);
  const [filter, setFilter] = useState<
    'all' | 'memorized' | 'not-memorized' | 'favorite'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [alphabetFilter, setAlphabetFilter] = useState<string | 'all'>('all');
  const [gameMode, setGameMode] = useState<
    'flashcard' | 'test' | 'matching' | null
  >(null);
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const wordsPerPage = 15;

  // Text-to-speech function
  const speakWord = useCallback((text: string, lang: 'en-US' | 'ja-JP') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const collectionPath =
    wordType === 'english' ? 'englishWords' : 'japaneseWords';
  const initialData =
    wordType === 'english' ? initialEnglishWords : initialJapaneseWords;

  const fetchWords = useCallback(async () => {
    if (!user || !firestore) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const wordsCollection = collection(
        firestore,
        `users/${user.uid}/${collectionPath}`
      );
      const wordsSnapshot = await getDocs(wordsCollection);

      if (wordsSnapshot.empty) {
        console.log(
          `No ${collectionPath} found for user, seeding initial data...`
        );
        const batch = writeBatch(firestore);
        initialData.forEach(word => {
          const docRef = doc(wordsCollection);
          batch.set(docRef, { ...word, favorite: false, memorized: false });
        });
        await batch.commit();

        const newSnapshot = await getDocs(wordsCollection);
        const wordsList = newSnapshot.docs.map(
          d => ({ ...d.data(), id: d.id }) as T
        );
        setWords(wordsList);
      } else {
        const wordsList = wordsSnapshot.docs.map(
          doc => ({ id: doc.id, ...doc.data() }) as T
        );
        setWords(wordsList);
      }
    } catch (error) {
      console.error(`Error fetching ${collectionPath}:`, error);
      toast({
        title: 'Алдаа',
        description: 'Үгсийн санг татахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, firestore, collectionPath, initialData, toast]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  // Reset to page 1 only when filter criteria change, not when words data updates
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, alphabetFilter, searchQuery]);

  const filteredWords = useMemo(() => {
    return words
      .filter(word => {
        if (filter === 'memorized') return word.memorized;
        if (filter === 'not-memorized') return !word.memorized;
        if (filter === 'favorite') return word.favorite;
        return true;
      })
      .filter(word => {
        const wordKey = wordType === 'english' ? 'word' : 'romaji';
        const searchableWord = (word[wordKey as keyof Word] as string) || '';
        if (alphabetFilter !== 'all') {
          return searchableWord
            .toLowerCase()
            .startsWith(alphabetFilter.toLowerCase());
        }
        return true;
      })
      .filter(word => {
        const primaryKey = wordType === 'english' ? 'word' : 'romaji';
        const secondaryKey = wordType === 'english' ? 'translation' : 'meaning';

        const primaryValue = (word[primaryKey as keyof Word] as string) || '';
        const secondaryValue =
          (word[secondaryKey as keyof Word] as string) || '';

        if (searchQuery.trim() === '') return true;

        return (
          primaryValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
          secondaryValue.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
  }, [words, filter, alphabetFilter, searchQuery, wordType]);

  const indexOfLastWord = currentPage * wordsPerPage;
  const indexOfFirstWord = indexOfLastWord - wordsPerPage;
  const currentWords = filteredWords.slice(indexOfFirstWord, indexOfLastWord);
  const totalPages = Math.ceil(filteredWords.length / wordsPerPage);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !firestore) {
      toast({
        title: 'Алдаа',
        description: 'Үг хадгалахын тулд нэвтэрнэ үү.',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const newWordData: { [key: string]: any } = {
      memorized: currentWord?.memorized || false,
      favorite: currentWord?.favorite || false,
    };
    columns.forEach(col => {
      newWordData[col.key as string] = formData.get(
        col.key as string
      ) as string;
    });

    const userWordsCollection = collection(
      firestore,
      `users/${user.uid}/${collectionPath}`
    );
    try {
      if (currentWord?.id) {
        const docRef = doc(userWordsCollection, currentWord.id);
        await updateDoc(docRef, newWordData);
        setWords(
          words.map(w =>
            w.id === currentWord.id ? ({ ...w, ...newWordData } as T) : w
          )
        );
        toast({
          title: 'Амжилттай заслаа',
          description: 'Үгийн мэдээлэл шинэчлэгдлээ.',
        });
      } else {
        const docRef = await addDoc(userWordsCollection, newWordData);
        const newWord = { id: docRef.id, ...newWordData } as T;
        setWords(prev =>
          [...prev, newWord].sort((a, b) =>
            (a.word as string).localeCompare(b.word as string)
          )
        );
        toast({
          title: 'Амжилттай нэмлээ',
          description: 'Шинэ үг таны санд нэмэгдлээ.',
        });
      }
    } catch (error) {
      toast({ title: 'Алдаа гарлаа', variant: 'destructive' });
      console.error(error);
    }

    setIsDialogOpen(false);
    setCurrentWord(null);
  };

  const handleDelete = async (wordId: string) => {
    if (!user || !firestore) {
      toast({
        title: 'Алдаа',
        description: 'Устгахын тулд нэвтэрнэ үү.',
        variant: 'destructive',
      });
      return;
    }
    const wordToDelete = words.find(w => w.id === wordId);
    if (!wordToDelete) return;

    const originalWords = [...words];
    setWords(words.filter(w => w.id !== wordId));
    try {
      const docRef = doc(
        firestore,
        `users/${user.uid}/${collectionPath}`,
        wordId
      );
      await deleteDoc(docRef);
      toast({ title: 'Амжилттай устгагдлаа' });
    } catch (error) {
      setWords(originalWords);
      toast({
        title: 'Алдаа гарлаа',
        description: 'Үг устгахад алдаа гарлаа.',
        variant: 'destructive',
      });
      console.error('Error deleting word:', error);
    }
  };

  const toggleBooleanValue = async (
    id: string,
    key: 'memorized' | 'favorite'
  ) => {
    if (!user || !firestore) {
      toast({
        title: 'Алдаа',
        description: 'Тэмдэглэхийн тулд нэвтэрнэ үү.',
        variant: 'destructive',
      });
      return;
    }

    const originalWords = [...words];
    let updatedValue = false;

    const newWords = words.map(w => {
      if (w.id === id) {
        updatedValue = !w[key];
        return { ...w, [key]: updatedValue };
      }
      return w;
    });
    setWords(newWords as T[]);

    const docRef = doc(firestore, `users/${user.uid}/${collectionPath}`, id);
    try {
      await setDoc(docRef, { [key]: updatedValue }, { merge: true });
    } catch (e) {
      console.error(`Error updating ${key} status:`, e);
      setWords(originalWords);
      toast({ title: 'Алдаа гарлаа', variant: 'destructive' });
    }
  };

  const openDialog = (word: T | null = null) => {
    setCurrentWord(word);
    setIsDialogOpen(true);
  };

  const handleAlphabetSelect = (letter: string) => {
    setAlphabetFilter(letter);
    setIsAlphabetModalOpen(false);
  };

  const handlePracticeComplete = (memorizedIds: string[]) => {
    setGameMode(null);
    if (memorizedIds.length > 0 && user && firestore) {
      const batch = writeBatch(firestore);
      memorizedIds.forEach(id => {
        const docRef = doc(
          firestore,
          `users/${user.uid}/${collectionPath}`,
          id
        );
        batch.update(docRef, { memorized: true });
      });

      batch
        .commit()
        .then(() => {
          setWords(prevWords =>
            prevWords.map(w =>
              memorizedIds.includes(w.id!)
                ? ({ ...w, memorized: true } as T)
                : w
            )
          );
          toast({
            title: 'Амжилттай',
            description: `${memorizedIds.length} үг цээжилсэн төлөвт орлоо.`,
          });
        })
        .catch(e => {
          console.error('Error batch updating memorized status:', e);
          toast({ title: 'Алдаа гарлаа', variant: 'destructive' });
        });
    }
  };

  // Save progress without exiting the game
  const handleSaveProgress = (memorizedIds: string[]) => {
    if (memorizedIds.length > 0 && user && firestore) {
      const batch = writeBatch(firestore);
      memorizedIds.forEach(id => {
        const docRef = doc(
          firestore,
          `users/${user.uid}/${collectionPath}`,
          id
        );
        batch.update(docRef, { memorized: true });
      });

      batch
        .commit()
        .then(() => {
          setWords(prevWords =>
            prevWords.map(w =>
              memorizedIds.includes(w.id!)
                ? ({ ...w, memorized: true } as T)
                : w
            )
          );
          toast({
            title: 'Хадгалагдлаа',
            description: `${memorizedIds.length} үг цээжилсэн төлөвт орлоо.`,
          });
        })
        .catch(e => {
          console.error('Error batch updating memorized status:', e);
          toast({ title: 'Алдаа гарлаа', variant: 'destructive' });
        });
    }
  };

  const counts = useMemo(
    () => ({
      all: words.length,
      memorized: words.filter(w => w.memorized).length,
      notMemorized: words.filter(w => !w.memorized).length,
      favorite: words.filter(w => w.favorite).length,
    }),
    [words]
  );

  const scopeLabel =
    [
      filter === 'memorized' && 'Цээжилсэн үгс',
      filter === 'not-memorized' && 'Цээжлээгүй үгс',
      filter === 'favorite' && 'Онцолсон үгс',
      alphabetFilter !== 'all' && `"${alphabetFilter}" үсгээр эхэлсэн`,
      searchQuery.trim() && 'Хайлтын үр дүн',
    ]
      .filter(Boolean)
      .join(' · ') || 'Бүх үг';

  const wordKey = (w: { word?: string }) => (w.word ?? '').trim().toLowerCase();
  const existingKeys = useMemo(() => new Set(words.map(w => wordKey(w))), [words]);
  const packs = useMemo(() => packsFor(wordType), [wordType]);

  const addPack = async (
    pack: WordPack<EnglishWord | JapaneseWord>,
    fresh: WordPack<EnglishWord | JapaneseWord>['words']
  ) => {
    if (!user || !firestore) {
      toast({ title: 'Алдаа', description: 'Үг хадгалахын тулд нэвтэрнэ үү.', variant: 'destructive' });
      return;
    }
    try {
      const col = collection(firestore, `users/${user.uid}/${collectionPath}`);
      const added: T[] = [];
      for (let i = 0; i < fresh.length; i += 200) {
        const batch = writeBatch(firestore);
        for (const w of fresh.slice(i, i + 200)) {
          const ref = doc(col);
          const data = { ...w, favorite: false, memorized: false };
          batch.set(ref, data);
          added.push({ ...data, id: ref.id } as unknown as T);
        }
        await batch.commit();
      }
      setWords(prev => [...prev, ...added]);
      toast({ title: 'Амжилттай', description: `"${pack.title}" — ${added.length} шинэ үг нэмэгдлээ.` });
    } catch (error) {
      console.error('Error adding word pack:', error);
      toast({ title: 'Алдаа гарлаа', description: 'Сан нэмэхэд алдаа гарлаа.', variant: 'destructive' });
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <p className="py-16 text-center text-sm text-[#111]/45">
        Үгсийн санг харахын тулд нэвтэрнэ үү.
      </p>
    );
  }

  if (gameMode === 'flashcard') {
    return (
      <FlashcardGame
        words={filteredWords}
        wordType={wordType}
        onComplete={handlePracticeComplete}
        onSaveProgress={handleSaveProgress}
        onExit={() => setGameMode(null)}
      />
    );
  }

  if (gameMode === 'test') {
    return (
      <TestGame
        words={filteredWords}
        wordType={wordType}
        onExit={() => setGameMode(null)}
      />
    );
  }

  if (gameMode === 'matching') {
    return (
      <MatchingGame
        words={filteredWords}
        wordType={wordType}
        onExit={() => setGameMode(null)}
      />
    );
  }

  return (
    <div className="space-y-12 text-[#111]">
      <div className="space-y-8">
        <VocabOverview
          total={counts.all}
          memorized={counts.memorized}
          favorites={counts.favorite}
        />
        {words.length === 0 && (
          <p className="border-l-2 border-[#c41212] pl-4 text-sm text-[#111]/70">
            Үгсийн сан хоосон байна. Доорх "Бэлэн сангууд"-аас сэдэв сонгож нэм, эсвэл "Шинэ үг" товчоор өөрийн үгээ нэм.
          </p>
        )}
        <PracticeModes
          available={filteredWords.length}
          scopeLabel={scopeLabel}
          onStart={(mode: GameMode) => setGameMode(mode)}
        />
        <PackList
          packs={packs}
          hasWord={w => existingKeys.has(wordKey(w as { word?: string }))}
          onAdd={addPack}
          defaultOpen={words.length === 0}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
                  {title} <span className="tabular-nums text-[#111]/40">({filteredWords.length})</span>
                </h2>
                <div className="flex w-full sm:w-auto items-center gap-2">
                  <Input
                    placeholder="Үг хайх..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 rounded-none border-[#111]/25 bg-transparent sm:w-48"
                  />
                  <Dialog
                    open={isDialogOpen}
                    onOpenChange={isOpen => {
                      if (!isOpen) setCurrentWord(null);
                      setIsDialogOpen(isOpen);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => openDialog()}
                        disabled={!user}
                        size="sm"
                        className="rounded-none border-0 bg-[#c41212] text-white hover:bg-[#c41212]/90"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Шинэ үг
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {currentWord ? 'Үг засах' : 'Шинэ үг нэмэх'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSave} className="space-y-4">
                        {columns.map(col => (
                          <div key={col.key as string}>
                            <Label htmlFor={col.key as string}>
                              {col.header}
                            </Label>
                            <Input
                              id={col.key as string}
                              name={col.key as string}
                              defaultValue={
                                currentWord
                                  ? (currentWord[
                                      col.key as keyof Word
                                    ] as string)
                                  : ''
                              }
                              required
                            />
                          </div>
                        ))}
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Цуцлах
                            </Button>
                          </DialogClose>
                          <Button
                            type="submit"
                            className="rounded-none border-0 bg-[#c41212] text-white hover:bg-[#c41212]/90"
                          >
                            Хадгалах
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                <div className="overflow-x-auto -mx-2 px-2">
                  <ToggleGroup
                    type="single"
                    value={filter}
                    variant="outline"
                    size="sm"
                    className="flex-nowrap gap-1 rounded-none bg-transparent p-0"
                    onValueChange={value => setFilter((value as any) || 'all')}
                  >
                    <ToggleGroupItem
                      value="all"
                      className="rounded-none border-[#111]/25 text-[11px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap data-[state=on]:bg-[#c41212] data-[state=on]:text-white"
                    >
                      Бүгд {counts.all}
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="memorized"
                      className="rounded-none border-[#111]/25 text-[11px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap data-[state=on]:bg-[#c41212] data-[state=on]:text-white"
                    >
                      Цээжилсэн {counts.memorized}
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="not-memorized"
                      className="rounded-none border-[#111]/25 text-[11px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap data-[state=on]:bg-[#c41212] data-[state=on]:text-white"
                    >
                      Цээжлээгүй {counts.notMemorized}
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="favorite"
                      className="rounded-none border-[#111]/25 text-[11px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap data-[state=on]:bg-[#c41212] data-[state=on]:text-white"
                    >
                      Онцолсон {counts.favorite}
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog
                    open={isAlphabetModalOpen}
                    onOpenChange={setIsAlphabetModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-[#111]/30 bg-transparent"
                      >
                        Үсгээр шүүх
                        {alphabetFilter !== 'all' && (
                          <span className="ml-2 font-bold text-[#c41212]">
                            {alphabetFilter}
                          </span>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Үсгээр шүүх</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-72">
                        <div className="grid grid-cols-6 gap-2 pr-4">
                          <Button
                            variant={
                              alphabetFilter === 'all' ? 'default' : 'outline'
                            }
                            onClick={() => handleAlphabetSelect('all')}
                          >
                            All
                          </Button>
                          {ALPHABET.map(letter => (
                            <Button
                              key={letter}
                              variant={
                                alphabetFilter === letter
                                  ? 'default'
                                  : 'outline'
                              }
                              onClick={() => handleAlphabetSelect(letter)}
                            >
                              {letter}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  {alphabetFilter !== 'all' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl"
                      onClick={() => setAlphabetFilter('all')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-8 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#111] hover:bg-transparent">
                      {columns.map((col, idx) => (
                        <TableHead
                          key={col.key as string}
                          className={cn(
                            'font-semibold text-xs sm:text-sm whitespace-nowrap',
                            idx > 1 && 'hidden md:table-cell'
                          )}
                        >
                          {col.header}
                        </TableHead>
                      ))}
                      <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                        Цээжилсэн
                      </TableHead>
                      <TableHead className="text-right font-semibold text-xs sm:text-sm whitespace-nowrap">
                        Үйлдэл
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentWords.map(word => (
                      <TableRow
                        key={word.id}
                        className={cn(
                          'border-b border-[#111]/15',
                          word.memorized && 'bg-[#c41212]/5'
                        )}
                      >
                        {columns.map((col, idx) => (
                          <TableCell
                            key={`${word.id}-${col.key as string}`}
                            className={cn(
                              'text-xs sm:text-sm',
                              idx > 1 && 'hidden md:table-cell'
                            )}
                          >
                            {word[col.key as keyof Word] as string}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Checkbox
                            checked={word.memorized}
                            onCheckedChange={() =>
                              toggleBooleanValue(word.id!, 'memorized')
                            }
                            disabled={!user}
                            className="data-[state=checked]:border-[#c41212] data-[state=checked]:bg-[#c41212]"
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const text =
                                wordType === 'english'
                                  ? (word as EnglishWord).word
                                  : (word as JapaneseWord).word;
                              speakWord(
                                text,
                                wordType === 'english' ? 'en-US' : 'ja-JP'
                              );
                            }}
                            className="rounded-lg hover:text-primary"
                            title="Сонсох"
                            aria-label="Сонсох"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              toggleBooleanValue(word.id!, 'favorite')
                            }
                            disabled={!user}
                            className="rounded-lg"
                          >
                            <Heart
                              className={cn(
                                'h-4 w-4',
                                word.favorite
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-muted-foreground'
                              )}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDialog(word)}
                            disabled={!user}
                            className="rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive rounded-lg"
                                disabled={!user}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Та итгэлтэй байна уу?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Энэ үйлдлийг буцаах боломжгүй. Энэ үг таны
                                  сангаас бүрмөсөн устгагдах болно.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(word.id!)}
                                >
                                  Устгах
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredWords.length === 0 && (
                  <p className="py-12 text-center text-sm text-[#111]/45">
                    Шүүлтүүрт тохирох үг олдсонгүй.
                  </p>
                )}
              </div>
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-none border-[#111]/25 bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    number => (
                      <Button
                        key={number}
                        variant={currentPage === number ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => paginate(number)}
                        className={cn(
                          'rounded-none',
                          currentPage === number
                            ? 'border-[#c41212] bg-[#c41212] text-white'
                            : 'border-[#111]/25 bg-transparent'
                        )}
                      >
                        {number}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-none border-[#111]/25 bg-transparent"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
      </motion.div>

    </div>
  );
}
