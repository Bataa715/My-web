'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Star, Zap, Lock, CheckCircle2, XCircle,
  RotateCcw, BookOpen, Loader2, ChevronLeft, Trophy, ChevronRight, Lightbulb,
  Send, ArrowLeftRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSupabase } from '@/supabase';
import { doc, getDoc, updateDoc } from '@/supabase/db';
import ToolPageShell from '@/features/tools/ToolPageShell';
import { WORDS, LEVEL_LABELS, getDistractors, type MLWord } from '@/features/language/data/mylingo-words';
import {
  GRAMMAR_LESSONS, GRAMMAR_SECTION_LABELS, GRAMMAR_SECTION_ORDER,
  type GrammarSectionId,
} from '@/features/language/data/mylingo-grammar';
import { cn } from '@/lib/utils';

// ── Lesson definitions ────────────────────────────────────────────────────────

interface VocabLesson {
  kind: 'vocab';
  id: string; title: string; emoji: string;
  wordIds: number[];
  section: MLWord['level'];
}
interface GrammarLessonRef {
  kind: 'grammar';
  id: string; title: string; emoji: string;
  gs: GrammarSectionId;
}
type LessonEntry = VocabLesson | GrammarLessonRef;

const VOCAB_LESSONS: VocabLesson[] = [
  { kind:'vocab', id:'a1_1', title:'Мэндчилгээ',    emoji:'👋', section:'A1', wordIds:[1,2,3,4,5,6,7,8,9,10] },
  { kind:'vocab', id:'a1_2', title:'Гэр бүл & Цаг',  emoji:'👨‍👩‍👧', section:'A1', wordIds:[11,12,13,14,15,16,17,18,19,20] },
  { kind:'vocab', id:'a1_3', title:'Тэмдэг нэр',    emoji:'🌟', section:'A1', wordIds:[21,22,23,24,25,26,27,28,29,30] },
  { kind:'vocab', id:'a1_4', title:'Өнгө & Зүйлс',  emoji:'🎨', section:'A1', wordIds:[31,32,33,34,35,36,37,38,39,40] },
  { kind:'vocab', id:'a1_5', title:'Үйл үг I',      emoji:'⚡', section:'A1', wordIds:[41,42,43,44,45,46,47,48,49,50] },
  { kind:'vocab', id:'a1_6', title:'Үйл үг II',     emoji:'🚀', section:'A1', wordIds:[51,52,53,54,55,56,57,58,59,60] },
  { kind:'vocab', id:'a1_7', title:'Байр & Зүйлс',  emoji:'🏙️', section:'A1', wordIds:[61,62,63,64,65,66,67,68,69,70] },
  { kind:'vocab', id:'a1_8', title:'Хүн & Амьдрал', emoji:'👥', section:'A1', wordIds:[71,72,73,74,75,76,77,78,79,80] },
  { kind:'vocab', id:'a2_1', title:'Мэдээлэл',      emoji:'💡', section:'A2', wordIds:[101,102,103,104,105,106,107,108,109,110] },
  { kind:'vocab', id:'a2_2', title:'Үйл явдал',     emoji:'🎯', section:'A2', wordIds:[111,112,113,114,115,116,117,118,119,120] },
  { kind:'vocab', id:'a2_3', title:'Сэтгэл хөдлөл', emoji:'😊', section:'A2', wordIds:[121,122,123,124,125,126,127,128,129,130] },
  { kind:'vocab', id:'a2_4', title:'Тодорхойлол',   emoji:'📝', section:'A2', wordIds:[131,132,133,134,135,136,137,138,139,140] },
  { kind:'vocab', id:'a2_5', title:'Цаг & Зочид',   emoji:'🕐', section:'A2', wordIds:[141,142,143,144,145,146,147,148,149,150] },
  { kind:'vocab', id:'a2_6', title:'Эрүүл мэнд',    emoji:'🏃', section:'A2', wordIds:[151,152,153,154,155,156,157,158,159,160] },
  { kind:'vocab', id:'a2_7', title:'Нийгэм',        emoji:'🌍', section:'A2', wordIds:[161,162,163,164,165,166,167,168,169,170] },
  { kind:'vocab', id:'b1_1', title:'Хөгжил',        emoji:'📈', section:'B1', wordIds:[201,202,203,204,205,206,207,208,209,210] },
  { kind:'vocab', id:'b1_2', title:'Нийгэм',        emoji:'🤝', section:'B1', wordIds:[211,212,213,214,215,216,217,218,219,220] },
  { kind:'vocab', id:'b1_3', title:'Туршлага',      emoji:'🎓', section:'B1', wordIds:[221,222,223,224,225,226,227,228,229,230] },
  { kind:'vocab', id:'b1_4', title:'Шийдвэр',       emoji:'⚖️', section:'B1', wordIds:[231,232,233,234,235,236,237,238,239,240] },
  { kind:'vocab', id:'b1_5', title:'Хамтын ажил',   emoji:'🔗', section:'B1', wordIds:[241,242,243,244,245,246,247,248,249,250] },
  { kind:'vocab', id:'b2_1', title:'Дасан зохицол', emoji:'🔄', section:'B2', wordIds:[301,302,303,304,305,306,307,308,309,310] },
  { kind:'vocab', id:'b2_2', title:'Шинжилгээ',     emoji:'🔬', section:'B2', wordIds:[311,312,313,314,315,316,317,318,319,320] },
  { kind:'vocab', id:'b2_3', title:'Хэлэлцээр',     emoji:'💼', section:'B2', wordIds:[321,322,323,324,325,326,327,328,329,330] },
  { kind:'vocab', id:'b2_4', title:'Шилжилт',       emoji:'🌊', section:'B2', wordIds:[331,332,333,334,335,336,337,338,339,340] },
  { kind:'vocab', id:'c1_1', title:'Хэл судлал',    emoji:'🧠', section:'C1', wordIds:[401,402,403,404,405,406,407,408,409,410] },
  { kind:'vocab', id:'c1_2', title:'Философи',      emoji:'🔭', section:'C1', wordIds:[411,412,413,414,415,416,417,418,419,420] },
  { kind:'vocab', id:'c1_3', title:'Ахисан шат',    emoji:'👑', section:'C1', wordIds:[421,422,423,424,425,426,427,428,429,430] },
];

