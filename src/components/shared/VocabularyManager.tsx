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
  Sparkles,
  GraduationCap,
  Volume2,
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
import { motion } from 'framer-motion';
import InteractiveParticles from './InteractiveParticles';
import BackButton from './BackButton';
import { autoGenerateVocabulary } from '@/ai/flows/auto-generate-vocabulary-flow';
import { autoGenerateJapaneseVocabulary } from '@/ai/flows/auto-generate-japanese-vocabulary-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Word = EnglishWord | JapaneseWord;

interface VocabularyManagerProps<T extends Word> {
  wordType: 'english' | 'japanese';
  columns: { key: keyof T; header: string }[];
  title: string;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const AiAssistantDialog = ({
  onAddWords,
  onAddJapaneseWords,
  wordType,
}: {
  onAddWords?: (
    words: Omit<EnglishWord, 'id' | 'memorized' | 'favorite'>[]
  ) => Promise<void>;
  onAddJapaneseWords?: (
    words: Omit<JapaneseWord, 'id' | 'memorized' | 'favorite'>[]
  ) => Promise<void>;
  wordType: 'english' | 'japanese';
}) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Auto generate states
  const [autoTopic, setAutoTopic] = useState('');
  const [autoCount, setAutoCount] = useState(10);
  const [autoLevel, setAutoLevel] = useState<
    'beginner' | 'intermediate' | 'advanced'
  >('intermediate');

  const isJapanese = wordType === 'japanese';

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
        if (onAddWords) {
          await onAddWords(result.words);
        }
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

