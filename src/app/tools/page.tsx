'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Timer, Code, BookOpen } from "lucide-react";
import BackButton from "@/components/shared/BackButton";

import { useEffect, useState } from 'react';
import VocabularyManager from '@/components/shared/VocabularyManager';
import GrammarList from '@/components/shared/GrammarList';
import KanaGrid from './japanese/components/KanaGrid';
import type { JapaneseWord, Kana, GrammarRule, EnglishWord, ProgrammingConcept, CheatSheetItem, ProgressItem } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { collection, getDocs, query, orderBy, writeBatch, doc } from 'firebase/firestore';
import ConceptCards from './programming/components/ConceptCards';
import CheatSheet from './programming/components/CheatSheet';
import ProgressTracker from './programming/components/ProgressTracker';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

// Data for navigation cards
const tools = [
  {
    title: "Англи хэл",
    description: "Үгсийн сан, дүрмийн дасгал, сорил.",
    href: "#english",
    icon: <BookOpen className="h-6 w-6" />
  },
  {
    title: "Япон хэл",
    description: "Хирагана, катакана, үгсийн сан, дүрэм.",
    href: "#japanese",
    icon: <BookOpen className="h-6 w-6" />
  },
  {
    title: "Программчлал",
    description: "Үндсэн ойлголтууд, cheat sheets, ахиц хянагч.",
    href: "#programming",
    icon: <Code className="h-6 w-6" />
  },
  {
    title: "Pomodoro Timer",
    description: "Хичээллэх, завсарлах хугацааг удирдах.",
    href: "#pomodoro",
    icon: <Timer className="h-6 w-6" />
  },
];

// Initial data for seeding Firestore
const englishColumns = [
    { key: 'word' as keyof EnglishWord, header: 'English Word' },
    { key: 'meaning' as keyof EnglishWord, header: 'Mongolian Meaning' },
];
const initialEnglishWordsData: Omit<EnglishWord, 'id' | 'memorized'>[] = [
    { word: 'apple', meaning: 'алим' }, { word: 'book', meaning: 'ном' }, { word: 'cat', meaning: 'муур' },
];
const initialEnglishGrammarData: Omit<GrammarRule, 'id'>[] = [
    { title: 'Present Simple', explanation: 'Одоо, энгийн цаг.', examples: ['I go to school.'] },
];

const japaneseColumns = [
    { key: 'word' as keyof JapaneseWord, header: 'Japanese Word' }, { key: 'romaji' as keyof JapaneseWord, header: 'Romaji' }, { key: 'meaning' as keyof JapaneseWord, header: 'Mongolian Meaning' },
];
const initialHiraganaData: Omit<Kana, 'id'>[] = [
    { character: 'あ', romaji: 'a' }, { character: 'い', romaji: 'i' }, { character: 'う', romaji: 'u' }, { character: 'え', romaji: 'e' }, { character: 'お', romaji: 'o' },
];
const initialKatakanaData: Omit<Kana, 'id'>[] = [
    { character: 'ア', romaji: 'a' }, { character: 'イ', romaji: 'i' }, { character: 'ウ', romaji: 'u' }, { character: 'エ', romaji: 'e' }, { character: 'オ', romaji: 'o' },
];
const initialJapaneseWordsData: Omit<JapaneseWord, 'id' | 'memorized'>[] = [
    { word: 'こんにちは', romaji: 'konnichiwa', meaning: 'сайн уу' }, { word: 'ありがとう', romaji: 'arigatou', meaning: 'баярлалаа' },
];
const initialJapaneseGrammarData: Omit<GrammarRule, 'id'>[] = [
    { title: 'です (desu)', explanation: 'Tohirhoi, medegdel, tailbarlahad hereglene.', examples: ['これは本です。 (Kore wa hon desu.) - Энэ бол ном.'] },
];

const initialProgrammingConceptsData: Omit<ProgrammingConcept, 'id'>[] = [
    { title: 'Variable', emoji: '📦', explanation: 'Utga hadgalah sav.' },
];
const initialCheatSheetItemsData: Omit<CheatSheetItem, 'id'>[] = [
    { title: 'Create React Component', snippet: 'function MyComponent() {\n  return <div>Hello</div>;\n}' },
];
const initialProgressItemsData: Omit<ProgressItem, 'id' | 'learned' | 'practicing'>[] = [
    { label: 'HTML' }, { label: 'CSS' }, { label: 'JavaScript' },
];


