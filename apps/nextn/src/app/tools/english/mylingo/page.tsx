'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Star, Zap, Lock, CheckCircle2, XCircle,
  RotateCcw, BookOpen, Loader2, ChevronLeft, Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFirebase } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import ToolPageShell from '@/components/shared/ToolPageShell';
import { WORDS, LEVEL_LABELS, getDistractors, type MLWord } from '@/lib/mylingo-words';
import { cn } from '@/lib/utils';

// ── Lesson definitions ────────────────────────────────────────────────────────

interface LessonDef {
  id: string;
  title: string;
  emoji: string;
  wordIds: number[];
  section: MLWord['level'];
}

const LESSONS: LessonDef[] = [
  // A1 — 8 lessons
  { id: 'a1_1', title: 'Мэндчилгээ',    emoji: '👋', wordIds: [1,2,3,4,5,6,7,8,9,10],     section: 'A1' },
  { id: 'a1_2', title: 'Гэр бүл',       emoji: '👨‍👩‍👧', wordIds: [11,12,13,14,15,16,17,18,19,20], section: 'A1' },
  { id: 'a1_3', title: 'Тэмдэг нэр',    emoji: '🌟', wordIds: [21,22,23,24,25,26,27,28,29,30], section: 'A1' },
  { id: 'a1_4', title: 'Өнгө & Зүйлс',  emoji: '🎨', wordIds: [31,32,33,34,35,36,37,38,39,40], section: 'A1' },
  { id: 'a1_5', title: 'Амьтан & Ном',  emoji: '🐾', wordIds: [41,42,43,44,45,46,47,48,49,50], section: 'A1' },
  { id: 'a1_6', title: 'Үйл үг I',      emoji: '⚡', wordIds: [51,52,53,54,55,56,57,58,59,60], section: 'A1' },
  { id: 'a1_7', title: 'Үйл үг II',     emoji: '🚀', wordIds: [61,62,63,64,65,66,67,68,69,70], section: 'A1' },
  { id: 'a1_8', title: 'Гэр & Байгаль', emoji: '🌿', wordIds: [71,72,73,74,75,76,77,78,79,80], section: 'A1' },
  // A2 — 7 lessons
  { id: 'a2_1', title: 'Мэдээлэл',      emoji: '💡', wordIds: [101,102,103,104,105,106,107,108,109,110], section: 'A2' },
  { id: 'a2_2', title: 'Үйл явдал',     emoji: '🎯', wordIds: [111,112,113,114,115,116,117,118,119,120], section: 'A2' },
  { id: 'a2_3', title: 'Сэтгэл хөдлөл', emoji: '😊', wordIds: [121,122,123,124,125,126,127,128,129,130], section: 'A2' },
  { id: 'a2_4', title: 'Тодорхойлол',   emoji: '📝', wordIds: [131,132,133,134,135,136,137,138,139,140], section: 'A2' },
  { id: 'a2_5', title: 'Цаг & Зочид',   emoji: '🕐', wordIds: [141,142,143,144,145,146,147,148,149,150], section: 'A2' },
  { id: 'a2_6', title: 'Эрүүл мэнд',    emoji: '🏃', wordIds: [151,152,153,154,155,156,157,158,159,160], section: 'A2' },
  { id: 'a2_7', title: 'Нийгэм',        emoji: '🌍', wordIds: [161,162,163,164,165,166,167,168,169,170], section: 'A2' },
  // B1 — 5 lessons
  { id: 'b1_1', title: 'Хөгжил',        emoji: '📈', wordIds: [201,202,203,204,205,206,207,208,209,210], section: 'B1' },
  { id: 'b1_2', title: 'Нийгэм',        emoji: '🤝', wordIds: [211,212,213,214,215,216,217,218,219,220], section: 'B1' },
  { id: 'b1_3', title: 'Туршлага',      emoji: '🎓', wordIds: [221,222,223,224,225,226,227,228,229,230], section: 'B1' },
  { id: 'b1_4', title: 'Шийдвэр',       emoji: '⚖️', wordIds: [231,232,233,234,235,236,237,238,239,240], section: 'B1' },
  { id: 'b1_5', title: 'Хамтын ажил',   emoji: '🔗', wordIds: [241,242,243,244,245,246,247,248,249,250], section: 'B1' },
  // B2 — 4 lessons
  { id: 'b2_1', title: 'Дасан зохицол', emoji: '🔄', wordIds: [301,302,303,304,305,306,307,308,309,310], section: 'B2' },
  { id: 'b2_2', title: 'Шинжилгээ',     emoji: '🔬', wordIds: [311,312,313,314,315,316,317,318,319,320], section: 'B2' },
  { id: 'b2_3', title: 'Хэлэлцээр',     emoji: '💼', wordIds: [321,322,323,324,325,326,327,328,329,330], section: 'B2' },
  { id: 'b2_4', title: 'Шилжилт',       emoji: '🌊', wordIds: [331,332,333,334,335,336,337,338,339,340], section: 'B2' },
  // C1 — 3 lessons
  { id: 'c1_1', title: 'Хэл судлал',    emoji: '🧠', wordIds: [401,402,403,404,405,406,407,408,409,410], section: 'C1' },
  { id: 'c1_2', title: 'Философи',      emoji: '🔭', wordIds: [411,412,413,414,415,416,417,418,419,420], section: 'C1' },
  { id: 'c1_3', title: 'Ахисан шат',    emoji: '👑', wordIds: [421,422,423,424,425,426,427,428,429,430], section: 'C1' },
];