const GRAMMAR_LESSON_REFS: GrammarLessonRef[] = GRAMMAR_LESSONS.map(l => ({
  kind: 'grammar', id: l.id, title: l.title, emoji: l.emoji, gs: l.gs,
}));

const VOCAB_SECTION_ORDER: MLWord['level'][] = ['A1', 'A2', 'B1', 'B2', 'C1'];

// ── Styles ────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

type QuizQuestion =
  | { type: 'vocab';           word: MLWord; choices: string[]; correct: string }
  | { type: 'vocab_reverse';   word: MLWord; choices: string[]; correct: string }
  | { type: 'typing';          word: MLWord; answer: string }
  | { type: 'sentence_build';  word: MLWord; words: string[]; correct: string }
  | { type: 'grammar';         sentence: string; choices: string[]; correct: string; explain: string }
  | { type: 'grammar_typing';  sentence: string; answer: string; explain: string }
  | { type: 'grammar_build';   words: string[]; correct: string; explain: string };

interface LessonRecord { stars: number }
interface UserData { xp: number; streak: number; lastPlayed: string; lessons: Record<string, LessonRecord> }

type MapTab = 'vocab' | 'grammar';
type View = 'map' | 'lesson' | 'quiz' | 'result';

const XP_CORRECT = 10;
const XP_PERFECT_BONUS = 50;

