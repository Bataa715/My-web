'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Repeat,
  CheckCircle2,
  Languages,
  Book,
  HelpCircle,
  Check,
  X,
} from 'lucide-react';
import type { EnglishWord, JapaneseWord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type Word = EnglishWord | JapaneseWord;
type GameMode = 'eng-to-mon' | 'mon-to-eng';

interface Question {
  id: string;
  questionWord: string;
  correctAnswer: string;
  options: string[];
}

interface TestGameProps {
  words: Word[];
  wordType: 'english' | 'japanese';
  onExit: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function TestGame({ words, wordType, onExit }: TestGameProps) {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (gameMode) {
      const generateQuestions = (): Question[] => {
        return shuffleArray(words).map(currentWord => {
          let questionWord: string, correctAnswer: string;

          if (gameMode === 'eng-to-mon') {
            questionWord = (currentWord as EnglishWord).word;
            correctAnswer = (currentWord as EnglishWord).translation;
          } else {
            // mon-to-eng
            questionWord = (currentWord as EnglishWord).translation;
            correctAnswer = (currentWord as EnglishWord).word;
          }

          const otherWords = words.filter(w => w.id !== currentWord.id);
          const wrongAnswers = shuffleArray(otherWords)
            .slice(0, 3)
            .map(w =>
              gameMode === 'eng-to-mon'
                ? (w as EnglishWord).translation
                : (w as EnglishWord).word
            );

          return {
            id: currentWord.id!,
            questionWord,
            correctAnswer,
            options: shuffleArray([...wrongAnswers, correctAnswer]),
          };
        });
      };
      setQuestions(generateQuestions());
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setIsFinished(false);
    }
  }, [gameMode, words]);

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer) return; // Already answered
    setSelectedAnswer(option);
    if (option === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setIsFinished(true);
      }
    }, 1500); // Wait 1.5 seconds before moving to next question
  };

  const handleRestart = () => {
    setGameMode(null);
    setQuestions([]);
  };

  if (isFinished) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-8 text-center bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-bold">Тест дууслаа!</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg mb-6">
            Таны үр дүн: <strong className="text-primary">{score}</strong> /{' '}
            {questions.length}
          </CardDescription>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleRestart}>
              <Repeat className="mr-2" /> Дахин оролдох
            </Button>
            <Button variant="outline" onClick={onExit}>
              <ArrowLeft className="mr-2" /> Буцах
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gameMode) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-8 text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Тестийн төрлөө сонгоно уу
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Ямар чиглэлд үгээ шалгуулах вэ?
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Button
            className="h-24 text-xl"
            onClick={() => setGameMode('eng-to-mon')}
          >
            <Languages className="mr-4" /> Англи {'->'} Монгол
          </Button>
          <Button
            className="h-24 text-xl"
            onClick={() => setGameMode('mon-to-eng')}
          >
            <Book className="mr-4" /> Монгол {'->'} Англи
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-muted-foreground mb-4">
          Тест үүсгэхэд алдаа гарлаа. Үгийн тоо хүрэлцэхгүй байж магадгүй.
        </p>
        <Button onClick={onExit}>
          <ArrowLeft className="mr-2" /> Буцах
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onExit}>
          <ArrowLeft />
        </Button>
        <div className="w-full">
          <p className="text-right text-sm font-mono text-muted-foreground mb-1">
            {currentQuestionIndex + 1} / {questions.length}
          </p>
          <Progress
            value={((currentQuestionIndex + 1) / questions.length) * 100}
            className="h-2"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="text-center min-h-[120px] flex justify-center items-center">
          <CardTitle className="text-5xl font-bold text-primary">
            {currentQuestion.questionWord}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = option === selectedAnswer;

            let buttonClass = 'h-auto py-4 text-lg justify-center';
            if (selectedAnswer) {
              if (isCorrect) {
                buttonClass = cn(
                  buttonClass,
                  'bg-green-500/80 hover:bg-green-500/90 text-white'
                );
              } else if (isSelected) {
                buttonClass = cn(
                  buttonClass,
                  'bg-red-500/80 hover:bg-red-500/90 text-white'
                );
              }
            }

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={!!selectedAnswer}
                >
                  <span className="mr-2">
                    {selectedAnswer &&
                      (isCorrect ? (
                        <Check />
                      ) : isSelected ? (
                        <X />
                      ) : (
                        <div className="w-6" />
                      ))}
                  </span>
                  {option}
                </Button>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