const PomodoroTimer = () => {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [minutes, setMinutes] = useState(workMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            if (audioRef.current) {
                audioRef.current.play();
            }
            if (isBreak) {
              setIsBreak(false);
              setMinutes(workMinutes);
            } else {
              setIsBreak(true);
              setMinutes(breakMinutes);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval!);
    }
    return () => clearInterval(interval!);
  }, [isActive, seconds, minutes, isBreak, workMinutes, breakMinutes]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(workMinutes);
    setSeconds(0);
  };
  const handleSettingsSave = () => {
    resetTimer();
    setIsSettingsOpen(false);
  };

  const totalSeconds = (isBreak ? breakMinutes : workMinutes) * 60;
  const elapsedSeconds = minutes * 60 + seconds;
  const progress = (1 - elapsedSeconds / totalSeconds) * 100;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-220px)] p-4 space-y-8">
      <audio ref={audioRef} src="/sounds/timer-end.mp3" preload="auto" />
      <Card
        className={cn(
          "w-full max-w-md text-center transition-colors duration-500",
          isBreak ? "bg-accent/10 dark:bg-accent/10 border-accent/20" : "bg-primary/10 dark:bg-primary/10 border-primary/20"
        )}
      >
        <CardContent className="space-y-8 pt-6">
          <div className="relative flex items-center justify-center">
             <svg className="transform -rotate-90 w-72 h-72">
                  <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted-foreground/20" />
                  <circle
                      cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="8" fill="transparent"
                      strokeDasharray={2 * Math.PI * 130}
                      strokeDashoffset={(2 * Math.PI * 130) * (1 - progress / 100)}
                      className={cn("transition-all duration-500", isBreak ? "text-accent" : "text-primary")}
                  />
              </svg>
            <div className="absolute text-7xl font-bold font-mono text-foreground">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={toggleTimer} size="icon" variant="default" className="w-16 h-16 rounded-full">
              {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="icon" className="w-16 h-16 rounded-full">
              <RotateCcw className="w-8 h-8" />
            </Button>
             <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="w-16 h-16 rounded-full"><Settings className="w-8 h-8" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Цагийн тохиргоо</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="work-minutes" className="text-right">Хичээллэх</Label>
                          <Input id="work-minutes" type="number" value={workMinutes} onChange={(e) => setWorkMinutes(Number(e.target.value))} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="break-minutes" className="text-right">Завсарлах</Label>
                          <Input id="break-minutes" type="number" value={breakMinutes} onChange={(e) => setBreakMinutes(Number(e.target.value))} className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="secondary">Цуцлах</Button></DialogClose>
                      <Button type="button" onClick={handleSettingsSave}>Хадгалах</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


export default function ToolsPage() {
  const { firestore } = useFirebase();
  const [loading, setLoading] = useState(true);

  // State for all data
  const [initialEnglishWords, setInitialEnglishWords] = useState<EnglishWord[]>([]);
  const [englishGrammar, setEnglishGrammar] = useState<GrammarRule[]>([]);
  const [hiragana, setHiragana] = useState<Kana[]>([]);
  const [katakana, setKatakana] = useState<Kana[]>([]);
  const [initialJapaneseWords, setInitialJapaneseWords] = useState<JapaneseWord[]>([]);
  const [japaneseGrammar, setJapaneseGrammar] = useState<GrammarRule[]>([]);
  const [programmingConcepts, setProgrammingConcepts] = useState<ProgrammingConcept[]>([]);
  const [cheatSheetItems, setCheatSheetItems] = useState<CheatSheetItem[]>([]);
  const [initialProgressItems, setInitialProgressItems] = useState<ProgressItem[]>([]);

  useEffect(() => {
    if (!firestore) return;

    async function seedCollection(collectionName: string, data: any[]) {
        const collectionRef = collection(firestore, collectionName);
        const snapshot = await getDocs(query(collectionRef));
        if (snapshot.empty) {
            console.log(`Seeding ${collectionName}...`);
            const batch = writeBatch(firestore);
            data.forEach(item => {
                const docRef = doc(collectionRef);
                 if (collectionName.includes('Words')) {
                    batch.set(docRef, {...item, memorized: false });
                } else if (collectionName === 'progressItems') {
                    batch.set(docRef, {...item, learned: false, practicing: false });
                } else {
                    batch.set(docRef, item);
                }
            });
            await batch.commit();
        }
    }

    async function getCollectionData<T>(collectionName: string, orderByField: string): Promise<T[]> {
        try {
            const colRef = collection(firestore, collectionName);
            const q = query(colRef, orderBy(orderByField, 'asc'));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return [];
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        } catch (error) {
            console.error(`Error fetching ${collectionName}:`, error);
            return [];
        }
    }
    
    async function fetchData() {
        setLoading(true);
        // Seed all collections
        await Promise.all([
            seedCollection('englishWords', initialEnglishWordsData),
            seedCollection('englishGrammar', initialEnglishGrammarData),
            seedCollection('hiragana', initialHiraganaData),
            seedCollection('katakana', initialKatakanaData),
            seedCollection('japaneseWords', initialJapaneseWordsData),
            seedCollection('japaneseGrammar', initialJapaneseGrammarData),
            seedCollection('programmingConcepts', initialProgrammingConceptsData),
            seedCollection('cheatSheetItems', initialCheatSheetItemsData),
            seedCollection('progressItems', initialProgressItemsData),
        ]);

        // Fetch all data
        const [
            engWords, engGrammar,
            hira, kata, japWords, japGrammar,
            progConcepts, cheatItems, progItems
        ] = await Promise.all([
            getCollectionData<EnglishWord>('englishWords', 'word'),
            getCollectionData<GrammarRule>('englishGrammar', 'title'),
            getCollectionData<Kana>('hiragana', 'romaji'),
            getCollectionData<Kana>('katakana', 'romaji'),
            getCollectionData<JapaneseWord>('japaneseWords', 'word'),
            getCollectionData<GrammarRule>('japaneseGrammar', 'title'),
            getCollectionData<ProgrammingConcept>('programmingConcepts', 'title'),
            getCollectionData<CheatSheetItem>('cheatSheetItems', 'title'),
            getCollectionData<ProgressItem>('progressItems', 'label'),
        ]);

        setInitialEnglishWords(engWords);
        setEnglishGrammar(engGrammar);
        setHiragana(hira);
        setKatakana(kata);
        setInitialJapaneseWords(japWords);
        setJapaneseGrammar(japGrammar);
        setProgrammingConcepts(progConcepts);
        setCheatSheetItems(cheatItems);
        setInitialProgressItems(progItems);
        
        setLoading(false);
    }
    fetchData();
  }, [firestore]);


  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Хэрэгслүүд</h1>
        <p className="text-muted-foreground">
          Суралцах үйл явцад тань туслах хэрэгслүүдийн цуглуулга.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link href={tool.href} key={tool.title} className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {tool.icon}
                    {tool.title}
                  </span>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {loading ? (
        <div className="text-center py-20">Loading...</div>
      ) : (
        <div className="space-y-16">
          <section id="english" className="space-y-8 scroll-mt-20">
            <div className="text-center">
                <h2 className="text-3xl font-bold font-headline">Англи хэл</h2>
                <p className="text-muted-foreground">Үгсийн сан болон дүрмээ бататгаарай.</p>
            </div>
            <div className="space-y-8">
                <VocabularyManager
                    collectionPath="englishWords"
                    initialWords={initialEnglishWords}
                    wordType="english"
                    columns={englishColumns}
                />
                <GrammarList rules={englishGrammar} />
            </div>
          </section>

          <section id="japanese" className="space-y-8 scroll-mt-20">
            <div className="text-center">
                <h2 className="text-3xl font-bold font-headline">Япон хэл</h2>
                <p className="text-muted-foreground">Үсэг, үг, дүрмээ давтан суралцаарай.</p>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <KanaGrid kana={hiragana} title="Hiragana" collectionPath="hiragana" />
                <KanaGrid kana={katakana} title="Katakana" collectionPath="katakana" />
                <div className="lg:col-span-2">
                    <VocabularyManager
                        collectionPath="japaneseWords"
                        initialWords={initialJapaneseWords}
                        wordType="japanese"
                        columns={japaneseColumns}
                    />
                </div>
                <div className="lg:col-span-2">
                     <GrammarList rules={japaneseGrammar} />
                </div>
            </div>
          </section>

          <section id="programming" className="space-y-8 scroll-mt-20">
            <div className="text-center">
                <h2 className="text-3xl font-bold font-headline">Программчлал</h2>
                <p className="text-muted-foreground">Үндсэн ойлголт, хэрэгтэй кодууд, болон ахицаа хянах хэсэг.</p>
            </div>
            <ConceptCards concepts={programmingConcepts} />
            <CheatSheet items={cheatSheetItems} />
            <ProgressTracker initialItems={initialProgressItems} />
          </section>

          <section id="pomodoro" className="space-y-8 scroll-mt-20">
             <div className="text-center">
                <h2 className="text-3xl font-bold font-headline">Pomodoro Timer</h2>
                <p className="text-muted-foreground">Хичээллэх, завсарлах хугацааг удирдах.</p>
            </div>
            <PomodoroTimer />
          </section>
        </div>
      )}
    </div>
  );
}
