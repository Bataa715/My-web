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
      <Card className="w-full max-w-2xl mx-auto p-4 md:p-8 text-center bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 md:h-16 md:w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold">Тест дууслаа!</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base md:text-lg mb-6">
            Таны үр дүн: <strong className="text-primary">{score}</strong> /{' '}
            {questions.length}
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="w-full sm:w-auto" onClick={handleRestart}>
              <Repeat className="mr-2 h-4 w-4" /> Дахин оролдох
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={onExit}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Буцах
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gameMode) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-4 md:p-8 text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-12 w-12 md:h-16 md:w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Тестийн төрлөө сонгоно уу
          </CardTitle>
          <CardDescription className="text-base md:text-lg text-muted-foreground">
            Ямар чиглэлд үгээ шалгуулах вэ?
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 mt-4 md:mt-6">
          <Button
            className="h-16 md:h-24 text-base md:text-xl"
            onClick={() => setGameMode('eng-to-mon')}
          >
            <Languages className="mr-2 md:mr-4 h-5 w-5 md:h-6 md:w-6" /> Англи {'->'} Монгол
          </Button>
          <Button
            className="h-16 md:h-24 text-base md:text-xl"
            onClick={() => setGameMode('mon-to-eng')}
          >
            <Book className="mr-2 md:mr-4 h-5 w-5 md:h-6 md:w-6" /> Монгол {'->'} Англи
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
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={onExit}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="w-full">
          <p className="text-right text-xs sm:text-sm font-mono text-muted-foreground mb-1">
            {currentQuestionIndex + 1} / {questions.length}
          </p>
          <Progress
            value={((currentQuestionIndex + 1) / questions.length) * 100}
            className="h-2"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="text-center min-h-[80px] sm:min-h-[120px] flex justify-center items-center p-4 sm:p-6">
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
            {currentQuestion.questionWord}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6 px-3 sm:px-6">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = option === selectedAnswer;

            let buttonClass = 'h-auto py-3 sm:py-4 text-sm sm:text-base md:text-lg justify-center';
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
                        <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : isSelected ? (
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <div className="w-4 sm:w-6" />
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
