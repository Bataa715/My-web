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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  PlusCircle,
  Edit,
  Trash2,
  X,
  Heart,
  Loader2,
  Wand2,
  BookOpen,
  Brain,
  Bot,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { EnglishWord, JapaneseWord } from '@/lib/types';
import { useFirebase } from '@/firebase';
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
} from 'firebase/firestore';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { initialEnglishWords } from '@/data/english';
import { initialJapaneseWords } from '@/data/japanese';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';
import { generateVocabulary } from '@/ai/flows/generate-vocabulary-flow';
import FlashcardGame from './FlashcardGame';
import TestGame from './TestGame';
import MatchingGame from './MatchingGame';

type Word = EnglishWord | JapaneseWord;

interface VocabularyManagerProps<T extends Word> {
  wordType: 'english' | 'japanese';
  columns: { key: keyof T; header: string }[];
  title: string;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const AiAssistantDialog = ({
  onAddWords,
}: {
  onAddWords: (
    words: Omit<EnglishWord, 'id' | 'memorized' | 'favorite'>[]
  ) => Promise<void>;
}) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: 'Текст хоосон байна',
        description: 'Үгс нэмэхийн тулд текст оруулна уу.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateVocabulary({ text });
      if (result.words && result.words.length > 0) {
        await onAddWords(result.words);
        toast({
          title: 'Амжилттай',
          description: `${result.words.length} үг нэмэгдлээ.`,
        });
        setIsOpen(false);
        setText('');
      } else {
        toast({
          title: 'Үг олдсонгүй',
          description: 'Текстээс ямар ч үг ялгаж чадсангүй.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Алдаа гарлаа',
        description: 'AI туслах ажиллахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wand2 className="mr-2 h-4 w-4" /> AI Туслах
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Туслахаар үгс нэмэх</DialogTitle>
          <DialogDescription>
            Англи, монгол үгс, тайлбар агуулсан текстээ хуулж тавина уу. AI
            автоматаар ялгаж, хүснэгтэд нэмэх болно.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Label htmlFor="ai-text-input">Текст</Label>
          <Textarea
            id="ai-text-input"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. apple - алим
banana: гадил
car: машин (A vehicle with four wheels)"
            rows={10}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" type="button">
              Цуцлах
            </Button>
          </DialogClose>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Нэмж байна...' : 'Үгс нэмэх'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function VocabularyManager<T extends Word>({
  wordType,
  columns,
  title,
}: VocabularyManagerProps<T>) {
  const { firestore, user } = useFirebase();
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

  const filteredWords = useMemo(() => {
    setCurrentPage(1); // Reset to first page whenever filters change
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

  const handleAddWordsBatch = async (
    newWords: Omit<EnglishWord, 'id' | 'memorized' | 'favorite'>[]
  ) => {
    if (!user || !firestore) {
      toast({
        title: 'Алдаа',
        description: 'Үгс нэмэхийн тулд нэвтэрнэ үү.',
        variant: 'destructive',
      });
      return;
    }

    const userWordsCollection = collection(
      firestore,
      `users/${user.uid}/${collectionPath}`
    );
    const batch = writeBatch(firestore);
    const wordsToAddLocally: T[] = [];

    newWords.forEach(word => {
      const docRef = doc(userWordsCollection);
      batch.set(docRef, {
        ...word,
        memorized: false,
        favorite: false,
      });
      wordsToAddLocally.push({
        id: docRef.id,
        ...word,
        memorized: false,
        favorite: false,
      } as T);
    });

    try {
      await batch.commit();
      setWords(prev =>
        [...prev, ...wordsToAddLocally].sort((a, b) =>
          (a.word as string).localeCompare(b.word as string)
        )
      );
    } catch (error) {
      console.error('Error batch adding words:', error);
      toast({
        title: 'Алдаа',
        description: 'Үгсийг бөөнөөр нэмэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    }
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

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="space-y-4 pt-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <p className="text-muted-foreground">
            Үгсийн санг харахын тулд нэвтэрнэ үү.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (gameMode === 'flashcard') {
    return (
      <FlashcardGame
        words={filteredWords}
        wordType={wordType}
        onComplete={handlePracticeComplete}
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
    <>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle>{title}</CardTitle>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <Input
                placeholder="Үг хайх..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 sm:w-48"
              />
              {wordType === 'english' && (
                <AiAssistantDialog onAddWords={handleAddWordsBatch} />
              )}
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
                    className="whitespace-nowrap"
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
                        <Label htmlFor={col.key as string}>{col.header}</Label>
                        <Input
                          id={col.key as string}
                          name={col.key as string}
                          defaultValue={
                            currentWord
                              ? (currentWord[col.key as keyof Word] as string)
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
                      <Button type="submit">Хадгалах</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <ToggleGroup
              type="single"
              defaultValue="all"
              variant="outline"
              size="sm"
              onValueChange={value => setFilter((value as any) || 'all')}
            >
              <ToggleGroupItem value="all">Бүгд</ToggleGroupItem>
              <ToggleGroupItem value="memorized">Цээжилсэн</ToggleGroupItem>
              <ToggleGroupItem value="not-memorized">
                Цээжлээгүй
              </ToggleGroupItem>
              <ToggleGroupItem value="favorite">Онцолсон</ToggleGroupItem>
            </ToggleGroup>
            <div className="flex items-center gap-2">
              <Dialog
                open={isAlphabetModalOpen}
                onOpenChange={setIsAlphabetModalOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Үсгээр шүүх
                    {alphabetFilter !== 'all' && (
                      <span className="ml-2 font-bold text-primary">
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
                            alphabetFilter === letter ? 'default' : 'outline'
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
                  className="h-9 w-9"
                  onClick={() => setAlphabetFilter('all')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(col => (
                    <TableHead key={col.key as string}>{col.header}</TableHead>
                  ))}
                  <TableHead>Цээжилсэн</TableHead>
                  <TableHead className="text-right">Үйлдэл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentWords.map(word => (
                  <TableRow
                    key={word.id}
                    className={cn(
                      word.memorized && 'bg-primary/10 hover:bg-primary/20'
                    )}
                  >
                    {columns.map(col => (
                      <TableCell key={`${word.id}-${col.key as string}`}>
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
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleBooleanValue(word.id!, 'favorite')}
                        disabled={!user}
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
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
                              Энэ үйлдлийг буцаах боломжгүй. Энэ үг таны сангаас
                              бүрмөсөн устгагдах болно.
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
              <div className="text-center p-8 text-muted-foreground">
                Шүүлтүүрт тохирох үг олдсонгүй.
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
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
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-center mb-4">
          Сонирхолтой аргууд
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex-row items-center gap-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <CardTitle>Flashcard (Anki)</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Картаар эргүүлж цээжилсэн үгээ бататгах.
              </CardDescription>
              <Button
                className="mt-4 w-full"
                onClick={() => setGameMode('flashcard')}
                disabled={filteredWords.length === 0}
              >
                {filter === 'all'
                  ? 'Бүх үгсээр'
                  : filter === 'memorized'
                    ? 'Цээжилсэн үгсээр'
                    : filter === 'not-memorized'
                      ? 'Цээжлээгүй үгсээр'
                      : filter === 'favorite'
                        ? 'Онцолсон үгсээр'
                        : ''}{' '}
                эхлэх
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex-row items-center gap-4">
              <Brain className="w-8 h-8 text-primary" />
              <CardTitle>Тест</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Орчуулга, утга зэргийг сонголтот тестээр шалгуулах.
              </CardDescription>
              <Button
                className="mt-4 w-full"
                onClick={() => setGameMode('test')}
                disabled={filteredWords.length < 4}
              >
                {filter === 'all'
                  ? 'Бүх үгсээр'
                  : filter === 'memorized'
                    ? 'Цээжилсэн үгсээр'
                    : filter === 'not-memorized'
                      ? 'Цээжлээгүй үгсээр'
                      : filter === 'favorite'
                        ? 'Онцолсон үгсээр'
                        : ''}{' '}
                тестлэх
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex-row items-center gap-4">
              <LinkIcon className="w-8 h-8 text-primary" />
              <CardTitle>Холбох Арга</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Англи болон Монгол үгсийг зөв хооронд нь холбох.
              </CardDescription>
              <Button
                className="mt-4 w-full"
                onClick={() => setGameMode('matching')}
                disabled={filteredWords.length < 5}
              >
                {filter === 'all'
                  ? 'Бүх үгсээр'
                  : filter === 'memorized'
                    ? 'Цээжилсэн үгсээр'
                    : filter === 'not-memorized'
                      ? 'Цээжлээгүй үгсээр'
                      : filter === 'favorite'
                        ? 'Онцолсон үгсээр'
                        : ''}{' '}
                тоглох
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
