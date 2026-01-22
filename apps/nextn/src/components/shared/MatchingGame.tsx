'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EnglishWord, JapaneseWord } from '@/lib/types';

type Word = EnglishWord | JapaneseWord;

interface MatchingGameProps {
  words: Word[];
  wordType: 'english' | 'japanese';
  onExit: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

interface WordItem {
  id: string;
  text: string;
  type: 'english' | 'mongolian';
  matchId: string;
}

export default function MatchingGame({
  words,
  wordType,
  onExit,
}: MatchingGameProps) {
  const [roundWords, setRoundWords] = useState<Word[]>([]);
  const [englishItems, setEnglishItems] = useState<WordItem[]>([]);
  const [mongolianItems, setMongolianItems] = useState<WordItem[]>([]);
  const [selectedEnglishId, setSelectedEnglishId] = useState<string | null>(
    null
  );
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [incorrectPair, setIncorrectPair] = useState<[string, string] | null>(
    null
  );
  const [isFinished, setIsFinished] = useState(false);

  const startNewRound = () => {
    const shuffledWords = shuffleArray(words);
    const selected = shuffledWords.slice(0, 5);
    setRoundWords(selected);

    const engItems: WordItem[] = selected.map(word => ({
      id: `${word.id}-eng`,
      text: (word as EnglishWord).word,
      type: 'english',
      matchId: word.id!,
    }));

    const monItems: WordItem[] = selected.map(word => ({
      id: `${word.id}-mon`,
      text: (word as EnglishWord).translation,
      type: 'mongolian',
      matchId: word.id!,
    }));

    setEnglishItems(shuffleArray(engItems));
    setMongolianItems(shuffleArray(monItems));
    setSelectedEnglishId(null);
    setMatchedPairs([]);
    setIncorrectPair(null);
    setIsFinished(false);
  };

  useEffect(startNewRound, [words]);

  if (words.length < 5) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-muted-foreground mb-4">
          Энэ тоглоомыг тоглохын тулд дор хаяж 5 үг байх шаардлагатай.
        </p>
        <Button onClick={onExit}>
          <ArrowLeft className="mr-2" /> Буцах
        </Button>
      </div>
    );
  }

  const handleEnglishSelect = (id: string) => {
    if (matchedPairs.includes(id)) return;
    setSelectedEnglishId(id);
  };

  const handleMongolianSelect = (id: string) => {
    if (!selectedEnglishId || matchedPairs.includes(id)) return;

    const englishWord = englishItems.find(
      item => item.id === selectedEnglishId
    );
    const mongolianWord = mongolianItems.find(item => item.id === id);

    if (englishWord?.matchId === mongolianWord?.matchId) {
      setMatchedPairs(prev => [...prev, selectedEnglishId, id]);
      setSelectedEnglishId(null);
      if (matchedPairs.length + 2 === roundWords.length * 2) {
        setIsFinished(true);
      }
    } else {
      setIncorrectPair([selectedEnglishId, id]);
      setTimeout(() => {
        setIncorrectPair(null);
        setSelectedEnglishId(null);
      }, 800);
    }
  };

  if (isFinished) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-8 text-center bg-card/80 backdrop-blur-sm border-primary/20">
        <CardContent className="p-0">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Баяр хүргэе!</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Та бүх үгийг зөв холболоо.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={startNewRound}>
              <Repeat className="mr-2" /> Шинэ үгсээр оролдох
            </Button>
            <Button variant="secondary" onClick={onExit}>
              <ArrowLeft className="mr-2" /> Дуусгах
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={onExit}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg sm:text-2xl font-bold">Үгсийг холбоно уу</h2>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-8">
        <div className="space-y-2 sm:space-y-4">
          {englishItems.map(item => (
            <Button
              key={item.id}
              variant="outline"
              className={cn(
                'w-full h-12 sm:h-16 text-xs sm:text-sm md:text-lg justify-center px-2',
                selectedEnglishId === item.id && 'ring-2 ring-primary',
                matchedPairs.includes(item.id) &&
                  'bg-green-500/20 text-foreground border-green-500/50',
                incorrectPair?.[0] === item.id &&
                  'bg-red-500/20 border-red-500/50 animate-shake'
              )}
              onClick={() => handleEnglishSelect(item.id)}
            >
              {item.text}
            </Button>
          ))}
        </div>
        <div className="space-y-2 sm:space-y-4">
          {mongolianItems.map(item => (
            <Button
              key={item.id}
              variant="outline"
              className={cn(
                'w-full h-12 sm:h-16 text-xs sm:text-sm md:text-lg justify-center px-2',
                matchedPairs.includes(item.id) &&
                  'bg-green-500/20 text-foreground border-green-500/50',
                incorrectPair?.[1] === item.id &&
                  'bg-red-500/20 border-red-500/50 animate-shake'
              )}
              onClick={() => handleMongolianSelect(item.id)}
              disabled={!selectedEnglishId || matchedPairs.includes(item.id)}
            >
              {item.text}
            </Button>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