const SECTION_ORDER: MLWord['level'][] = ['A1', 'A2', 'B1', 'B2', 'C1'];

const SECTION_STYLES: Record<MLWord['level'], { bg: string; ring: string; text: string; glow: string }> = {
  A1: { bg: 'from-emerald-500 to-teal-500',   ring: 'ring-emerald-500',   text: 'text-emerald-500',   glow: 'shadow-[0_0_24px_hsl(142_71%_45%/0.6)]' },
  A2: { bg: 'from-sky-500 to-blue-500',        ring: 'ring-sky-500',        text: 'text-sky-500',        glow: 'shadow-[0_0_24px_hsl(199_89%_48%/0.6)]' },
  B1: { bg: 'from-violet-500 to-purple-500',   ring: 'ring-violet-500',     text: 'text-violet-500',     glow: 'shadow-[0_0_24px_hsl(263_70%_50%/0.6)]' },
  B2: { bg: 'from-orange-500 to-amber-500',    ring: 'ring-orange-500',     text: 'text-orange-500',     glow: 'shadow-[0_0_24px_hsl(25_95%_53%/0.6)]'  },
  C1: { bg: 'from-rose-500 to-pink-500',       ring: 'ring-rose-500',       text: 'text-rose-500',       glow: 'shadow-[0_0_24px_hsl(347_77%_50%/0.6)]' },
};

const ZIGZAG = [-80, -40, 0, 40, 80, 40, 0, -40];

const QUESTIONS_PER_LESSON = 10;
const XP_CORRECT = 10;
const XP_PERFECT_BONUS = 50;

// ── Types ─────────────────────────────────────────────────────────────────────

interface LessonRecord { stars: number }
interface UserData {
  xp: number;
  streak: number;
  lastPlayed: string;
  lessons: Record<string, LessonRecord>;
}

interface QuizQuestion {
  word: MLWord;
  choices: string[];
  correct: string;
}

type View = 'map' | 'quiz' | 'result';

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr() { return new Date().toISOString().slice(0, 10); }

function calcStreak(last: string, cur: number) {
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (last === today) return cur;
  if (last === yesterday) return cur + 1;
  return 1;
}

function isUnlocked(lessonIdx: number, lessons: Record<string, LessonRecord>): boolean {
  if (lessonIdx === 0) return true;
  const prev = LESSONS[lessonIdx - 1];
  return (lessons[prev.id]?.stars ?? 0) >= 1;
}

function starsFromScore(correct: number, total: number): number {
  const pct = correct / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.5) return 1;
  return 0;
}

function buildQuiz(lesson: LessonDef): QuizQuestion[] {
  const wordMap = Object.fromEntries(WORDS.map(w => [w.id, w]));
  const pool = lesson.wordIds.map(id => wordMap[id]).filter(Boolean);
  const selected = pool.sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_LESSON);
  return selected.map(word => {
    const distractors = getDistractors(word, 3);
    const choices = [...distractors, word.mn].sort(() => Math.random() - 0.5);
    return { word, choices, correct: word.mn };
  });
}

// ── StarRow ───────────────────────────────────────────────────────────────────

function StarRow({ stars, size = 'sm' }: { stars: number; size?: 'sm' | 'xs' }) {
  const cls = size === 'xs' ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(n => (
        <Star key={n} className={cn(cls, n <= stars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 fill-muted-foreground/10')} />
      ))}
    </div>
  );
}

// ── LessonNode ────────────────────────────────────────────────────────────────

