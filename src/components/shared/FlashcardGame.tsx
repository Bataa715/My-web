
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Repeat, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { EnglishWord, JapaneseWord } from '@/lib/types';

type Word = EnglishWord | JapaneseWord;

interface FlashcardGameProps {
  words: Word[];
  wordType: 'english' | 'japanese';
  onComplete: (memorizedIds: string[]) => void;
  onExit: () => void;
}

export default function FlashcardGame({ words, wordType, onComplete, onExit }: FlashcardGameProps) {
  const [deck, setDeck] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [unknownWords, setUnknownWords] = useState<Word[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Shuffle the words to start
    setDeck([...words].sort(() => Math.random() - 0.5));
  }, [words]);

  if (deck.length === 0 && !isFinished) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
            <p className="text-muted-foreground mb-4">Тоглоом эхлүүлэхэд үг сонгогдоогүй байна.</p>
            <Button onClick={onExit}><ArrowLeft className="mr-2" /> Буцах</Button>
        </div>
    );
  }

  const currentWord = deck[currentIndex];

  const handleNextCard = (known: boolean) => {
    if (known && currentWord.id) {
        if (!currentWord.memorized) { // Only add if it wasn't already memorized
            setKnownWords(prev => [...prev, currentWord.id!]);
        }
    } else {
        setUnknownWords(prev => [...prev, currentWord]);
    }

    setIsFlipped(false);

    if (currentIndex < deck.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // End of the deck
      setIsFinished(true);
    }
  };

  const handleRestart = (onlyUnknown: boolean) => {
    const wordsToPractice = onlyUnknown ? unknownWords : words;
    setDeck([...wordsToPractice].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownWords([]);
    setUnknownWords([]);
    setIsFinished(false);
  }

  const getCardContent = (word: Word, side: 'front' | 'back') => {
    if (wordType === 'english') {
      const w = word as EnglishWord;
      if (side === 'front') return <h2 className="text-4xl font-bold text-center">{w.word}</h2>;
      return (
        <div className="text-center">
          <p className="text-2xl font-semibold">{w.translation}</p>
          {w.definition && <p className="text-sm text-muted-foreground mt-2">{w.definition}</p>}
        </div>
      );
    } else {
      const w = word as JapaneseWord;
      if (side === 'front') return (
        <div className="text-center">
            <h2 className="text-6xl font-bold">{w.word}</h2>
            <p className="text-lg text-muted-foreground">{w.romaji}</p>
        </div>
      );
      return (
         <div className="text-center">
             <p className="text-2xl font-semibold">{w.meaning}</p>
         </div>
      );
    }
  };

  if(isFinished) {
      return (
          <Card className="w-full max-w-2xl mx-auto p-8 text-center">
            <CardContent>
                <h2 className="text-3xl font-bold mb-4">Баяр хүргэе!</h2>
                <p className="text-lg text-muted-foreground mb-6">Та энэ удаагийн давтлагыг дуусгалаа.</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400">{knownWords.length}</p>
                        <p className="text-sm text-muted-foreground">Мэдсэн</p>
                    </div>
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <p className="text-4xl font-bold text-red-500 dark:text-red-400">{unknownWords.length}</p>
                        <p className="text-sm text-muted-foreground">Мэдээгүй</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => handleRestart(false)}><Repeat className="mr-2"/> Бүгдийг дахин давтах</Button>
                    {unknownWords.length > 0 && <Button variant="outline" onClick={() => handleRestart(true)}><Repeat className="mr-2"/> Алдсан үгсээ давтах</Button>}
                    <Button variant="secondary" onClick={() => onComplete(knownWords)}><Check className="mr-2" /> Дуусгах</Button>
                </div>
            </CardContent>
          </Card>
      )
  }

  const progress = (currentIndex / deck.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={onExit}><ArrowLeft/></Button>
            <Progress value={progress} className="w-full" />
            <span className="text-sm text-muted-foreground font-mono whitespace-nowrap">{currentIndex + 1} / {deck.length}</span>
        </div>

        <div 
            className="w-full h-[300px] perspective-[1000px] cursor-pointer" 
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <AnimatePresence>
                <motion.div
                    key={currentIndex}
                    className="relative w-full h-full preserve-3d"
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                    {/* Front of Card */}
                    <motion.div className="absolute w-full h-full backface-hidden">
                        <Card className="w-full h-full flex items-center justify-center p-6">
                            {getCardContent(currentWord, 'front')}
                        </Card>
                    </motion.div>
                    {/* Back of Card */}
                    <motion.div
                        className="absolute w-full h-full backface-hidden"
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <Card className="w-full h-full flex items-center justify-center p-6 bg-muted">
                            {getCardContent(currentWord, 'back')}
                        </Card>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
      </div>
      
      <div className={cn("mt-6 grid grid-cols-2 gap-4 transition-opacity duration-300", !isFlipped && "opacity-0 pointer-events-none")}>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white h-16 text-lg"
            onClick={() => handleNextCard(false)}
        >
            <X className="mr-2" /> Мэдээгүй
          </Button>
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white h-16 text-lg"
            onClick={() => handleNextCard(true)}
          >
            <Check className="mr-2" /> Мэдсэн
          </Button>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </div>
  );
}
