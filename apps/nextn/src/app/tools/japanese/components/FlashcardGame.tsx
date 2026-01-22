'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  Check,
  X,
  Brain,
  Zap,
  Trophy,
  Flame,
  Volume2,
  Settings,
  RefreshCw,
  Target,
  ChevronRight,
} from 'lucide-react';
import { KanaCharacter, hiraganaData, katakanaData } from '@/data/kana';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CardData extends KanaCharacter {
  id: string;
  level: number; // 0-4 SRS level
  nextReview: number; // timestamp
  easeFactor: number;
  interval: number; // days
  reviews: number;
}

interface FlashcardGameProps {
  type: 'hiragana' | 'katakana' | 'both';
  onClose?: () => void;
}

export default function FlashcardGame({ type, onClose }: FlashcardGameProps) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentCard, setCurrentCard] = useState<CardData | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({
    reviewed: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    newCards: 0,
    learning: 0,
    mastered: 0,
  });
  const [sessionCards, setSessionCards] = useState<CardData[]>([]);
  const [gameMode, setGameMode] = useState<'character' | 'romaji'>('character'); // Show character, guess romaji
  const [cardLimit, setCardLimit] = useState(20);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [inputMode, setInputMode] = useState<'buttons' | 'typing'>('buttons');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Initialize cards from localStorage or create new
  useEffect(() => {
    const storageKey = `anki-${type}`;
    const savedCards = localStorage.getItem(storageKey);

    if (savedCards) {
      setCards(JSON.parse(savedCards));
    } else {
      let kanaData: KanaCharacter[] = [];
      if (type === 'hiragana') {
        kanaData = hiraganaData;
      } else if (type === 'katakana') {
        kanaData = katakanaData;
      } else {
        kanaData = [...hiraganaData, ...katakanaData];
      }

      const initialCards: CardData[] = kanaData.map((kana, index) => ({
        ...kana,
        id: `${type}-${index}`,
        level: 0,
        nextReview: Date.now(),
        easeFactor: 2.5,
        interval: 0,
        reviews: 0,
      }));

      setCards(initialCards);
      localStorage.setItem(storageKey, JSON.stringify(initialCards));
    }
  }, [type]);

  // Prepare session cards
  useEffect(() => {
    if (cards.length === 0) return;

    const now = Date.now();

    // Get cards due for review
    const dueCards = cards
      .filter(card => card.nextReview <= now)
      .sort((a, b) => a.nextReview - b.nextReview);

    // Get new cards (never reviewed)
    const newCards = cards
      .filter(card => card.reviews === 0)
      .slice(0, Math.min(10, cardLimit));

    // Combine due cards and new cards
    const sessionPool = [
      ...dueCards,
      ...newCards.filter(nc => !dueCards.find(dc => dc.id === nc.id)),
    ];

    // Shuffle and limit
    const shuffled = sessionPool
      .sort(() => Math.random() - 0.5)
      .slice(0, cardLimit);

    setSessionCards(shuffled);

    if (shuffled.length > 0 && !currentCard) {
      setCurrentCard(shuffled[0]);
    }

    // Update stats
    const masteredCount = cards.filter(c => c.level >= 4).length;
    const learningCount = cards.filter(c => c.level > 0 && c.level < 4).length;
    const newCount = cards.filter(c => c.reviews === 0).length;

    setStats(prev => ({
      ...prev,
      mastered: masteredCount,
      learning: learningCount,
      newCards: newCount,
    }));
  }, [cards, cardLimit]);

  const saveCards = useCallback(
    (updatedCards: CardData[]) => {
      const storageKey = `anki-${type}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedCards));
      setCards(updatedCards);
    },
    [type]
  );

  const playSound = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleFlip = () => {
    if (!showAnswer) {
      setIsFlipped(true);
      setShowAnswer(true);
      if (currentCard) {
        playSound(currentCard.character);
      }
    }
  };

  const handleTypingSubmit = () => {
    if (!currentCard || !userInput.trim()) return;

    const correct =
      userInput.toLowerCase().trim() === currentCard.romaji.toLowerCase();
    setIsCorrect(correct);
    setIsFlipped(true);
    setShowAnswer(true);

    if (currentCard) {
      playSound(currentCard.character);
    }

    // Auto-grade after showing answer
    setTimeout(() => {
      handleGrade(correct ? 3 : 1);
    }, 1500);
  };

  // SRS algorithm (simplified SM-2)
  const handleGrade = (quality: number) => {
    // quality: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy
    if (!currentCard) return;

    const updatedCard = { ...currentCard };
    updatedCard.reviews += 1;

    if (quality < 2) {
      // Failed - reset to learning
      updatedCard.level = Math.max(0, updatedCard.level - 1);
      updatedCard.interval = 0;
      updatedCard.nextReview = Date.now() + 1 * 60 * 1000; // 1 minute
      setStats(prev => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        streak: 0,
      }));
    } else {
      // Success
      updatedCard.level = Math.min(4, updatedCard.level + 1);

      // Calculate new interval based on level
      const intervals = [
        1 * 60 * 1000, // Level 0: 1 minute
        10 * 60 * 1000, // Level 1: 10 minutes
        1 * 24 * 60 * 60 * 1000, // Level 2: 1 day
        3 * 24 * 60 * 60 * 1000, // Level 3: 3 days
        7 * 24 * 60 * 60 * 1000, // Level 4: 7 days
      ];

      if (quality === 3) {
        updatedCard.easeFactor = Math.min(3.0, updatedCard.easeFactor + 0.15);
      }

      const baseInterval = intervals[updatedCard.level] || intervals[4];
      updatedCard.interval = baseInterval * updatedCard.easeFactor;
      updatedCard.nextReview = Date.now() + updatedCard.interval;

      const newStreak = stats.streak + 1;
      setStats(prev => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        correct: prev.correct + 1,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      }));
    }

    // Update cards array
    const updatedCards = cards.map(c =>
      c.id === currentCard.id ? updatedCard : c
    );
    saveCards(updatedCards);

    // Move to next card
    moveToNextCard();
  };

  const moveToNextCard = () => {
    setIsFlipped(false);
    setShowAnswer(false);
    setUserInput('');
    setIsCorrect(null);

    const currentIndex = sessionCards.findIndex(c => c.id === currentCard?.id);
    const nextIndex = currentIndex + 1;

    if (nextIndex < sessionCards.length) {
      setCurrentCard(sessionCards[nextIndex]);
    } else {
      setSessionComplete(true);
    }
  };

  const restartSession = () => {
    setSessionComplete(false);
    setStats({
      reviewed: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      newCards: stats.newCards,
      learning: stats.learning,
      mastered: stats.mastered,
    });

    // Reshuffle cards
    const shuffled = [...sessionCards].sort(() => Math.random() - 0.5);
    setSessionCards(shuffled);
    setCurrentCard(shuffled[0] || null);
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const resetProgress = () => {
    const storageKey = `anki-${type}`;
    localStorage.removeItem(storageKey);

    let kanaData: KanaCharacter[] = [];
    if (type === 'hiragana') {
      kanaData = hiraganaData;
    } else if (type === 'katakana') {
      kanaData = katakanaData;
    } else {
      kanaData = [...hiraganaData, ...katakanaData];
    }

    const initialCards: CardData[] = kanaData.map((kana, index) => ({
      ...kana,
      id: `${type}-${index}`,
      level: 0,
      nextReview: Date.now(),
      easeFactor: 2.5,
      interval: 0,
      reviews: 0,
    }));

    setCards(initialCards);
    localStorage.setItem(storageKey, JSON.stringify(initialCards));
    restartSession();
  };

  const progress =
    sessionCards.length > 0 ? (stats.reviewed / sessionCards.length) * 100 : 0;

  const getLevelColor = (level: number) => {
    const colors = [
      'bg-gray-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
    ];
    return colors[level] || colors[0];
  };

  if (sessionComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[500px] space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center"
        >
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>

        <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
          Session Complete!
        </h2>

        <div className="grid grid-cols-3 gap-4 text-center">
          <Card className="bg-card/50 backdrop-blur-xl border-0">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-rose-400">
                {stats.reviewed}
              </div>
              <div className="text-xs text-muted-foreground">Reviewed</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-0">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-green-400">
                {stats.correct}
              </div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-0">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-amber-400">
                {stats.bestStreak}
              </div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={restartSession}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Practice Again
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Back to Chart
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  if (!currentCard || sessionCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Brain className="w-16 h-16 text-muted-foreground animate-pulse" />
        <p className="text-lg text-muted-foreground">
          No cards to review right now!
        </p>
        <p className="text-sm text-muted-foreground">
          Come back later or reset progress
        </p>
        <Button variant="outline" onClick={resetProgress}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Progress
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className="bg-rose-500/10 text-rose-400 border-rose-500/30"
          >
            <Target className="w-3 h-3 mr-1" />
            {stats.reviewed} / {sessionCards.length}
          </Badge>
          {stats.streak > 0 && (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-400 border-amber-500/30"
            >
              <Flame className="w-3 h-3 mr-1" />
              {stats.streak} streak
            </Badge>
          )}
        </div>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Game Mode</label>
                <Select
                  value={gameMode}
                  onValueChange={v => setGameMode(v as 'character' | 'romaji')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="character">
                      Show Character → Guess Romaji
                    </SelectItem>
                    <SelectItem value="romaji">
                      Show Romaji → Guess Character
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Input Mode</label>
                <Select
                  value={inputMode}
                  onValueChange={v => setInputMode(v as 'buttons' | 'typing')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buttons">Rating Buttons</SelectItem>
                    <SelectItem value="typing">Type Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cards per Session</label>
                <Select
                  value={cardLimit.toString()}
                  onValueChange={v => setCardLimit(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 cards</SelectItem>
                    <SelectItem value="20">20 cards</SelectItem>
                    <SelectItem value="50">50 cards</SelectItem>
                    <SelectItem value="100">100 cards</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  resetProgress();
                  setShowSettings(false);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All Progress
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2 bg-white/10" />

      {/* Flashcard */}
      <div className="flex justify-center py-8">
        <motion.div
          className="relative w-72 h-96 cursor-pointer perspective-1000"
          onClick={!showAnswer ? handleFlip : undefined}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="w-full h-full relative preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front of card */}
            <div
              className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center p-6 shadow-2xl"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <Badge
                className={`absolute top-4 right-4 ${getLevelColor(currentCard.level)}`}
              >
                Lv {currentCard.level}
              </Badge>

              {gameMode === 'character' ? (
                <>
                  <motion.span
                    className="text-8xl font-bold mb-4"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    key={currentCard.id}
                  >
                    {currentCard.character}
                  </motion.span>
                  <p className="text-muted-foreground text-sm">
                    What is this character?
                  </p>
                </>
              ) : (
                <>
                  <motion.span
                    className="text-5xl font-bold mb-4 text-rose-400"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    key={currentCard.id}
                  >
                    {currentCard.romaji}
                  </motion.span>
                  <p className="text-muted-foreground text-sm">
                    What character is this?
                  </p>
                </>
              )}

              <div className="absolute bottom-6 flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">Tap to reveal</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Back of card */}
            <div
              className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center p-6 shadow-2xl"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={e => {
                  e.stopPropagation();
                  playSound(currentCard.character);
                }}
              >
                <Volume2 className="w-5 h-5" />
              </Button>

              <motion.span
                className="text-7xl font-bold mb-2"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                {currentCard.character}
              </motion.span>

              <motion.span
                className="text-3xl font-semibold text-rose-400 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {currentCard.romaji}
              </motion.span>

              <Badge variant="outline" className="mt-2 text-xs">
                {currentCard.type === 'vowel' && '母音 Vowel'}
                {currentCard.type === 'consonant' && '子音 Consonant'}
                {currentCard.type === 'dakuten' && '濁音 Dakuten'}
                {currentCard.type === 'handakuten' && '半濁音 Handakuten'}
                {currentCard.type === 'combo' && '拗音 Combination'}
              </Badge>

              {isCorrect !== null && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`mt-4 flex items-center gap-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
                >
                  {isCorrect ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <X className="w-6 h-6" />
                  )}
                  <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Input Area for Typing Mode */}
      {inputMode === 'typing' && !showAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4"
        >
          <input
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTypingSubmit()}
            placeholder={
              gameMode === 'character' ? 'Type romaji...' : 'Type character...'
            }
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center text-xl w-48 focus:outline-none focus:border-rose-500/50"
            autoFocus
          />
          <Button
            onClick={handleTypingSubmit}
            className="bg-gradient-to-r from-rose-500 to-pink-500"
          >
            Check
          </Button>
        </motion.div>
      )}

      {/* Rating Buttons */}
      <AnimatePresence>
        {showAnswer && inputMode === 'buttons' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-4 gap-3"
          >
            <Button
              onClick={() => handleGrade(0)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
            >
              <X className="w-4 h-4 mr-1" />
              Again
            </Button>
            <Button
              onClick={() => handleGrade(1)}
              className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30"
            >
              Hard
            </Button>
            <Button
              onClick={() => handleGrade(2)}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
            >
              Good
            </Button>
            <Button
              onClick={() => handleGrade(3)}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
            >
              <Zap className="w-4 h-4 mr-1" />
              Easy
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <Card className="bg-card/30 backdrop-blur-xl border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats.newCards}
            </div>
            <div className="text-xs text-muted-foreground">New</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur-xl border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">
              {stats.learning}
            </div>
            <div className="text-xs text-muted-foreground">Learning</div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 backdrop-blur-xl border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {stats.mastered}
            </div>
            <div className="text-xs text-muted-foreground">Mastered</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