interface NodeProps {
  lesson: LessonDef;
  index: number;
  stars: number;
  unlocked: boolean;
  isCurrent: boolean;
  onTap: () => void;
}

function LessonNode({ lesson, index, stars, unlocked, isCurrent, onTap }: NodeProps) {
  const style = SECTION_STYLES[lesson.section];
  const completed = stars > 0;
  const xOffset = ZIGZAG[index % ZIGZAG.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="flex flex-col items-center gap-1.5"
      style={{ marginLeft: `calc(50% + ${xOffset}px - 36px` }}
    >
      {/* Pulsing ring for current unlocked lesson */}
      {isCurrent && (
        <motion.div
          className={cn('absolute w-[88px] h-[88px] rounded-full ring-4 opacity-40', style.ring)}
          animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.15, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ marginTop: -6 }}
        />
      )}

      <button
        onClick={unlocked ? onTap : undefined}
        disabled={!unlocked}
        className={cn(
          'relative w-[72px] h-[72px] rounded-full flex items-center justify-center text-2xl transition-all duration-300 border-4',
          unlocked && !completed && `bg-linear-to-br ${style.bg} border-white/20 text-white hover:scale-110 active:scale-95`,
          unlocked && !completed && isCurrent && style.glow,
          completed && `bg-linear-to-br ${style.bg} border-amber-400/60 text-white hover:scale-105 active:scale-95`,
          completed && 'shadow-[0_0_20px_hsl(45_93%_47%/0.4)]',
          !unlocked && 'bg-card/40 border-border/30 text-muted-foreground/40 cursor-not-allowed',
        )}
      >
        {!unlocked ? <Lock className="h-6 w-6" /> : lesson.emoji}

        {/* Completion badge */}
        {completed && (
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
            <CheckCircle2 className="h-3 w-3 text-white" />
          </div>
        )}
      </button>

      <StarRow stars={stars} size="xs" />
      <span className={cn(
        'text-[11px] font-semibold text-center leading-tight max-w-[80px]',
        unlocked ? 'text-foreground/80' : 'text-muted-foreground/40',
      )}>
        {lesson.title}
      </span>
    </motion.div>
  );
}

// ── SectionBanner ─────────────────────────────────────────────────────────────

