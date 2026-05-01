'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const dynamic = 'force-dynamic';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  PenTool,
  Sparkles,
  Brain,
  FileText,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Award,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import BackButton from '@/components/shared/BackButton';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import { useToast } from '@/hooks/use-toast';
import {
  checkWriting,
  generateWritingPrompt,
  type WritingCheckOutput,
  type WritingPromptOutput,
} from '@/ai/flows/writing-practice-flow';
import { cn } from '@/lib/utils';

const taskTypes = [
  {
    value: 'essay',
    label: '📝 Эссэ',
    description: 'Сэдвийн талаар өргөн хүрээтэй бичих',
  },
  {
    value: 'email',
    label: '✉️ Имэйл',
    description: 'Албан болон хувийн захидал',
  },
  {
    value: 'story',
    label: '📖 Түүх',
    description: 'Богино өгүүллэг, түүх бичих',
  },
  {
    value: 'description',
    label: '🖼️ Тодорхойлолт',
    description: 'Юмсыг дүрслэн бичих',
  },
  {
    value: 'opinion',
    label: '💭 Санал бодол',
    description: 'Өөрийн үзэл бодлоо илэрхийлэх',
  },
];

export default function WritingPage() {
  const [mode, setMode] = useState<'check' | 'prompt'>('check');
  const [text, setText] = useState('');
  const [taskType, setTaskType] = useState<
    'essay' | 'email' | 'story' | 'description' | 'opinion'
  >('essay');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'intermediate'
  );
  const [topicPref, setTopicPref] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<WritingCheckOutput | null>(
    null
  );
  const [promptResult, setPromptResult] = useState<WritingPromptOutput | null>(
    null
  );
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!text.trim()) {
      toast({
        title: 'Текст хоосон байна',
        description: 'Шалгах текст оруулна уу.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setCheckResult(null);

    try {
      const result = await checkWriting({ text, taskType });
      setCheckResult(result);
      toast({ title: 'Амжилттай!', description: 'Бичвэр шалгагдлаа.' });
    } catch (error) {
      console.error('Error checking writing:', error);
      toast({
        title: 'Алдаа гарлаа',
        description: 'AI шалгахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrompt = async () => {
    setLoading(true);
    setPromptResult(null);

    try {
      const result = await generateWritingPrompt({
        topic: topicPref || undefined,
        taskType,
        level,
      });
      setPromptResult(result);
      toast({ title: 'Амжилттай!', description: 'Бичих даалгавар үүслээ.' });
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: 'Алдаа гарлаа',
        description: 'AI үүсгэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative"
    >
      <InteractiveParticles quantity={40} />

      <div className="relative z-10 p-4 md:p-8">
        <BackButton />

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-6 pb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 mb-6"
            >
              <PenTool className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-violet-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
              Writing Practice
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              AI-ийн тусламжтай бичих чадвараа сайжруулаарай
            </p>
          </motion.div>

          {/* Mode Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-3 mb-8"
          >
            <button
              onClick={() => {
                setMode('check');
                setCheckResult(null);
              }}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
                mode === 'check'
                  ? 'bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-card/50 text-muted-foreground hover:text-foreground'
              )}
            >
              <CheckCircle className="h-5 w-5" />
              Бичвэр шалгах
            </button>
            <button
              onClick={() => {
                setMode('prompt');
                setPromptResult(null);
              }}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
                mode === 'prompt'
                  ? 'bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-card/50 text-muted-foreground hover:text-foreground'
              )}
            >
              <Lightbulb className="h-5 w-5" />
              Даалгавар авах
            </button>
          </motion.div>

          {/* Check Mode */}
          <AnimatePresence mode="wait">
            {mode === 'check' && (
              <motion.div
                key="check"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-3xl shadow-xl mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-violet-500" />
                      Бичвэрээ оруулна уу
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm text-muted-foreground">
                        Төрөл:
                      </span>
                      <Select
                        value={taskType}
                        onValueChange={v => setTaskType(v as any)}
                      >
                        <SelectTrigger className="w-48 bg-background/50 border-border/50 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {taskTypes.map(type => (
                            <SelectItem
                              key={type.value}
                              value={type.value}
                              className="rounded-lg"
                            >
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Textarea
                      value={text}
                      onChange={e => setText(e.target.value)}
                      placeholder="Англи хэл дээр бичсэн текстээ энд оруулна уу..."
                      className="min-h-[250px] bg-background/50 border-border/50 rounded-xl resize-none"
                    />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {text.split(/\s+/).filter(w => w).length} үг
                      </span>
                      <Button
                        onClick={handleCheck}
                        disabled={loading || !text.trim()}
                        className="bg-linear-to-r from-violet-500 to-purple-600 text-white rounded-xl gap-2 px-6"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Шалгаж байна...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4" />
                            AI Шалгах
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Check Results */}
                {checkResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Tabs defaultValue="overview" className="space-y-6">
                      <TabsList className="bg-card/50 backdrop-blur-xs rounded-xl p-1 w-full justify-start overflow-x-auto">
                        <TabsTrigger
                          value="overview"
                          className="rounded-lg gap-2"
                        >
                          <Award className="h-4 w-4" />
                          Үнэлгээ
                        </TabsTrigger>
                        <TabsTrigger
                          value="corrected"
                          className="rounded-lg gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Засвар
                        </TabsTrigger>
                        <TabsTrigger
                          value="mistakes"
                          className="rounded-lg gap-2"
                        >
                          <AlertCircle className="h-4 w-4" />
                          Алдаанууд
                        </TabsTrigger>
                        <TabsTrigger
                          value="suggestions"
                          className="rounded-lg gap-2"
                        >
                          <Lightbulb className="h-4 w-4" />
                          Зөвлөмж
                        </TabsTrigger>
                      </TabsList>

                      {/* Overview Tab */}
                      <TabsContent value="overview">
                        <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-3xl">
                          <CardContent className="pt-6">
                            {/* Overall Score */}
                            <div className="text-center mb-8">
                              <div
                                className={cn(
                                  'inline-flex items-center justify-center w-32 h-32 rounded-full border-4',
                                  getScoreColor(checkResult.overallScore),
                                  checkResult.overallScore >= 80
                                    ? 'border-emerald-500/30'
                                    : checkResult.overallScore >= 60
                                      ? 'border-amber-500/30'
                                      : 'border-red-500/30'
                                )}
                              >
                                <span className="text-5xl font-bold">
                                  {checkResult.overallScore}
                                </span>
                              </div>
                              <p className="text-muted-foreground mt-4">
                                Ерөнхий оноо
                              </p>
                            </div>

                            {/* Category Scores */}
                            <div className="grid gap-4 md:grid-cols-2">
                              {Object.entries(checkResult.categories).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="p-4 bg-muted/30 rounded-xl"
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium capitalize">
                                        {key === 'grammar'
                                          ? '📝 Дүрэм'
                                          : key === 'vocabulary'
                                            ? '📚 Үгсийн сан'
                                            : key === 'coherence'
                                              ? '🔗 Уялдаа холбоо'
                                              : '✨ Хэв маяг'}
                                      </span>
                                      <span
                                        className={cn(
                                          'font-bold',
                                          getScoreColor(value.score)
                                        )}
                                      >
                                        {value.score}/100
                                      </span>
                                    </div>
                                    <Progress
                                      value={value.score}
                                      className="h-2 mb-2"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                      {value.feedbackMongolian}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>

                            {/* Strong Points */}
                            <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                              <h4 className="font-semibold text-emerald-500 mb-2">
                                ✨ Сайн тал
                              </h4>
                              <ul className="space-y-1">
                                {checkResult.strongPoints.map(
                                  (point, index) => (
                                    <li
                                      key={index}
                                      className="text-sm flex items-start gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                      {point}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Corrected Tab */}
                      <TabsContent value="corrected">
                        <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-3xl">
                          <CardContent className="pt-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                              Засагдсан хувилбар
                            </h3>
                            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                              <p className="leading-relaxed whitespace-pre-wrap">
                                {checkResult.correctedText}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Mistakes Tab */}
                      <TabsContent value="mistakes">
                        <div className="space-y-4">
                          {checkResult.mistakes.map((mistake, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
                                <CardContent className="pt-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <span
                                      className={cn(
                                        'px-2 py-0.5 rounded-full text-xs font-medium',
                                        mistake.type === 'grammar'
                                          ? 'bg-red-500/20 text-red-500'
                                          : mistake.type === 'spelling'
                                            ? 'bg-amber-500/20 text-amber-500'
                                            : mistake.type === 'vocabulary'
                                              ? 'bg-blue-500/20 text-blue-500'
                                              : 'bg-purple-500/20 text-purple-500'
                                      )}
                                    >
                                      {mistake.type === 'grammar'
                                        ? 'Дүрэм'
                                        : mistake.type === 'spelling'
                                          ? 'Үсгийн алдаа'
                                          : mistake.type === 'vocabulary'
                                            ? 'Үгсийн сан'
                                            : mistake.type === 'punctuation'
                                              ? 'Цэг тэмдэг'
                                              : 'Хэв маяг'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="line-through text-red-400">
                                      {mistake.original}
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-emerald-400 font-medium">
                                      {mistake.corrected}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {mistake.explanationMongolian}
                                  </p>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </TabsContent>

                      {/* Suggestions Tab */}
                      <TabsContent value="suggestions">
                        <div className="space-y-4">
                          {checkResult.suggestions.map((suggestion, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
                                <CardContent className="pt-4">
                                  <span className="text-xs font-medium text-violet-500 uppercase">
                                    {suggestion.category}
                                  </span>
                                  <p className="mt-2">
                                    {suggestion.suggestionMongolian}
                                  </p>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Prompt Mode */}
            {mode === 'prompt' && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-3xl shadow-xl mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-violet-500" />
                      Бичих даалгавар авах
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">
                          Төрөл
                        </label>
                        <Select
                          value={taskType}
                          onValueChange={v => setTaskType(v as any)}
                        >
                          <SelectTrigger className="bg-background/50 border-border/50 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {taskTypes.map(type => (
                              <SelectItem
                                key={type.value}
                                value={type.value}
                                className="rounded-lg"
                              >
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">
                          Түвшин
                        </label>
                        <Select
                          value={level}
                          onValueChange={v => setLevel(v as any)}
                        >
                          <SelectTrigger className="bg-background/50 border-border/50 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="beginner" className="rounded-lg">
                              🌱 Анхан шат
                            </SelectItem>
                            <SelectItem
                              value="intermediate"
                              className="rounded-lg"
                            >
                              🌿 Дунд шат
                            </SelectItem>
                            <SelectItem value="advanced" className="rounded-lg">
                              🌳 Ахисан шат
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Input
                      value={topicPref}
                      onChange={e => setTopicPref(e.target.value)}
                      placeholder="Сэдвийн санал (заавал биш)..."
                      className="bg-background/50 border-border/50 rounded-xl"
                    />

                    <Button
                      onClick={handleGeneratePrompt}
                      disabled={loading}
                      className="w-full bg-linear-to-r from-violet-500 to-purple-600 text-white rounded-xl gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Үүсгэж байна...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Даалгавар үүсгэх
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Prompt Result */}
                {promptResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Main Prompt */}
                    <Card className="bg-linear-to-br from-violet-500/10 to-purple-500/10 border-0 rounded-3xl">
                      <CardContent className="pt-6">
                        <div className="text-center mb-4">
                          <span className="text-sm text-violet-400 font-medium">
                            {promptResult.wordCount.min} -{' '}
                            {promptResult.wordCount.max} үг
                          </span>
                        </div>
                        <p className="text-xl font-medium text-center mb-4">
                          {promptResult.prompt}
                        </p>
                        <p className="text-muted-foreground text-center">
                          {promptResult.promptMongolian}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Example Opening */}
                    <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
                      <CardContent className="pt-4">
                        <h4 className="font-semibold text-violet-500 mb-2">
                          💡 Эхлэх жишээ
                        </h4>
                        <p className="italic text-muted-foreground">
                          "{promptResult.exampleOpening}"
                        </p>
                      </CardContent>
                    </Card>

                    {/* Tips */}
                    <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
                      <CardContent className="pt-4">
                        <h4 className="font-semibold mb-3">📝 Бичих зөвлөмж</h4>
                        <div className="space-y-2">
                          {promptResult.tips.map((tip, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg"
                            >
                              <span className="text-violet-500 font-bold">
                                {index + 1}.
                              </span>
                              <div>
                                <p className="text-sm">{tip.tip}</p>
                                <p className="text-xs text-muted-foreground">
                                  {tip.tipMongolian}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Vocabulary */}
                    <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
                      <CardContent className="pt-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-violet-500" />
                          Хэрэгтэй үгс
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {promptResult.usefulVocabulary.map((vocab, index) => (
                            <div
                              key={index}
                              className="px-3 py-1.5 bg-violet-500/10 rounded-full text-sm"
                            >
                              <span className="font-medium text-violet-500">
                                {vocab.word}
                              </span>
                              <span className="text-muted-foreground">
                                {' '}
                                - {vocab.meaning}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Start Writing Button */}
                    <Button
                      onClick={() => {
                        setMode('check');
                        setText('');
                        setCheckResult(null);
                      }}
                      className="w-full bg-linear-to-r from-violet-500 to-purple-600 text-white rounded-xl gap-2 h-12"
                    >
                      <PenTool className="h-5 w-5" />
                      Бичиж эхлэх
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