function normalizeAnswer(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

function getCorrectAnswer(q: QuizQuestion): string {
  if (q.type === 'typing') return q.answer;
  if (q.type === 'grammar_typing') return q.answer;
  if (q.type === 'grammar_build') return q.correct;
  return q.correct;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr() { return new Date().toISOString().slice(0, 10); }

function calcStreak(last: string, cur: number) {
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (last === today) return cur;
  if (last === yesterday) return cur + 1;
  return 1;
}

function isVocabUnlocked(idx: number, lessons: Record<string, LessonRecord>) {
  if (idx === 0) return true;
  return (lessons[VOCAB_LESSONS[idx - 1].id]?.stars ?? 0) >= 1;
}

function isGrammarUnlocked(idx: number, lessons: Record<string, LessonRecord>) {
  if (idx === 0) return true;
  return (lessons[GRAMMAR_LESSON_REFS[idx - 1].id]?.stars ?? 0) >= 1;
}

function starsFromScore(correct: number, total: number) {
  const p = correct / total;
  if (p >= 0.9) return 3;
  if (p >= 0.7) return 2;
  if (p >= 0.5) return 1;
  return 0;
}

function buildVocabQuiz(lesson: VocabLesson): QuizQuestion[] {
  const wordMap = Object.fromEntries(WORDS.map(w => [w.id, w]));
  const pool = lesson.wordIds.map(id => wordMap[id]).filter(Boolean);
  const rand = () => Math.random() - 0.5;
  const qs: QuizQuestion[] = [];

  // 10 standard vocab: show English → choose Mongolian
  for (const word of [...pool].sort(rand)) {
    const choices = [...getDistractors(word, 3), word.mn].sort(rand);
    qs.push({ type: 'vocab', word, choices, correct: word.mn });
  }

  // 5 reverse vocab: show Mongolian → choose English
  for (const word of [...pool].sort(rand).slice(0, 5)) {
    const others = pool.filter(w => w.id !== word.id).sort(rand).slice(0, 3);
    const choices = [...others.map(w => w.word), word.word].sort(rand);
    qs.push({ type: 'vocab_reverse', word, choices, correct: word.word });
  }

  // 3 typing: show Mongolian → type English
  for (const word of [...pool].sort(rand).slice(0, 3)) {
    qs.push({ type: 'typing', word, answer: word.word });
  }

  // 2 sentence build: arrange scrambled example sentence
  for (const word of [...pool].sort(rand).slice(0, 2)) {
    const words = word.example.split(' ').sort(rand);
    qs.push({ type: 'sentence_build', word, words, correct: word.example });
  }

  return qs.sort(rand);
}

function buildGrammarQuiz(ref: GrammarLessonRef): QuizQuestion[] {
  const full = GRAMMAR_LESSONS.find(l => l.id === ref.id);
  if (!full) return [];
  const rand = () => Math.random() - 0.5;
  const allQ = [...full.q].sort(rand);
  const qs: QuizQuestion[] = [];

  // Up to 10 standard grammar MC
  for (const q of allQ.slice(0, 10)) {
    qs.push({ type: 'grammar', sentence: q.s, choices: [...q.c].sort(rand), correct: q.a, explain: q.e });
  }

  // Up to 5 grammar typing: show sentence with blank → type the answer
  for (const q of [...allQ].sort(rand).slice(0, Math.min(5, allQ.length))) {
    qs.push({ type: 'grammar_typing', sentence: q.s, answer: q.a, explain: q.e });
  }

  // Up to 5 grammar sentence build: arrange the complete sentence
  for (const q of [...allQ].sort(rand).slice(0, Math.min(5, allQ.length))) {
    const fullSentence = q.s.replace('___', q.a);
    const words = fullSentence.split(' ').sort(rand);
    qs.push({ type: 'grammar_build', words, correct: fullSentence, explain: q.e });
  }

  return qs.sort(rand);
}

// ── QuestionTypeBadge ─────────────────────────────────────────────────────────

const Q_TYPE_META: Record<QuizQuestion['type'], { icon: string; label: string; cls: string }> = {
  vocab:          { icon: '🎯', label: 'Монгол утга',      cls: 'bg-emerald-500/12 text-emerald-500 border-emerald-500/25' },
  vocab_reverse:  { icon: '🔄', label: 'Англи үг',         cls: 'bg-sky-500/12 text-sky-500 border-sky-500/25' },
  typing:         { icon: '✏️', label: 'Бичих',             cls: 'bg-violet-500/12 text-violet-500 border-violet-500/25' },
  sentence_build: { icon: '🔀', label: 'Өгүүлбэр үүсгэх', cls: 'bg-orange-500/12 text-orange-500 border-orange-500/25' },
  grammar:        { icon: '📖', label: 'Дүрэм — сонгох',   cls: 'bg-yellow-500/12 text-yellow-500 border-yellow-500/25' },
  grammar_typing: { icon: '✏️', label: 'Дүрэм — бичих',    cls: 'bg-rose-500/12 text-rose-500 border-rose-500/25' },
  grammar_build:  { icon: '🔀', label: 'Дүрэм — үүсгэх',   cls: 'bg-teal-500/12 text-teal-500 border-teal-500/25' },
};

function QuestionTypeBadge({ q }: { q: QuizQuestion }) {
  const m = Q_TYPE_META[q.type];
  return (
    <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold', m.cls)}>
      <span>{m.icon}</span><span>{m.label}</span>
    </div>
  );
}

// ── TypingAnswer ──────────────────────────────────────────────────────────────

function TypingAnswer({ questionType, onSubmit, disabled, isCorrect }: {
  questionType: 'typing' | 'grammar_typing';
  onSubmit: (v: string) => void;
  disabled: boolean;
  isCorrect?: boolean;
}) {
  const [input, setInput] = useState('');
  const handleSubmit = () => { const v = input.trim(); if (v && !disabled) onSubmit(v); };
  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          disabled={disabled}
          placeholder={questionType === 'typing' ? 'Англи үгийг бич...' : 'Зөв хэлбэрийг бич...'}
          className={cn(
            'w-full rounded-xl border px-4 py-3.5 pr-12 sm:px-5 sm:py-4 sm:pr-14 text-sm font-semibold transition-all duration-200 focus:outline-none',
            !disabled && 'bg-card/60 border-border/40 focus:border-primary/50 focus:bg-primary/5',
            disabled && isCorrect === true  && 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400',
            disabled && isCorrect === false && 'bg-destructive/10 border-destructive text-destructive',
            disabled && isCorrect === undefined && 'bg-muted/20 border-border/30 text-muted-foreground',
          )}
          autoFocus
        />
        {disabled && isCorrect !== undefined ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isCorrect
              ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              : <XCircle className="h-4 w-4 text-destructive" />}
          </div>
        ) : !disabled ? (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 hover:bg-primary/80 transition-all"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      {!disabled && (
        <p className="text-xs text-center text-muted-foreground">Enter товч дарж илгээнэ үү</p>
      )}
    </div>
  );
}

// ── SentenceBuildAnswer ───────────────────────────────────────────────────────

function SentenceBuildAnswer({ initialWords, onSubmit, disabled, isCorrect, correctSentence }: {
  initialWords: string[];
  onSubmit: (v: string) => void;
  disabled: boolean;
  isCorrect?: boolean;
  correctSentence?: string;
}) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([...initialWords]);

  const addWord = (idx: number) => {
    if (disabled) return;
    setChosen(p => [...p, available[idx]]);
    setAvailable(p => p.filter((_, i) => i !== idx));
  };
  const removeWord = (idx: number) => {
    if (disabled) return;
    setAvailable(p => [...p, chosen[idx]]);
    setChosen(p => p.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className={cn(
        'min-h-[48px] sm:min-h-[56px] flex flex-wrap gap-2 rounded-xl border-2 border-dashed p-3 transition-colors duration-300',
        disabled && isCorrect === true  ? 'border-emerald-500/60 bg-emerald-500/5' :
        disabled && isCorrect === false ? 'border-destructive/40 bg-destructive/5' :
        'border-primary/30 bg-primary/5',
      )}>
        {chosen.length === 0
          ? <p className="text-xs text-muted-foreground self-center">Үгүүдийг дарж өгүүлбэр үүсгэнэ үү...</p>
          : chosen.map((w, i) => (
              <motion.button
                key={`c-${i}`}
                initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                onClick={() => removeWord(i)} disabled={disabled}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:cursor-default',
                  disabled && isCorrect === true  ? 'bg-emerald-500 text-white' :
                  disabled && isCorrect === false ? 'bg-destructive/80 text-white' :
                  'bg-primary text-primary-foreground hover:bg-primary/80',
                )}
              >{w}</motion.button>
            ))
        }
      </div>
      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {available.map((w, i) => (
          <motion.button
            key={`a-${i}-${w}`}
            initial={{ scale: 0.85 }} animate={{ scale: 1 }}
            onClick={() => addWord(i)} disabled={disabled}
            className="px-3 py-1.5 rounded-lg bg-card border border-border/50 text-sm font-semibold hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50 disabled:cursor-default"
          >{w}</motion.button>
        ))}
      </div>
      <Button
        onClick={() => onSubmit(chosen.join(' '))}
        disabled={disabled || chosen.length === 0}
        className="h-11 w-full rounded-none border-0 bg-[#c41212] text-sm font-bold text-white hover:bg-[#c41212]/90 sm:h-12"
      >
        Шалгах
      </Button>
      {disabled && isCorrect === false && correctSentence && (
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-2.5"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{correctSentence}</span>
        </motion.div>
      )}
    </div>
  );
}