function SectionBanner({ level }: { level: MLWord['level'] }) {
  const style = SECTION_STYLES[level];
  return (
    <div className={cn(
      'flex items-center justify-between rounded-2xl px-5 py-3 bg-linear-to-r text-white my-2 mx-auto w-full max-w-sm',
      style.bg,
    )}>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-80">{level}</p>
        <p className="text-base font-black">{LEVEL_LABELS[level]}</p>
      </div>
      <div className="text-3xl opacity-80">
        {level === 'A1' ? '🌱' : level === 'A2' ? '🌿' : level === 'B1' ? '🌳' : level === 'B2' ? '🏔️' : '⭐'}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MyLingoPage() {
  const { firestore, user } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({ xp: 0, streak: 0, lastPlayed: '', lessons: {} });

  const [view, setView] = useState<View>('map');
  const [activeLessonIdx, setActiveLessonIdx] = useState<number | null>(null);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState<boolean[]>([]);
  const [xpEarned, setXpEarned] = useState(0);
  const [saving, setSaving] = useState(false);
  const answerLock = useRef(false);

  // ── Load Firebase ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !firestore) { setLoading(false); return; }
    getDoc(doc(firestore, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setUserData({
          xp: d.mylingoXP ?? 0,
          streak: d.mylingoStreak ?? 0,
          lastPlayed: d.mylingoLastPlayed ?? '',
          lessons: d.mylingoLessons ?? {},
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, firestore]);

  // ── Derived: first unlocked+uncompleted lesson ───────────────────────────────
  const currentLessonIdx = LESSONS.findIndex((_, i) => isUnlocked(i, userData.lessons) && (userData.lessons[LESSONS[i].id]?.stars ?? 0) === 0);

  // ── Start lesson ───────────────────────────────────────────────────────────
  const startLesson = useCallback((idx: number) => {
    const qs = buildQuiz(LESSONS[idx]);
    setActiveLessonIdx(idx);
    setQuestions(qs);
    setQIdx(0);
    setSelected(null);
    setShowFeedback(false);
    setSessionCorrect([]);
    setXpEarned(0);
    answerLock.current = false;
    setView('quiz');
  }, []);

  // ── Handle answer ──────────────────────────────────────────────────────────
  const handleAnswer = useCallback((choice: string) => {
    if (answerLock.current || showFeedback || !questions[qIdx]) return;
    answerLock.current = true;

    const isCorrect = choice === questions[qIdx].correct;
    const newCorrect = [...sessionCorrect, isCorrect];
    const newXP = isCorrect ? xpEarned + XP_CORRECT : xpEarned;

    setSelected(choice);
    setShowFeedback(true);
    setSessionCorrect(newCorrect);
    setXpEarned(newXP);

    const isLast = qIdx + 1 >= questions.length;

    setTimeout(() => {
      if (isLast) {
        finishLesson(newCorrect, newXP);
      } else {
        setQIdx(p => p + 1);
        setSelected(null);
        setShowFeedback(false);
        answerLock.current = false;
      }
    }, 1300);
  }, [showFeedback, questions, qIdx, sessionCorrect, xpEarned]); // eslint-disable-line

  const finishLesson = async (correct: boolean[], xp: number) => {
    if (activeLessonIdx === null) return;
    setSaving(true);
    const lesson = LESSONS[activeLessonIdx];
    const correctCount = correct.filter(Boolean).length;
    const newStars = starsFromScore(correctCount, correct.length);
    const prevStars = userData.lessons[lesson.id]?.stars ?? 0;
    const bestStars = Math.max(prevStars, newStars);
    const perfectBonus = correct.every(Boolean) ? XP_PERFECT_BONUS : 0;
    const totalXP = xp + perfectBonus;
    const newStreak = calcStreak(userData.lastPlayed, userData.streak);

    const updatedLessons = { ...userData.lessons, [lesson.id]: { stars: bestStars } };
    const newData: UserData = {
      xp: userData.xp + totalXP,
      streak: newStreak,
      lastPlayed: todayStr(),
      lessons: updatedLessons,
    };
    setUserData(newData);
    setXpEarned(totalXP);

    if (user && firestore) {
      try {
        await updateDoc(doc(firestore, 'users', user.uid), {
          mylingoXP: newData.xp,
          mylingoStreak: newStreak,
          mylingoLastPlayed: todayStr(),
          mylingoLessons: updatedLessons,
        });
      } catch { /* ignore */ }
    }
    setSaving(false);
    setView('result');
  };

  const goToMap = () => { setView('map'); setActiveLessonIdx(null); };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ToolPageShell
      title="MyLingo"
      eyebrow="Vocabulary Map"
      icon={<Zap className="h-8 w-8" />}
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/tools' },
        { label: 'Англи хэл', href: '/tools/english' },
        { label: 'MyLingo' },
      ]}
    >
      <AnimatePresence mode="wait">

        {/* ── MAP ── */}
        {view === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-0 pt-2 max-w-sm mx-auto"
          >
            {/* Sticky stats bar */}
            <div className="sticky top-0 z-20 flex items-center justify-between gap-3 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/40 px-5 py-3 mb-6">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="font-black text-lg text-foreground">{userData.xp.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">XP</span>
                  </div>
                  <div className="h-5 w-px bg-border/50" />
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="font-black text-lg text-foreground">{userData.streak}</span>
                    <span className="text-xs text-muted-foreground">streak</span>
                  </div>
                  <div className="h-5 w-px bg-border/50" />
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <span className="font-black text-lg text-foreground">
                      {Object.values(userData.lessons).filter(l => l.stars > 0).length}
                    </span>
                    <span className="text-xs text-muted-foreground">/{LESSONS.length}</span>
                  </div>
                </>
              )}
            </div>

            {/* Lesson map */}
            {!loading && (
              <div className="relative flex flex-col gap-6 pb-16">
                {SECTION_ORDER.map(section => {
                  const sectionLessons = LESSONS.filter(l => l.section === section);
                  return (
                    <div key={section} className="flex flex-col gap-6">
                      <SectionBanner level={section} />
                      {sectionLessons.map(lesson => {
                        const globalIdx = LESSONS.indexOf(lesson);
                        const stars = userData.lessons[lesson.id]?.stars ?? 0;
                        const unlocked = isUnlocked(globalIdx, userData.lessons);
                        const isCurrent = globalIdx === currentLessonIdx;
                        return (
                          <div key={lesson.id} className="relative flex justify-start" style={{ height: 100 }}>
                            <LessonNode
                              lesson={lesson}
                              index={globalIdx}
                              stars={stars}
                              unlocked={unlocked}
                              isCurrent={isCurrent}
                              onTap={() => startLesson(globalIdx)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── QUIZ ── */}
        {view === 'quiz' && questions[qIdx] && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-xl mx-auto pt-2 space-y-5"
          >
            {/* Quiz header */}
            <div className="flex items-center gap-3">
              <button onClick={goToMap} className="p-2 rounded-xl hover:bg-muted/60 transition-colors">
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <Progress value={(qIdx / questions.length) * 100} className="flex-1 h-2.5" />
              <span className="text-xs text-muted-foreground font-mono shrink-0">{qIdx + 1}/{questions.length}</span>
            </div>

            {/* Lesson title */}
            {activeLessonIdx !== null && (
              <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest px-1">
                {LESSONS[activeLessonIdx].emoji} {LESSONS[activeLessonIdx].title}
              </p>
            )}

            {/* Word card */}
            <motion.div
              key={qIdx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-card/70 backdrop-blur-xl border border-border/40 p-8 text-center space-y-3"
            >
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {questions[qIdx].word.level} · Монгол утгыг сонгоно уу
              </p>
              <h2 className="text-4xl font-black tracking-tight text-foreground">
                {questions[qIdx].word.word}
              </h2>
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{questions[qIdx].word.example}&rdquo;
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
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
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

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2',
                    selected === questions[qIdx].correct
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-destructive/15 text-destructive',
                  )}
                >
                  {selected === questions[qIdx].correct
                    ? <><CheckCircle2 className="h-4 w-4 shrink-0" /> Зөв! +{XP_CORRECT} XP</>
                    : <><XCircle className="h-4 w-4 shrink-0" /> Зөв хариулт: <strong className="ml-1">{questions[qIdx].correct}</strong></>
                  }
                </motion.div>
              )}
            </AnimatePresence>

            {saving && (
              <div className="flex justify-center pt-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {view === 'result' && activeLessonIdx !== null && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto pt-2 space-y-6 text-center"
          >
            {/* Trophy animation */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-5xl">
                {LESSONS[activeLessonIdx].emoji}
              </div>
            </motion.div>

            <div>
              <h2 className="text-2xl font-black text-foreground">
                {sessionCorrect.filter(Boolean).length === sessionCorrect.length ? '🎉 Гайхалтай!' : `${sessionCorrect.filter(Boolean).length}/${sessionCorrect.length} зөв`}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{LESSONS[activeLessonIdx].title} — хичээл дууслаа</p>
            </div>

            {/* Stars earned */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="flex justify-center gap-3"
            >
              {[1, 2, 3].map(n => {
                const earned = starsFromScore(sessionCorrect.filter(Boolean).length, sessionCorrect.length);
                return (
                  <motion.div
                    key={n}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4 + n * 0.12, type: 'spring', stiffness: 300 }}
                  >
                    <Star className={cn(
                      'h-10 w-10 transition-all',
                      n <= earned ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20 fill-muted-foreground/10',
                    )} />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-card/60 border border-border/40 p-4 space-y-1">
                <Zap className="h-5 w-5 text-primary mx-auto" />
                <p className="text-2xl font-black text-primary">+{xpEarned}</p>
                <p className="text-xs text-muted-foreground">XP олов</p>
              </div>
              <div className="rounded-2xl bg-card/60 border border-border/40 p-4 space-y-1">
                <Trophy className="h-5 w-5 text-amber-400 mx-auto" />
                <p className="text-2xl font-black">{sessionCorrect.filter(Boolean).length}</p>
                <p className="text-xs text-muted-foreground">Зөв хариулт</p>
              </div>
              <div className="rounded-2xl bg-card/60 border border-border/40 p-4 space-y-1">
                <Flame className="h-5 w-5 text-orange-500 mx-auto" />
                <p className="text-2xl font-black">{userData.streak}</p>
                <p className="text-xs text-muted-foreground">Streak</p>
              </div>
            </div>

            {/* Answer breakdown */}
            <div className="rounded-2xl bg-card/60 border border-border/40 p-4 text-left space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Дэлгэрэнгүй</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {questions.slice(0, sessionCorrect.length).map((q, i) => (
                  <div key={q.word.id} className="flex items-center gap-2 text-sm">
                    {sessionCorrect[i]
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      : <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    }
                    <span className="font-semibold">{q.word.word}</span>
                    <span className="text-muted-foreground">→ {q.word.mn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button onClick={() => startLesson(activeLessonIdx)} className="flex-1 bg-primary text-primary-foreground border-0 gap-2">
                <RotateCcw className="h-4 w-4" />
                Дахин
              </Button>
              <Button onClick={goToMap} variant="outline" className="flex-1 gap-2">
                <BookOpen className="h-4 w-4" />
                Газрын зураг
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </ToolPageShell>
  );
}