  const handleAutoGenerate = async () => {
    if (!autoTopic.trim()) {
      toast({
        title: 'Сэдэв хоосон байна',
        description: 'Ямар сэдвээр үг үүсгэхээ оруулна уу.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      if (isJapanese && onAddJapaneseWords) {
        const result = await autoGenerateJapaneseVocabulary({
          topic: autoTopic,
          count: autoCount,
          level: autoLevel,
        });
        if (result.words && result.words.length > 0) {
          await onAddJapaneseWords(result.words);
          toast({
            title: 'Амжилттай',
            description: `${result.words.length} япон үг автоматаар үүсгэгдлээ.`,
          });
          setIsOpen(false);
          setAutoTopic('');
        } else {
          toast({
            title: 'Үг үүсгэж чадсангүй',
            description: 'AI үг үүсгэхэд алдаа гарлаа.',
            variant: 'destructive',
          });
        }
      } else if (onAddWords) {
        const result = await autoGenerateVocabulary({
          topic: autoTopic,
          count: autoCount,
          level: autoLevel,
        });
        if (result.words && result.words.length > 0) {
          await onAddWords(result.words);
          toast({
            title: 'Амжилттай',
            description: `${result.words.length} үг автоматаар үүсгэгдлээ.`,
          });
          setIsOpen(false);
          setAutoTopic('');
        } else {
          toast({
            title: 'Үг үүсгэж чадсангүй',
            description: 'AI үг үүсгэхэд алдаа гарлаа.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Алдаа гарлаа',
        description: 'AI автомат үг үүсгэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const topicSuggestionsEnglish = [
    'Business & Work',
    'Travel & Tourism',
    'Technology & IT',
    'Food & Cooking',
    'Health & Medicine',
    'Sports & Fitness',
    'Education & School',
    'Environment & Nature',
    'Entertainment & Movies',
    'Science & Research',
  ];

  const topicSuggestionsJapanese = [
    '日常生活 (Daily life)',
    '旅行 (Travel)',
    '食べ物 (Food)',
    'ビジネス (Business)',
    '学校 (School)',
    'スポーツ (Sports)',
    '家族 (Family)',
    '買い物 (Shopping)',
    '天気 (Weather)',
    '趣味 (Hobbies)',
  ];

  const topicSuggestions = isJapanese ? topicSuggestionsJapanese : topicSuggestionsEnglish;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wand2 className="mr-2 h-4 w-4" /> AI Туслах
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isJapanese ? 'AI Туслахаар япон үгс нэмэх' : 'AI Туслахаар үгс нэмэх'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="auto" className="w-full">
          <TabsList className={cn("grid w-full", isJapanese ? "grid-cols-1" : "grid-cols-2")}>
            {!isJapanese && (
              <TabsTrigger value="manual" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Текстээс
              </TabsTrigger>
            )}
            <TabsTrigger value="auto" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Автомат
            </TabsTrigger>
          </TabsList>

          {!isJapanese && (
            <TabsContent value="manual" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Англи, монгол үгс, тайлбар агуулсан текстээ хуулж тавина уу. AI
                автоматаар ялгаж, хүснэгтэд нэмэх болно.
              </p>
              <div className="space-y-2">
                <Label htmlFor="ai-text-input">Текст</Label>
                <Textarea
                  id="ai-text-input"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="e.g. apple - алим
banana: гадил
car: машин (A vehicle with four wheels)"
                  rows={8}
                />
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="secondary" type="button">
                    Цуцлах
                  </Button>
                </DialogClose>
                <Button onClick={handleGenerate} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Нэмж байна...' : 'Үгс нэмэх'}
                </Button>
              </div>
            </TabsContent>
          )}

          <TabsContent value="auto" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              {isJapanese
                ? 'Сэдэв болон хэдэн үг үүсгэхээ сонгоно уу. AI автоматаар япон үг үүсгэнэ.'
                : 'Сэдэв болон хэдэн үг үүсгэхээ сонгоно уу. AI автоматаар үг үүсгэнэ.'}
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auto-topic">Сэдэв / Агуулгын хүрээ</Label>
                <Input
                  id="auto-topic"
                  value={autoTopic}
                  onChange={e => setAutoTopic(e.target.value)}
                  placeholder="e.g. Business English, Medical terms, Daily conversation..."
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {topicSuggestions.map(topic => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setAutoTopic(topic)}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="auto-count">Үгийн тоо</Label>
                  <Select
                    value={autoCount.toString()}
                    onValueChange={v => setAutoCount(parseInt(v))}
                  >
                    <SelectTrigger id="auto-count">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 үг</SelectItem>
                      <SelectItem value="10">10 үг</SelectItem>
                      <SelectItem value="15">15 үг</SelectItem>
                      <SelectItem value="20">20 үг</SelectItem>
                      <SelectItem value="30">30 үг</SelectItem>
                      <SelectItem value="50">50 үг</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto-level">Түвшин</Label>
                  <Select
                    value={autoLevel}
                    onValueChange={v => setAutoLevel(v as typeof autoLevel)}
                  >
                    <SelectTrigger id="auto-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">🟢 Beginner</SelectItem>
                      <SelectItem value="intermediate">
                        🟡 Intermediate
                      </SelectItem>
                      <SelectItem value="advanced">🔴 Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button variant="secondary" type="button">
                  Цуцлах
                </Button>
              </DialogClose>
              <Button
                onClick={handleAutoGenerate}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isLoading ? 'Үүсгэж байна...' : 'Үг үүсгэх'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
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

  const handleAddJapaneseWordsBatch = async (
    newWords: Omit<JapaneseWord, 'id' | 'memorized' | 'favorite'>[]
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
      console.error('Error batch adding Japanese words:', error);
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

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Determine gradient colors based on wordType
  const gradientColors =
    wordType === 'english'
      ? { from: 'violet', to: 'purple', mid: 'fuchsia' }
      : { from: 'rose', to: 'pink', mid: 'fuchsia' };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10">
          <InteractiveParticles quantity={30} />
        </div>
        <div className="space-y-6 pt-8">
          <BackButton />
          <div className="flex justify-center">
            <Skeleton className="h-16 w-64 rounded-2xl" />
          </div>
          <div className="flex justify-between items-center gap-4">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10">
          <InteractiveParticles quantity={30} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8"
        >
          <BackButton />
          <Card className="text-center p-12 mt-8 bg-card/50 backdrop-blur-xl border-0 rounded-2xl max-w-md mx-auto">
            <CardContent className="flex flex-col items-center gap-4">
              <div
                className={`p-4 rounded-full bg-gradient-to-br from-${gradientColors.from}-500/20 to-${gradientColors.to}-500/20`}
              >
                <Sparkles
                  className={`h-10 w-10 text-${gradientColors.from}-400`}
                />
              </div>
              <p className="text-muted-foreground text-lg">
                Үгсийн санг харахын тулд нэвтэрнэ үү.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
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
    <div className="min-h-screen relative">
      {/* Background Particles */}
      <div className="fixed inset-0 -z-10">
        <InteractiveParticles quantity={30} />
      </div>

      <motion.div
        className="space-y-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BackButton />

        {/* Hero Section */}
        <div className="text-center pt-4 flex flex-col items-center justify-center gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-r ${wordType === 'english' ? 'from-violet-500/30 via-purple-500/30 to-fuchsia-500/30' : 'from-rose-500/30 via-pink-500/30 to-fuchsia-500/30'} blur-3xl rounded-full scale-150`}
            />
            <div
              className={`relative p-5 rounded-2xl bg-gradient-to-br ${wordType === 'english' ? 'from-violet-500/20 to-purple-500/20' : 'from-rose-500/20 to-pink-500/20'} backdrop-blur-sm border ${wordType === 'english' ? 'border-violet-500/20' : 'border-rose-500/20'}`}
            >
              <GraduationCap
                className={`h-12 w-12 ${wordType === 'english' ? 'text-violet-400' : 'text-rose-400'}`}
              />
            </div>
          </motion.div>

          <motion.h1
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-headline bg-gradient-to-r ${wordType === 'english' ? 'from-violet-400 via-purple-400 to-fuchsia-400' : 'from-rose-400 via-pink-400 to-fuchsia-400'} bg-clip-text text-transparent px-4`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="text-muted-foreground max-w-2xl text-sm md:text-base lg:text-lg px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Үгсийн санг цэгцлэх, шинэ үг нэмэх, цээжлэх
          </motion.p>
        </div>

        <motion.div variants={itemVariants}>
          <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden shadow-lg">
            <CardHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${wordType === 'english' ? 'from-violet-500/20 to-purple-500/20' : 'from-rose-500/20 to-pink-500/20'}`}
                    >
                      <BookOpen
                        className={`h-5 w-5 ${wordType === 'english' ? 'text-violet-400' : 'text-rose-400'}`}
                      />
                    </div>
                    Үгсийн сан
                  </CardTitle>
                </div>
                <div className="flex w-full sm:w-auto items-center gap-2">
                  <Input
                    placeholder="Үг хайх..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 sm:w-48 bg-background/50 border-0 rounded-xl"
                  />
                  <AiAssistantDialog
                    wordType={wordType}
                    onAddWords={wordType === 'english' ? handleAddWordsBatch : undefined}
                    onAddJapaneseWords={wordType === 'japanese' ? handleAddJapaneseWordsBatch : undefined}
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
                        className={`whitespace-nowrap bg-gradient-to-r ${wordType === 'english' ? 'from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600' : 'from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600'} text-white border-0`}
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
                            className={`bg-gradient-to-r ${wordType === 'english' ? 'from-violet-500 to-purple-500' : 'from-rose-500 to-pink-500'} text-white border-0`}
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
                    defaultValue="all"
                    variant="outline"
                    size="sm"
                    className="bg-background/30 rounded-xl p-1 flex-nowrap"
                    onValueChange={value => setFilter((value as any) || 'all')}
                  >
                    <ToggleGroupItem value="all" className="rounded-lg text-xs sm:text-sm whitespace-nowrap">
                      Бүгд
                    </ToggleGroupItem>
                    <ToggleGroupItem value="memorized" className="rounded-lg text-xs sm:text-sm whitespace-nowrap">
                      Цээжилсэн
                    </ToggleGroupItem>
                    <ToggleGroupItem value="not-memorized" className="rounded-lg text-xs sm:text-sm whitespace-nowrap">
                      Цээжлээгүй
                    </ToggleGroupItem>
                    <ToggleGroupItem value="favorite" className="rounded-lg text-xs sm:text-sm whitespace-nowrap">
                      Онцолсон
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
                        className="rounded-xl bg-background/30 border-0"
                      >
                        Үсгээр шүүх
                        {alphabetFilter !== 'all' && (
                          <span
                            className={`ml-2 font-bold ${wordType === 'english' ? 'text-violet-400' : 'text-rose-400'}`}
                          >
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
            </CardHeader>
            <CardContent className="px-2 sm:px-4 md:px-6">
              <div className="border-0 rounded-xl overflow-x-auto bg-background/30 -mx-2 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/30 hover:bg-transparent">
                      {columns.map((col, idx) => (
                        <TableHead
                          key={col.key as string}
                          className={cn(
                            "font-semibold text-xs sm:text-sm whitespace-nowrap",
                            idx > 1 && "hidden md:table-cell"
                          )}
                        >
                          {col.header}
                        </TableHead>
                      ))}
                      <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap">Цээжилсэн</TableHead>
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
                          'border-b border-border/20 transition-colors',
                          word.memorized &&
                            `${wordType === 'english' ? 'bg-violet-500/10 hover:bg-violet-500/20' : 'bg-rose-500/10 hover:bg-rose-500/20'}`
                        )}
                      >
                        {columns.map((col, idx) => (
                          <TableCell 
                            key={`${word.id}-${col.key as string}`}
                            className={cn(
                              "text-xs sm:text-sm",
                              idx > 1 && "hidden md:table-cell"
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
                            className={
                              wordType === 'english'
                                ? 'data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500'
                                : 'data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500'
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const text = wordType === 'english' 
                                ? (word as EnglishWord).word 
                                : (word as JapaneseWord).word;
                              speakWord(text, wordType === 'english' ? 'en-US' : 'ja-JP');
                            }}
                            className="rounded-lg hover:text-primary"
                            title="Сонсох"
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
                    className="rounded-lg bg-background/30 border-0"
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
                          'rounded-lg',
                          currentPage === number
                            ? `${wordType === 'english' ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-gradient-to-r from-rose-500 to-pink-500'} border-0`
                            : 'bg-background/30 border-0'
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
                    className="rounded-lg bg-background/30 border-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Game Methods Section */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2
            className={`text-3xl font-bold text-center mb-8 bg-gradient-to-r ${wordType === 'english' ? 'from-violet-400 via-purple-400 to-fuchsia-400' : 'from-rose-400 via-pink-400 to-fuchsia-400'} bg-clip-text text-transparent`}
          >
            Сонирхолтой аргууд
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={itemVariants}>
              <Card
                className={`bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden hover:shadow-lg ${wordType === 'english' ? 'hover:shadow-violet-500/20' : 'hover:shadow-rose-500/20'} transition-all duration-500 group`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${wordType === 'english' ? 'from-violet-500/10 to-purple-500/10' : 'from-rose-500/10 to-pink-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <CardHeader className="flex-row items-center gap-4 relative">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${wordType === 'english' ? 'from-violet-500/20 to-purple-500/20' : 'from-rose-500/20 to-pink-500/20'}`}
                  >
                    <BookOpen
                      className={`w-6 h-6 ${wordType === 'english' ? 'text-violet-400' : 'text-rose-400'}`}
                    />
                  </div>
                  <CardTitle>Flashcard (Anki)</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base">
                    Картаар эргүүлж цээжилсэн үгээ бататгах.
                  </CardDescription>
                  <Button
                    className={`mt-4 w-full bg-gradient-to-r ${wordType === 'english' ? 'from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600' : 'from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600'} text-white border-0 rounded-xl`}
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
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card
                className={`bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden hover:shadow-lg ${wordType === 'english' ? 'hover:shadow-violet-500/20' : 'hover:shadow-rose-500/20'} transition-all duration-500 group`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${wordType === 'english' ? 'from-violet-500/10 to-purple-500/10' : 'from-rose-500/10 to-pink-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <CardHeader className="flex-row items-center gap-4 relative">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${wordType === 'english' ? 'from-violet-500/20 to-purple-500/20' : 'from-rose-500/20 to-pink-500/20'}`}
                  >
                    <Brain
                      className={`w-6 h-6 ${wordType === 'english' ? 'text-violet-400' : 'text-rose-400'}`}
                    />
                  </div>
                  <CardTitle>Тест</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base">
                    Орчуулга, утга зэргийг сонголтот тестээр шалгуулах.
                  </CardDescription>
                  <Button
                    className={`mt-4 w-full bg-gradient-to-r ${wordType === 'english' ? 'from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600' : 'from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600'} text-white border-0 rounded-xl`}
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
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card
                className={`bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden hover:shadow-lg ${wordType === 'english' ? 'hover:shadow-violet-500/20' : 'hover:shadow-rose-500/20'} transition-all duration-500 group`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${wordType === 'english' ? 'from-violet-500/10 to-purple-500/10' : 'from-rose-500/10 to-pink-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <CardHeader className="flex-row items-center gap-4 relative">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${wordType === 'english' ? 'from-violet-500/20 to-purple-500/20' : 'from-rose-500/20 to-pink-500/20'}`}
                  >
                    <LinkIcon
                      className={`w-6 h-6 ${wordType === 'english' ? 'text-violet-400' : 'text-rose-400'}`}
                    />
                  </div>
                  <CardTitle>Холбох Арга</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base">
                    {wordType === 'english'
                      ? 'Англи болон Монгол үгсийг зөв хооронд нь холбох.'
                      : 'Япон болон Монгол үгсийг зөв хооронд нь холбох.'}
                  </CardDescription>
                  <Button
                    className={`mt-4 w-full bg-gradient-to-r ${wordType === 'english' ? 'from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600' : 'from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600'} text-white border-0 rounded-xl`}
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
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