// ── LessonView ────────────────────────────────────────────────────────────────

function LessonView({ entry, onStart, onBack }: { entry: GrammarLessonRef; onStart: () => void; onBack: () => void }) {
  const full = GRAMMAR_LESSONS.find(l => l.id === entry.id);
  if (!full) return null;
  const { content } = full;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="mx-auto max-w-2xl space-y-8 pb-10 pt-2 text-[#111]"
    >
      <div className="flex items-center gap-3 border-b border-[#111] pb-4">
        <button onClick={onBack} className="shrink-0 p-2">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">Хичээл</p>
          <h2 className="text-xl leading-tight">{entry.title}</h2>
        </div>
      </div>

      <p className="text-sm font-medium">{full.rule}</p>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">Тайлбар</p>
        <p className="text-sm leading-relaxed text-[#111]/70">{content.explanation}</p>
      </div>

      {content.table && (
        <div className="overflow-hidden border-t border-[#111]">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[320px]">
            <thead>
              <tr className="border-b border-[#111] text-[#111]">
                {content.table.headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wider opacity-90">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.table.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-muted/20' : ''}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={cn('px-4 py-2.5 text-xs leading-snug', ci === 0 ? 'font-semibold text-foreground/80' : ci === 1 ? 'font-black text-foreground font-mono' : 'text-muted-foreground')}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">Жишээнүүд</p>
        <div className="space-y-3">
          {content.examples.map((ex, i) => (
            <div key={i} className="border-l-2 border-primary/30 pl-3 space-y-0.5">
              <p className="text-sm font-semibold text-foreground">{ex.en}</p>
              <p className="text-xs text-muted-foreground">{ex.mn}</p>
            </div>
          ))}
        </div>
      </div>

      {content.tips && content.tips.length > 0 && (
        <div className="space-y-2 border-t border-[#111] pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">Санамж</p>
          <ul className="space-y-1.5">
            {content.tips.map((tip, i) => (
              <li key={i} className="text-sm text-foreground/80 flex gap-2">
                <span className="text-amber-400 shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={onStart} className="h-12 w-full gap-2 rounded-none border-0 bg-[#c41212] text-white hover:bg-[#c41212]/90">
        <ChevronRight className="h-5 w-5" />
        Тест эхлэх
      </Button>
    </motion.div>
  );
}

// ── StarRow ───────────────────────────────────────────────────────────────────

function StarRow({ stars, size = 'xs' }: { stars: number; size?: 'xs' | 'sm' }) {
  const cls = size === 'xs' ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <div className="flex gap-0.5">
      {[1,2,3].map(n => (
        <Star key={n} className={cn(cls, n <= stars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 fill-muted-foreground/10')} />
      ))}
    </div>
  );
}

// ── LessonNode ────────────────────────────────────────────────────────────────

interface NodeProps {
  entry: LessonEntry;
  localIdx: number;
  stars: number;
  unlocked: boolean;
  isCurrent: boolean;
  onTap: () => void;
}

function LessonNode({ entry, localIdx, stars, unlocked, isCurrent, onTap }: NodeProps) {
  const completed = stars > 0;
  void localIdx;

  return (
    <button
      onClick={unlocked ? onTap : undefined}
      disabled={!unlocked}
      className={cn(
        'group flex w-full items-center gap-4 border-b border-[#111]/15 py-5 text-left sm:gap-8',
        !unlocked && 'cursor-not-allowed opacity-35',
        isCurrent && 'bg-[#c41212]/5'
      )}
    >
      <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
        {entry.kind === 'grammar' ? 'Rule' : 'Word'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg">{entry.title}</span>
        <span className="mt-1 block">
          <StarRow stars={stars} />
        </span>
      </span>
      {!unlocked ? (
        <Lock className="h-4 w-4 shrink-0 text-[#111]/30" />
      ) : completed ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#c41212]" />
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
      )}
    </button>
  );
}

// ── SectionBanner ─────────────────────────────────────────────────────────────

function VocabBanner({ level }: { level: MLWord['level'] }) {
  return (
    <p className="border-b border-[#111] pb-3 pt-10 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
      {level} · {LEVEL_LABELS[level]}
    </p>
  );
}

function GrammarBanner({ section }: { section: GrammarSectionId }) {
  return (
    <p className="border-b border-[#111] pb-3 pt-10 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
      {GRAMMAR_SECTION_LABELS[section]}
    </p>
  );
}

// ── ChoiceButton ──────────────────────────────────────────────────────────────

function ChoiceButton({
  choice, index, state, onClick, disabled,
}: {
  choice: string; index: number;
  state: 'idle' | 'correct' | 'wrong' | 'reveal';
  onClick: () => void; disabled: boolean;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left rounded-xl border px-4 py-3 sm:px-5 sm:py-4 text-sm font-semibold transition-all duration-200',
        state === 'idle'    && 'bg-card/60 border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary',
        state === 'correct' && 'bg-emerald-500/15 border-emerald-500 text-emerald-500',
        state === 'wrong'   && 'bg-destructive/15 border-destructive text-destructive',
        state === 'reveal'  && 'bg-emerald-500/10 border-emerald-500/60 text-emerald-500/80',
      )}
    >
      <span className="flex items-center gap-3">
        <span className={cn(
          'w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0',
          state === 'idle'    && 'bg-muted text-muted-foreground',
          state === 'correct' && 'bg-emerald-500 text-white',
          state === 'wrong'   && 'bg-destructive text-white',
          state === 'reveal'  && 'bg-emerald-500/60 text-white',
        )}>
          {state === 'correct' ? <CheckCircle2 className="h-3.5 w-3.5" /> :
           state === 'wrong'   ? <XCircle      className="h-3.5 w-3.5" /> :
           ['A','B','C','D'][index]}
        </span>
        {choice}
      </span>
    </motion.button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MyLingoPage() {
  const { firestore, user } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({ xp: 0, streak: 0, lastPlayed: '', lessons: {} });

  const [view, setView] = useState<View>('map');
  const [mapTab, setMapTab] = useState<MapTab>('vocab');
  const [activeEntry, setActiveEntry] = useState<LessonEntry | null>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState<boolean[]>([]);
  const [xpEarned, setXpEarned] = useState(0);
  const [saving, setSaving] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showXpPop, setShowXpPop] = useState(false);
  const lock = useRef(false);
  const quizTopRef = useRef<HTMLDivElement>(null);

  // Scroll to top of quiz card on every question change
  useEffect(() => {
    quizTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [qIdx]);

  useEffect(() => {
    if (!user || !firestore) { setLoading(false); return; }
    getDoc(doc(firestore, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setUserData({ xp: d.mylingoXP ?? 0, streak: d.mylingoStreak ?? 0, lastPlayed: d.mylingoLastPlayed ?? '', lessons: d.mylingoLessons ?? {} });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, firestore]);

  const vocabCurrentIdx = VOCAB_LESSONS.findIndex((_, i) => isVocabUnlocked(i, userData.lessons) && (userData.lessons[VOCAB_LESSONS[i].id]?.stars ?? 0) === 0);
  const grammarCurrentIdx = GRAMMAR_LESSON_REFS.findIndex((_, i) => isGrammarUnlocked(i, userData.lessons) && (userData.lessons[GRAMMAR_LESSON_REFS[i].id]?.stars ?? 0) === 0);

  const startLesson = useCallback((entry: LessonEntry, idx: number) => {
    setActiveEntry(entry);
    void idx; // unused, kept for API compatibility
    setQIdx(0); setSelected(null); setShowFeedback(false); setSessionCorrect([]); setXpEarned(0); setCombo(0);
    lock.current = false;
    if (entry.kind === 'grammar') {
      setView('lesson');
    } else {
      setQuestions(buildVocabQuiz(entry));
      setView('quiz');
    }
  }, []);

  const goToQuiz = useCallback(() => {
    if (!activeEntry) return;
    const qs = activeEntry.kind === 'vocab' ? buildVocabQuiz(activeEntry) : buildGrammarQuiz(activeEntry as GrammarLessonRef);
    setQuestions(qs);
    setQIdx(0); setSelected(null); setShowFeedback(false); setSessionCorrect([]); setXpEarned(0); setCombo(0);
    lock.current = false;
    setView('quiz');
  }, [activeEntry]);

  const handleAnswer = useCallback((choice: string) => {
    if (lock.current || showFeedback || !questions[qIdx]) return;
    lock.current = true;
    const isCorrect = normalizeAnswer(choice) === normalizeAnswer(getCorrectAnswer(questions[qIdx]));
    const newCorrect = [...sessionCorrect, isCorrect];
    const newCombo = isCorrect ? combo + 1 : 0;
    const comboBonus = isCorrect && newCombo >= 3 ? 5 : isCorrect && newCombo >= 2 ? 2 : 0;
    const newXP = isCorrect ? xpEarned + XP_CORRECT + comboBonus : xpEarned;
    if (isCorrect) { setShowXpPop(true); setTimeout(() => setShowXpPop(false), 900); }
    setSelected(choice); setShowFeedback(true); setSessionCorrect(newCorrect); setXpEarned(newXP); setCombo(newCombo);
    setTimeout(() => {
      if (qIdx + 1 >= questions.length) {
        finishLesson(newCorrect, newXP);
      } else {
        setQIdx(p => p + 1); setSelected(null); setShowFeedback(false);
        lock.current = false;
      }
    }, isCorrect ? 1100 : 1900);
  }, [showFeedback, questions, qIdx, sessionCorrect, xpEarned, combo]); // eslint-disable-line

  const finishLesson = async (correct: boolean[], xp: number) => {
    if (!activeEntry) return;
    setSaving(true);
    const correctCount = correct.filter(Boolean).length;
    const newStars = starsFromScore(correctCount, correct.length);
    const bestStars = Math.max(userData.lessons[activeEntry.id]?.stars ?? 0, newStars);
    const totalXP = xp + (correct.every(Boolean) ? XP_PERFECT_BONUS : 0);
    const newStreak = calcStreak(userData.lastPlayed, userData.streak);
    const updatedLessons = { ...userData.lessons, [activeEntry.id]: { stars: bestStars } };
    const newData: UserData = { xp: userData.xp + totalXP, streak: newStreak, lastPlayed: todayStr(), lessons: updatedLessons };
    setUserData(newData);
    setXpEarned(totalXP);
    if (user && firestore) {
      try { await updateDoc(doc(firestore, 'users', user.uid), { mylingoXP: newData.xp, mylingoStreak: newStreak, mylingoLastPlayed: todayStr(), mylingoLessons: updatedLessons }); }
      catch { /* ignore */ }
    }
    setSaving(false);
    setView('result');
  };

  const goToMap = () => { setView('map'); setActiveEntry(null); };

  // ── Map section renderers ──────────────────────────────────────────────────

  function renderVocabMap() {
    return (
      <div className="relative flex flex-col gap-6 pb-8">
        {VOCAB_SECTION_ORDER.map(section => {
          const lessons = VOCAB_LESSONS.filter(l => l.section === section);
          return (
            <div key={section} className="flex flex-col gap-0">
              <VocabBanner level={section} />
              {lessons.map((lesson, secIdx) => {
                const globalIdx = VOCAB_LESSONS.indexOf(lesson);
                const stars = userData.lessons[lesson.id]?.stars ?? 0;
                const unlocked = isVocabUnlocked(globalIdx, userData.lessons);
                const isCurrent = globalIdx === vocabCurrentIdx;
                return (
                  <LessonNode
                    key={lesson.id}
                    entry={lesson}
                    localIdx={secIdx}
                    stars={stars}
                    unlocked={unlocked}
                    isCurrent={isCurrent}
                    onTap={() => startLesson(lesson, globalIdx)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  function renderGrammarMap() {
    return (
      <div className="relative flex flex-col gap-6 pb-8">
        {GRAMMAR_SECTION_ORDER.map(section => {
          const refs = GRAMMAR_LESSON_REFS.filter(l => l.gs === section);
          return (
            <div key={section} className="flex flex-col gap-0">
              <GrammarBanner section={section} />
              {refs.map((ref, secIdx) => {
                const globalIdx = GRAMMAR_LESSON_REFS.indexOf(ref);
                const stars = userData.lessons[ref.id]?.stars ?? 0;
                const unlocked = isGrammarUnlocked(globalIdx, userData.lessons);
                const isCurrent = globalIdx === grammarCurrentIdx;
                return (
                  <LessonNode
                    key={ref.id}
                    entry={ref}
                    localIdx={secIdx}
                    stars={stars}
                    unlocked={unlocked}
                    isCurrent={isCurrent}
                    onTap={() => startLesson(ref, globalIdx)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Quiz card ──────────────────────────────────────────────────────────────

  function renderQuizCard(q: QuizQuestion) {
    const cardCls = 'space-y-3 border-y border-[#111] py-8 text-center';
    const anim = { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 } };

    if (q.type === 'vocab') return (
      <motion.div key={qIdx} {...anim} className={cardCls}>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {q.word.level} · Монгол утгыг сонгоно уу
        </p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">{q.word.word}</h2>
        <p className="text-sm text-muted-foreground italic">&ldquo;{q.word.example}&rdquo;</p>
      </motion.div>
    );

    if (q.type === 'vocab_reverse') return (
      <motion.div key={qIdx} {...anim} className={cardCls}>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {q.word.level} · Англи үгийг сонгоно уу
        </p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">{q.word.mn}</h2>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ArrowLeftRight className="h-3 w-3" />
          <span>Англиар ямар вэ?</span>
        </div>
      </motion.div>
    );

    if (q.type === 'typing') return (
      <motion.div key={qIdx} {...anim} className={cardCls}>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {q.word.level} · Англиар бич
        </p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">{q.word.mn}</h2>
        <p className="text-sm text-muted-foreground italic">&ldquo;{q.word.example}&rdquo;</p>
      </motion.div>
    );

    if (q.type === 'sentence_build') return (
      <motion.div key={qIdx} {...anim} className="space-y-2 border-y border-[#111] py-8 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Өгүүлбэр үүсгэх</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xl sm:text-2xl font-black text-foreground">{q.word.word}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-base text-muted-foreground">{q.word.mn}</span>
        </div>
        <p className="text-xs text-muted-foreground">Үгүүдийг зөв дарааллаар байрлуул</p>
      </motion.div>
    );

    if (q.type === 'grammar') {
      const parts = q.sentence.split('___');
      return (
        <motion.div key={qIdx} {...anim} className={cardCls}>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Зөв хэлбэрийг сонгоно уу</p>
          <p className="text-lg sm:text-2xl font-bold text-foreground leading-relaxed">
            {parts[0]}
            <span className="inline-block px-3 py-0.5 mx-1 rounded-lg bg-primary/15 border border-primary/30 text-primary font-black min-w-[60px] text-center">
              {selected && showFeedback ? selected : '___'}
            </span>
            {parts[1]}
          </p>
        </motion.div>
      );
    }

    if (q.type === 'grammar_typing') {
      const parts = q.sentence.split('___');
      return (
        <motion.div key={qIdx} {...anim} className={cardCls}>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Зөв хэлбэрийг бич</p>
          <p className="text-lg sm:text-2xl font-bold text-foreground leading-relaxed">
            {parts[0]}
            <span className="inline-block px-3 py-0.5 mx-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 font-black min-w-[60px] text-center">
              {selected && showFeedback ? selected : '___'}
            </span>
            {parts[1]}
          </p>
        </motion.div>
      );
    }

    if (q.type === 'grammar_build') return (
      <motion.div key={qIdx} {...anim} className="space-y-2 border-y border-[#111] py-8 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-[#111]/45">Өгүүлбэр үүсгэх</p>
        <p className="text-xs text-[#111]/45">Үгүүдийг зөв дарааллаар байрлуул</p>
        <p className="text-xs font-mono text-[#c41212]">{q.explain}</p>
      </motion.div>
    );

    return null;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const totalLessons = VOCAB_LESSONS.length + GRAMMAR_LESSON_REFS.length;
  const completedCount = Object.values(userData.lessons).filter(l => l.stars > 0).length;

  return (
    <ToolPageShell
      title="MyLingo"
      eyebrow="Vocabulary & Grammar Map"
      icon={<Zap className="h-8 w-8" />}
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Англи хэл', href: '/tools/english' },
        { label: 'MyLingo' },
      ]}
    >
      <AnimatePresence mode="wait">

        {/* ── MAP ── */}
        {view === 'map' && (
          <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex w-full flex-col gap-0 pt-2"
          >
            <div className="mb-8 flex items-center justify-center gap-8 border-b border-[#111] pb-4 text-[11px] font-semibold uppercase tracking-[0.16em]">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-[#c41212]" /> : (
                <>
                  <span className="text-[#111]">{userData.xp.toLocaleString()} XP</span>
                  <span className="text-[#c41212]">{userData.streak} streak</span>
                  <span className="text-[#111]/45">{completedCount}/{totalLessons}</span>
                </>
              )}
            </div>

            <div className="mb-6 flex justify-center gap-8">
              <button
                onClick={() => setMapTab('vocab')}
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-[0.22em]',
                  mapTab === 'vocab' ? 'text-[#c41212]' : 'text-[#111]/40'
                )}
              >
                Үгийн сан
              </button>
              <button
                onClick={() => setMapTab('grammar')}
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-[0.22em]',
                  mapTab === 'grammar' ? 'text-[#c41212]' : 'text-[#111]/40'
                )}
              >
                Дүрэм
              </button>
            </div>

            {!loading && (mapTab === 'vocab' ? renderVocabMap() : renderGrammarMap())}
          </motion.div>
        )}

        {/* ── LESSON ── */}
        {view === 'lesson' && activeEntry && activeEntry.kind === 'grammar' && (
          <LessonView key="lesson" entry={activeEntry} onStart={goToQuiz} onBack={goToMap} />
        )}

        {/* ── QUIZ ── */}
        {view === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-xl mx-auto pt-2 space-y-3 sm:space-y-4"
          >
            {/* ── Header ── */}
            <div ref={quizTopRef} className="flex items-center gap-3">
              <button onClick={goToMap} className="p-2.5 rounded-xl hover:bg-muted/60 transition-colors shrink-0">
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="flex-1 space-y-1.5">
                <Progress value={(qIdx / questions.length) * 100} className="h-2" />
                <div className="flex justify-between items-center">
                  {activeEntry && (
                    <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                      {activeEntry.emoji} {activeEntry.title}
                    </p>
                  )}
                  <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">{qIdx + 1} / {questions.length}</span>
                </div>
              </div>
              {/* Combo badge */}
              <AnimatePresence>
                {combo >= 2 && (
                  <motion.div
                    key={combo}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30"
                  >
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span className="text-xs font-black text-orange-500">{combo}x</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Animated question card + input ── */}
            <div className="relative">
              {/* XP popup */}
              <AnimatePresence>
                {showXpPop && (
                  <motion.div
                    initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -32 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 text-sm font-black text-emerald-500 pointer-events-none"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    +{combo >= 3 ? XP_CORRECT * 2 : XP_CORRECT} XP
                    {combo >= 3 && <span className="text-orange-500 ml-0.5">🔥</span>}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait" initial={false}>
                {questions[qIdx] && (() => {
                  const q = questions[qIdx];
                  return (
                  <motion.div
                    key={qIdx}
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="space-y-4"
                  >
                    {/* Type badge */}
                    <div><QuestionTypeBadge q={q} /></div>

                    {/* Question prompt card */}
                    {renderQuizCard(q)}

                    {/* Input area */}
                    {(() => {
                      if (q.type === 'vocab' || q.type === 'vocab_reverse') {
                        const correctAns = getCorrectAnswer(q);
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.choices.map((choice, i) => {
                              const isSelected = selected === choice;
                              const isChoiceCorrect = choice === correctAns;
                              let state: 'idle' | 'correct' | 'wrong' | 'reveal' = 'idle';
                              if (showFeedback) {
                                if (isSelected && isChoiceCorrect) state = 'correct';
                                else if (isSelected && !isChoiceCorrect) state = 'wrong';
                                else if (!isSelected && isChoiceCorrect) state = 'reveal';
                              }
                              return <ChoiceButton key={choice} choice={choice} index={i} state={state} onClick={() => handleAnswer(choice)} disabled={showFeedback} />;
                            })}
                          </div>
                        );
                      }
                      if (q.type === 'grammar') {
                        const correctAns = getCorrectAnswer(q);
                        return (
                          <div className="grid grid-cols-1 gap-3">
                            {q.choices.map((choice, i) => {
                              const isSelected = selected === choice;
                              const isChoiceCorrect = choice === correctAns;
                              let state: 'idle' | 'correct' | 'wrong' | 'reveal' = 'idle';
                              if (showFeedback) {
                                if (isSelected && isChoiceCorrect) state = 'correct';
                                else if (isSelected && !isChoiceCorrect) state = 'wrong';
                                else if (!isSelected && isChoiceCorrect) state = 'reveal';
                              }
                              return <ChoiceButton key={choice} choice={choice} index={i} state={state} onClick={() => handleAnswer(choice)} disabled={showFeedback} />;
                            })}
                          </div>
                        );
                      }
                      if (q.type === 'typing' || q.type === 'grammar_typing') {
                        const isCorrect = showFeedback
                          ? normalizeAnswer(selected ?? '') === normalizeAnswer(q.answer)
                          : undefined;
                        return <TypingAnswer questionType={q.type} onSubmit={handleAnswer} disabled={showFeedback} isCorrect={isCorrect} />;
                      }
                      if (q.type === 'sentence_build' || q.type === 'grammar_build') {
                        const isCorrect = showFeedback
                          ? normalizeAnswer(selected ?? '') === normalizeAnswer(q.correct)
                          : undefined;
                        return <SentenceBuildAnswer initialWords={q.words} onSubmit={handleAnswer} disabled={showFeedback} isCorrect={isCorrect} correctSentence={q.correct} />;
                      }
                      return null;
                    })()}

                    {/* Feedback toast */}
                    <AnimatePresence>
                      {showFeedback && (() => {
                        const correctAns = getCorrectAnswer(q);
                        const isRight = selected !== null && normalizeAnswer(selected) === normalizeAnswer(correctAns);
                        const explain = (q.type === 'grammar' || q.type === 'grammar_typing' || q.type === 'grammar_build') ? q.explain : null;
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.18 }}
                            className={cn(
                              'rounded-xl px-5 py-3.5 text-sm font-semibold flex items-start gap-2.5 border',
                              isRight
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                : 'bg-destructive/10 border-destructive/30 text-destructive',
                            )}
                          >
                            {isRight ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-0.5">
                              {isRight ? (
                                <p>Зөв!{combo >= 3 ? ` 🔥 ${combo}x Combo!` : ''}</p>
                              ) : (
                                <p>Зөв хариулт: <strong>{correctAns}</strong></p>
                              )}
                              {explain && <p className="text-xs opacity-70 font-normal">{explain}</p>}
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            {saving && <div className="flex justify-center pt-2"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {view === 'result' && activeEntry && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="max-w-md mx-auto pt-2 space-y-4 sm:space-y-6 text-center"
          >
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-4xl sm:text-5xl">
                {activeEntry.emoji}
              </div>
            </motion.div>

            <div>
              {(() => {
                const correct = sessionCorrect.filter(Boolean).length;
                const total = sessionCorrect.length;
                const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
                const pctCls = pct >= 90 ? 'text-emerald-500' : pct >= 70 ? 'text-sky-500' : pct >= 50 ? 'text-orange-500' : 'text-destructive';
                const msg = correct === total ? '🎉 Гайхалтай!' : pct >= 70 ? '👍 Сайн!' : '💪 Дахин туршаарай!';
                return (
                  <>
                    <h2 className="text-xl sm:text-2xl font-black text-foreground">{msg}</h2>
                    <p className={cn('text-5xl font-black mt-2 mb-1 tabular-nums', pctCls)}>{pct}%</p>
                    <p className="text-xs text-muted-foreground">{correct}/{total} зөв · {activeEntry.title}</p>
                  </>
                );
              })()}
            </div>

            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="flex justify-center gap-3"
            >
              {[1,2,3].map(n => {
                const earned = starsFromScore(sessionCorrect.filter(Boolean).length, sessionCorrect.length);
                return (
                  <motion.div key={n} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4 + n * 0.12, type: 'spring', stiffness: 300 }}
                  >
                    <Star className={cn('h-8 w-8 sm:h-10 sm:w-10', n <= earned ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20 fill-muted-foreground/10')} />
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="space-y-1 border-t border-[#111] py-4">
                <p className="text-xl font-medium text-[#c41212]">+{xpEarned}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#111]/45">XP олов</p>
              </div>
              <div className="space-y-1 border-t border-[#111] py-4">
                <p className="text-xl font-medium">{sessionCorrect.filter(Boolean).length}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#111]/45">Зөв хариулт</p>
              </div>
              <div className="space-y-1 border-t border-[#111] py-4">
                <p className="text-xl font-medium">{userData.streak}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#111]/45">Streak</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#111] pt-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Дэлгэрэнгүй</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {questions.slice(0, sessionCorrect.length).map((q, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    {sessionCorrect[i]
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      : <XCircle      className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
                    {(q.type === 'vocab' || q.type === 'typing') ? (
                      <span><span className="font-semibold">{q.word.word}</span> <span className="text-muted-foreground">→ {q.word.mn}</span></span>
                    ) : q.type === 'vocab_reverse' ? (
                      <span><span className="text-muted-foreground">{q.word.mn}</span> → <span className="font-semibold">{q.word.word}</span></span>
                    ) : q.type === 'sentence_build' ? (
                      <span className="text-muted-foreground leading-tight">{q.correct}</span>
                    ) : q.type === 'grammar' ? (
                      <span className="text-muted-foreground leading-tight">{q.sentence.replace('___', `[${q.correct}]`)}</span>
                    ) : q.type === 'grammar_typing' ? (
                      <span className="text-muted-foreground leading-tight">{q.sentence.replace('___', `[${q.answer}]`)}</span>
                    ) : q.type === 'grammar_build' ? (
                      <span className="text-muted-foreground leading-tight">{q.correct}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={goToQuiz} className="flex-1 gap-2 rounded-none border-0 bg-[#c41212] text-white hover:bg-[#c41212]/90">
                <RotateCcw className="h-4 w-4" /> Дахин
              </Button>
              <Button onClick={goToMap} variant="outline" className="flex-1 gap-2 rounded-none border-[#111]/30 bg-transparent">
                <BookOpen className="h-4 w-4" /> Жагсаалт
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </ToolPageShell>
  );
}
