'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Star, Trophy, Heart, Zap, ChevronRight,
  RotateCcw, CheckCircle2, XCircle, BookOpen,
  Target, TrendingUp, Award, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFirebase } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import ToolPageShell from '@/components/shared/ToolPageShell';
import {
  WORDS, LEVELS, LEVEL_LABELS, getWordsByLevel, getDistractors,
  type MLWord,
} from '@/lib/mylingo-words';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface WordRecord { s: number; c: number } // seen, correct

interface Stats {
  xp: number;
  streak: number;
  lastPlayed: string;
  currentLevel: MLWord['level'];
  progress: Record<string, WordRecord>;
}

interface QuizQuestion {
  word: MLWord;
  choices: string[];
  correct: string;
}

type View = 'hub' | 'quiz' | 'result';

const XP_CORRECT = 10;
const XP_PERFECT_BONUS = 50;
const QUESTIONS_PER_SESSION = 10;
const MAX_HEARTS = 3;

const LEVEL_COLORS: Record<MLWord['level'], string> = {
  A1: 'from-emerald-500 to-teal-500',
  A2: 'from-sky-500 to-blue-500',
  B1: 'from-violet-500 to-purple-500',
  B2: 'from-orange-500 to-amber-500',
  C1: 'from-rose-500 to-pink-500',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildSession(level: MLWord['level'], progress: Record<string, WordRecord>): QuizQuestion[] {
  const levelWords = getWordsByLevel(level);

  // Priority: unseen first, then low-accuracy words
  const unseen = levelWords.filter(w => !progress[w.id]);
  const review = levelWords
    .filter(w => progress[w.id] && progress[w.id].s > 0 && progress[w.id].c / progress[w.id].s < 0.8)
    .sort((a, b) => (progress[a.id].c / progress[a.id].s) - (progress[b.id].c / progress[b.id].s));

  const pool = [...unseen, ...review, ...levelWords]
    .filter((w, i, arr) => arr.findIndex(x => x.id === w.id) === i)
    .slice(0, QUESTIONS_PER_SESSION);

  return pool.map(word => {
    const distractors = getDistractors(word, 3);
    const choices = [...distractors, word.mn].sort(() => Math.random() - 0.5);
    return { word, choices, correct: word.mn };
  });
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function calcStreak(lastPlayed: string, currentStreak: number): number {
  const today = todayString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (lastPlayed === today) return currentStreak;
  if (lastPlayed === yesterday) return currentStreak + 1;
  return 1;
}

function learnedCount(level: MLWord['level'], progress: Record<string, WordRecord>): number {
  return getWordsByLevel(level).filter(w => {
    const r = progress[w.id];
    return r && r.s >= 2 && r.c / r.s >= 0.8;
  }).length;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-4">
      <div className="text-primary">{icon}</div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/60">{sub}</p>}
    </div>
  );
}

function HeartRow({ hearts }: { hearts: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: MAX_HEARTS }).map((_, i) => (
        <Heart
          key={i}
          className={cn('h-5 w-5 transition-all duration-300', i < hearts ? 'fill-rose-500 text-rose-500' : 'text-border fill-border')}
        />
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MyLingoPage() {
  const { firestore, user } = useFirebase();
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState<Stats>({
    xp: 0, streak: 0, lastPlayed: '', currentLevel: 'A1', progress: {},
  });

  // ── View state
  const [view, setView] = useState<View>('hub');

  // ── Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [xpEarned, setXpEarned] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState<boolean[]>([]);
  const [saving, setSaving] = useState(false);

  // ── Load Firebase stats ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !firestore) { setLoadingData(false); return; }
    const ref = doc(firestore, 'users', user.uid);
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setStats({
          xp: d.mylingoXP ?? 0,
          streak: d.mylingoStreak ?? 0,
          lastPlayed: d.mylingoLastPlayed ?? '',
          currentLevel: d.mylingoLevel ?? 'A1',
          progress: d.mylingoProgress ?? {},
        });
      }
      setLoadingData(false);
    }).catch(() => setLoadingData(false));
  }, [user, firestore]);

  // ── Start quiz session ────────────────────────────────────────────────────
  const startQuiz = useCallback(() => {
    const qs = buildSession(stats.currentLevel, stats.progress);
    if (qs.length === 0) return;
    setQuestions(qs);
    setQIdx(0);
    setHearts(MAX_HEARTS);
    setXpEarned(0);
    setSelected(null);
    setShowFeedback(false);
    setSessionCorrect([]);
    setView('quiz');
  }, [stats.currentLevel, stats.progress]);

  // ── Handle answer selection ───────────────────────────────────────────────
  const handleAnswer = useCallback((choice: string) => {
    if (showFeedback || !questions[qIdx]) return;

    const isCorrect = choice === questions[qIdx].correct;
    const newHearts = isCorrect ? hearts : hearts - 1;
    const newXP = isCorrect ? xpEarned + XP_CORRECT : xpEarned;
    const newCorrect = [...sessionCorrect, isCorrect];

    setSelected(choice);
    setShowFeedback(true);
    setHearts(newHearts);
    setXpEarned(newXP);
    setSessionCorrect(newCorrect);

    const isLastQuestion = qIdx + 1 >= questions.length;
    const isGameOver = newHearts <= 0;

    setTimeout(() => {
      if (isLastQuestion || isGameOver) {
        // Save to Firebase
        saveSession(newCorrect, newXP, newHearts);
      } else {
        setQIdx(prev => prev + 1);
        setSelected(null);
        setShowFeedback(false);
      }
    }, 1400);
  }, [showFeedback, questions, qIdx, hearts, xpEarned, sessionCorrect]); // eslint-disable-line

  const saveSession = async (correct: boolean[], xp: number, heartsLeft: number) => {
    setSaving(true);

    // Update local progress map
    const updatedProgress = { ...stats.progress };
    questions.slice(0, correct.length).forEach((q, i) => {
      const id = String(q.word.id);
      const prev = updatedProgress[id] ?? { s: 0, c: 0 };
      updatedProgress[id] = { s: prev.s + 1, c: prev.c + (correct[i] ? 1 : 0) };
    });

    const perfectBonus = correct.every(Boolean) && heartsLeft === MAX_HEARTS ? XP_PERFECT_BONUS : 0;
    const totalXP = xp + perfectBonus;
    const newStreak = calcStreak(stats.lastPlayed, stats.streak);
    const newTotalXP = stats.xp + totalXP;

    const newStats: Stats = {
      ...stats,
      xp: newTotalXP,
      streak: newStreak,
      lastPlayed: todayString(),
      progress: updatedProgress,
    };
    setStats(newStats);
    setXpEarned(totalXP);

    if (user && firestore) {
      try {
        await updateDoc(doc(firestore, 'users', user.uid), {
          mylingoXP: newTotalXP,
          mylingoStreak: newStreak,
          mylingoLastPlayed: todayString(),
          mylingoProgress: updatedProgress,
          mylingoLevel: stats.currentLevel,
        });
      } catch { /* ignore */ }
    }

    setSaving(false);
    setView('result');
  };

  const resetToHub = () => {
    setView('hub');
    setSelected(null);
    setShowFeedback(false);
  };

  const changeLevel = async (level: MLWord['level']) => {
    const updated = { ...stats, currentLevel: level };
    setStats(updated);
    if (user && firestore) {
      try { await updateDoc(doc(firestore, 'users', user.uid), { mylingoLevel: level }); }
      catch { /* ignore */ }
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ToolPageShell
      title="MyLingo"
      eyebrow="Vocabulary Training"
      icon={<Zap className="h-8 w-8" />}
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/tools' },
        { label: 'Англи хэл', href: '/tools/english' },
        { label: 'MyLingo' },
      ]}
    >
      <AnimatePresence mode="wait">
        {/* ── HUB ── */}
        {view === 'hub' && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 pt-2 max-w-2xl mx-auto"
          >
            {loadingData ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3">
                  <StatCard icon={<Star className="h-5 w-5" />} label="XP" value={stats.xp} />
                  <StatCard icon={<Flame className="h-5 w-5" />} label="Streak" value={stats.streak} sub="өдөр" />
                  <StatCard
                    icon={<BookOpen className="h-5 w-5" />}
                    label="Сурсан"
                    value={learnedCount(stats.currentLevel, stats.progress)}
                    sub={`/ ${getWordsByLevel(stats.currentLevel).length}`}
                  />
                  <StatCard icon={<Trophy className="h-5 w-5" />} label="Түвшин" value={stats.currentLevel} />
                </div>

                {/* Level progress bar */}
                <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">{LEVEL_LABELS[stats.currentLevel]} — {stats.currentLevel}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {learnedCount(stats.currentLevel, stats.progress)} / {getWordsByLevel(stats.currentLevel).length} үг
                    </span>
                  </div>
                  <Progress
                    value={(learnedCount(stats.currentLevel, stats.progress) / getWordsByLevel(stats.currentLevel).length) * 100}
                    className="h-2"
                  />
                </div>

                {/* Level selector */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">Түвшин сонгох</p>
                  <div className="grid grid-cols-5 gap-2">
                    {LEVELS.map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => changeLevel(lvl)}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-xl py-3 px-2 text-xs font-semibold transition-all duration-200 border',
                          stats.currentLevel === lvl
                            ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_16px_hsl(var(--primary)/0.4)]'
                            : 'bg-card/50 text-muted-foreground border-border/40 hover:border-primary/40 hover:text-primary'
                        )}
                      >
                        <span className="text-base font-black">{lvl}</span>
                        <span className="opacity-70 text-[10px] leading-tight text-center">{LEVEL_LABELS[lvl]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start button */}
                <Button
                  onClick={startQuiz}
                  size="lg"
                  className="w-full h-14 text-base font-bold bg-primary text-primary-foreground border-0 shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] transition-shadow duration-300 gap-3"
                >
                  <Zap className="h-5 w-5" />
                  Хичээл эхлэх
                  <ChevronRight className="h-5 w-5" />
                </Button>

                {/* Word counts per level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LEVELS.map(lvl => {
                    const total = getWordsByLevel(lvl).length;
                    const learned = learnedCount(lvl, stats.progress);
                    const pct = total ? Math.round((learned / total) * 100) : 0;
                    return (
                      <div key={lvl} className="flex items-center gap-3 rounded-xl bg-card/40 border border-border/30 p-3">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white bg-linear-to-br shrink-0', LEVEL_COLORS[lvl])}>
                          {lvl}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-foreground">{LEVEL_LABELS[lvl]}</span>
                            <span className="text-[10px] text-muted-foreground">{learned}/{total}</span>
                          </div>
                          <Progress value={pct} className="h-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ── QUIZ ── */}
        {view === 'quiz' && questions[qIdx] && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="max-w-xl mx-auto pt-2 space-y-5"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <HeartRow hearts={hearts} />
              <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                <Zap className="h-4 w-4" />
                {xpEarned} XP
              </div>
            </div>

            {/* Progress bar */}
            <Progress value={((qIdx) / questions.length) * 100} className="h-1.5" />
            <p className="text-xs text-center text-muted-foreground">{qIdx + 1} / {questions.length}</p>

            {/* Word card */}
            <motion.div
              key={qIdx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-card/70 backdrop-blur-xl border border-border/40 p-8 text-center space-y-3"
            >
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {questions[qIdx].word.level} · Монгол утгыг сонгоно уу
              </p>
              <h2 className="text-4xl font-black tracking-tight text-foreground">
                {questions[qIdx].word.word}
              </h2>
              <p className="text-sm text-muted-foreground italic">
                "{questions[qIdx].word.example}"
              </p>
            </motion.div>

            {/* Choices */}
            <div className="grid grid-cols-1 gap-3">
              {questions[qIdx].choices.map((choice, i) => {
                const isSelected = selected === choice;
                const isCorrect = choice === questions[qIdx].correct;
                let state: 'idle' | 'correct' | 'wrong' | 'reveal' = 'idle';
                if (showFeedback) {
                  if (isSelected && isCorrect) state = 'correct';
                  else if (isSelected && !isCorrect) state = 'wrong';
                  else if (!isSelected && isCorrect) state = 'reveal';
                }

                return (
                  <motion.button
                    key={choice}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => handleAnswer(choice)}
                    disabled={showFeedback}
                    className={cn(
                      'w-full text-left rounded-xl border px-5 py-4 text-sm font-semibold transition-all duration-200',
                      state === 'idle' && 'bg-card/60 border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary',
                      state === 'correct' && 'bg-emerald-500/15 border-emerald-500 text-emerald-500',
                      state === 'wrong' && 'bg-destructive/15 border-destructive text-destructive',
                      state === 'reveal' && 'bg-emerald-500/10 border-emerald-500/60 text-emerald-500/80',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className={cn(
                        'w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0',
                        state === 'idle' && 'bg-muted text-muted-foreground',
                        state === 'correct' && 'bg-emerald-500 text-white',
                        state === 'wrong' && 'bg-destructive text-white',
                        state === 'reveal' && 'bg-emerald-500/60 text-white',
                      )}>
                        {state === 'correct' ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                         state === 'wrong'   ? <XCircle      className="h-3.5 w-3.5" /> :
                         ['A','B','C','D'][i]}
                      </span>
                      {choice}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback banner */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2',
                    selected === questions[qIdx].correct
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-destructive/15 text-destructive'
                  )}
                >
                  {selected === questions[qIdx].correct
                    ? <><CheckCircle2 className="h-4 w-4" /> Зөв! +{XP_CORRECT} XP</>
                    : <><XCircle className="h-4 w-4" /> Буруу. Зөв хариулт: <strong>{questions[qIdx].correct}</strong></>
                  }
                </motion.div>
              )}
            </AnimatePresence>

            {saving && (
              <div className="flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {view === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto pt-2 space-y-6 text-center"
          >
            {/* Trophy */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex justify-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                {sessionCorrect.filter(Boolean).length === sessionCorrect.length
                  ? <Trophy className="h-12 w-12 text-primary" />
                  : <Award className="h-12 w-12 text-primary" />
                }
              </div>
            </motion.div>

            <div>
              <h2 className="text-2xl font-black text-foreground">
                {sessionCorrect.filter(Boolean).length === sessionCorrect.length
                  ? '🎉 Гайхалтай! Бүгдийг зөв!'
                  : `${sessionCorrect.filter(Boolean).length} / ${sessionCorrect.length} зөв`}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">Хичээл дууслаа</p>
            </div>

            {/* Result stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-card/60 border border-border/40 p-4 space-y-1">
                <Zap className="h-5 w-5 text-primary mx-auto" />
                <p className="text-2xl font-black text-primary">+{xpEarned}</p>
                <p className="text-xs text-muted-foreground">XP олов</p>
              </div>
              <div className="rounded-2xl bg-card/60 border border-border/40 p-4 space-y-1">
                <Heart className="h-5 w-5 text-rose-500 mx-auto" />
                <p className="text-2xl font-black">{hearts}</p>
                <p className="text-xs text-muted-foreground">Зүрх үлдсэн</p>
              </div>
              <div className="rounded-2xl bg-card/60 border border-border/40 p-4 space-y-1">
                <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto" />
                <p className="text-2xl font-black">{stats.streak}</p>
                <p className="text-xs text-muted-foreground">Хоногийн streak</p>
              </div>
            </div>

            {/* Answer breakdown */}
            <div className="rounded-2xl bg-card/60 border border-border/40 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 text-left">Дэлгэрэнгүй</p>
              <div className="space-y-1.5 text-left">
                {questions.slice(0, sessionCorrect.length).map((q, i) => (
                  <div key={q.word.id} className="flex items-center gap-2 text-sm">
                    {sessionCorrect[i]
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      : <XCircle      className="h-4 w-4 text-destructive shrink-0" />
                    }
                    <span className="font-semibold">{q.word.word}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-muted-foreground">{q.word.mn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button onClick={startQuiz} className="flex-1 bg-primary text-primary-foreground border-0 gap-2">
                <RotateCcw className="h-4 w-4" />
                Дахин тоглох
              </Button>
              <Button onClick={resetToHub} variant="outline" className="flex-1 gap-2">
                <BookOpen className="h-4 w-4" />
                Буцах
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageShell>
  );
}
