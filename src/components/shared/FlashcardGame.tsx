'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Repeat,
  ArrowLeft,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
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

export default function FlashcardGame({
  words,
  wordType,
  onComplete,
  onExit,
}: FlashcardGameProps) {
  const [deck, setDeck] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [unknownWords, setUnknownWords] = useState<Word[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const [answeredCorrectly, setAnsweredCorrectly] = useState(0);
  const [answeredIncorrectly, setAnsweredIncorrectly] = useState(0);

  useEffect(() => {
    // Shuffle the words to start
    setDeck([...words].sort(() => Math.random() - 0.5));
    setAnsweredCorrectly(0);
    setAnsweredIncorrectly(0);
  }, [words]);

  if (deck.length === 0 && !isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-muted-foreground mb-4">
          Тоглоом эхлүүлэхэд үг сонгогдоогүй байна.
        </p>
        <Button onClick={onExit}>
          <ArrowLeft className="mr-2" /> Буцах
        </Button>
      </div>
    );
  }

  const currentWord = deck[currentIndex];

  const handleNextCard = (known: boolean) => {
    if (known) {
      if (currentWord.id && !knownWords.includes(currentWord.id)) {
        if (!currentWord.memorized) {
          setKnownWords(prev => [...prev, currentWord.id!]);
        }
      }
      setAnsweredCorrectly(prev => prev + 1);
    } else {
      if (!unknownWords.some(w => w.id === currentWord.id)) {
        setUnknownWords(prev => [...prev, currentWord]);
      }
      setAnsweredIncorrectly(prev => prev + 1);
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
    setAnsweredCorrectly(0);
    setAnsweredIncorrectly(0);
  };

  const getCardContent = (word: Word, side: 'front' | 'back') => {
    if (wordType === 'english') {
      const w = word as EnglishWord;
      if (side === 'front')
        return (
          <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground">
            {w.word}
          </h2>
        );
      return (
        <div className="text-center">
          <p className="text-3xl font-semibold text-primary">{w.translation}</p>
          {w.definition && (
            <p className="text-base text-foreground/70 mt-4">{w.definition}</p>
          )}
        </div>
      );
    } else {
      const w = word as JapaneseWord;
      if (side === 'front')
        return (
          <div className="text-center">
            <h2 className="text-6xl md:text-7xl font-bold text-foreground">
              {w.word}
            </h2>
            <p className="text-lg text-foreground/70 mt-2">{w.romaji}</p>
          </div>
        );
      return (
        <div className="text-center">
          <p className="text-3xl font-semibold text-primary">{w.meaning}</p>
        </div>
      );
    }
  };

  if (isFinished) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-8 text-center bg-card/80 backdrop-blur-sm border-primary/20">
        <CardContent className="p-0">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Баяр хүргэе!</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Та энэ удаагийн давтлагыг дуусгалаа.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-green-900/30 rounded-lg">
              <p className="text-4xl font-bold text-green-400">
                {answeredCorrectly}
              </p>
              <p className="text-sm text-muted-foreground">Мэдсэн</p>
            </div>
            <div className="p-4 bg-red-900/30 rounded-lg">
              <p className="text-4xl font-bold text-red-400">
                {answeredIncorrectly}
              </p>
              <p className="text-sm text-muted-foreground">Мэдээгүй</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => handleRestart(false)}>
              <Repeat className="mr-2" /> Бүгдийг дахин давтах
            </Button>
            {unknownWords.length > 0 && (
              <Button variant="outline" onClick={() => handleRestart(true)}>
                <Repeat className="mr-2" /> Алдсан үгсээ давтах
              </Button>
            )}
            <Button variant="secondary" onClick={() => onComplete(knownWords)}>
              <Check className="mr-2" /> Дуусгах
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = (currentIndex / deck.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={onExit}>
          <ArrowLeft />
        </Button>
        <div className="flex-grow flex items-center gap-4">
          <div className="flex items-center gap-2 text-red-400">
            <X className="h-5 w-5" />
            <span className="font-bold text-lg">{answeredIncorrectly}</span>
          </div>
          <Progress value={progress} className="w-full h-2" />
          <div className="flex items-center gap-2 text-green-400">
            <Check className="h-5 w-5" />
            <span className="font-bold text-lg">{answeredCorrectly}</span>
          </div>
        </div>
        <span className="text-sm text-muted-foreground font-mono whitespace-nowrap">
          {currentIndex + 1} / {deck.length}
        </span>
      </div>

      <div
        className="w-full h-[350px] [perspective:1200px] cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            className="relative w-full h-full [transform-style:preserve-3d]"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotateY: isFlipped ? 180 : 0,
            }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {/* Front of Card */}
            <div className="absolute w-full h-full [backface-visibility:hidden]">
              <div className="card-face card-front flex items-center justify-center p-6">
                {currentWord && getCardContent(currentWord, 'front')}
              </div>
            </div>
            {/* Back of Card */}
            <div
              className="absolute w-full h-full [backface-visibility:hidden]"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <div className="card-face card-back flex items-center justify-center p-6">
                {currentWord && getCardContent(currentWord, 'back')}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {isFlipped && (
        <motion.div className="mt-6 grid grid-cols-2 gap-6">
          <Button
            variant="outline"
            size="icon"
            className="w-24 h-24 rounded-full mx-auto bg-red-500/10 border-2 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-300 hover:text-red-200 transition-all duration-300 transform hover:scale-105"
            onClick={() => handleNextCard(false)}
          >
            <X className="h-10 w-10" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-24 h-24 rounded-full mx-auto bg-green-500/10 border-2 border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 text-green-300 hover:text-green-200 transition-all duration-300 transform hover:scale-105"
            onClick={() => handleNextCard(true)}
          >
            <Check className="h-10 w-10" />
          </Button>
        </motion.div>
      )}

      <style jsx>{`
        .card-face {
          width: 100%;
          height: 100%;
          border-radius: 1rem;
          box-shadow:
            0 10px 20px rgba(0, 0, 0, 0.2),
            0 6px 6px rgba(0, 0, 0, 0.2);
          border: 1px solid hsl(var(--border) / 0.5);
          position: relative;
          overflow: hidden;
        }
        .card-face::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(
              circle at top left,
              hsl(var(--primary) / 0.1),
              transparent 40%
            ),
            radial-gradient(
              circle at bottom right,
              hsl(var(--accent) / 0.1),
              transparent 40%
            );
          pointer-events: none;
        }
        .card-front {
          background: linear-gradient(
            135deg,
            hsl(var(--card)),
            hsl(var(--muted))
          );
        }
        .card-back {
          background: linear-gradient(
            135deg,
            hsl(var(--secondary) / 0.8),
            hsl(var(--card) / 0.8)
          );
        }
      `}</style>
    </div>
  );
}
