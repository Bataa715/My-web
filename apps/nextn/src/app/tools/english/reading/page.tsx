'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  BookOpen,
  Sparkles,
  Brain,
  MessageSquare,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Volume2,
} from 'lucide-react';
import BackButton from '@/components/shared/BackButton';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import { useToast } from '@/hooks/use-toast';
import {
  analyzeReadingText,
  type ReadingComprehensionOutput,
} from '@/ai/flows/reading-comprehension-flow';
import { cn } from '@/lib/utils';

export default function ReadingPage() {
  const [text, setText] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'intermediate'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReadingComprehensionOutput | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: 'Текст хоосон байна',
        description: 'Шинжлэх текст оруулна уу.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setSelectedAnswers({});
    setShowResults({});

    try {
      const analysis = await analyzeReadingText({ text, level });
      setResult(analysis);
      toast({ title: 'Амжилттай!', description: 'Текст шинжлэгдлээ.' });
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast({
        title: 'Алдаа гарлаа',
        description: 'AI шинжилгээ хийхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = (questionIndex: number) => {
    setShowResults(prev => ({ ...prev, [questionIndex]: true }));
  };

  const speakText = (textToSpeak: string) => {
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
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
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 mb-6"
            >
              <BookOpen className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-emerald-400 via-green-500 to-teal-500 bg-clip-text text-transparent">
              Reading Practice
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              AI-ийн тусламжтай унших чадвараа сайжруулаарай
            </p>
          </motion.div>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-3xl shadow-xl mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                  Текст оруулах
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Англи хэл дээрх текстээ энд оруулна уу... &#10;&#10;Жишээ: The sun rises in the east and sets in the west. This is because Earth rotates on its axis from west to east..."
                  className="min-h-[200px] bg-background/50 border-border/50 rounded-xl resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Түвшин:
                    </span>
                    <Select
                      value={level}
                      onValueChange={v => setLevel(v as any)}
                    >
                      <SelectTrigger className="w-40 bg-background/50 border-border/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="beginner" className="rounded-lg">
                          🌱 Анхан шат
                        </SelectItem>
                        <SelectItem value="intermediate" className="rounded-lg">
                          🌿 Дунд шат
                        </SelectItem>
                        <SelectItem value="advanced" className="rounded-lg">
                          🌳 Ахисан шат
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading || !text.trim()}
                    className="bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-xl gap-2 px-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Шинжилж байна...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        AI Шинжилгээ
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Tabs defaultValue="summary" className="space-y-6">
                  <TabsList className="bg-card/50 backdrop-blur-xs rounded-xl p-1 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="summary" className="rounded-lg gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Хураангуй
                    </TabsTrigger>
                    <TabsTrigger
                      value="vocabulary"
                      className="rounded-lg gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Үгсийн сан
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="rounded-lg gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Асуултууд
                    </TabsTrigger>
                    <TabsTrigger value="grammar" className="rounded-lg gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Дүрэм
                    </TabsTrigger>
                  </TabsList>

                  {/* Summary Tab */}
                  <TabsContent value="summary">
                    <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-3xl">
                      <CardContent className="pt-6 space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <span className="text-emerald-500">EN</span>{' '}
                              Summary
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => speakText(result.summary)}
                              className="rounded-xl"
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-foreground leading-relaxed p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            {result.summary}
                          </p>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <span className="text-blue-500">MN</span> Хураангуй
                          </h3>
                          <p className="text-muted-foreground leading-relaxed p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            {result.summaryMongolian}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Vocabulary Tab */}
                  <TabsContent value="vocabulary">
                    <div className="grid gap-4 md:grid-cols-2">
                      {result.keyVocabulary.map((vocab, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl h-full">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-xl font-bold text-emerald-500">
                                  {vocab.word}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => speakText(vocab.word)}
                                  className="h-8 w-8 rounded-lg"
                                >
                                  <Volume2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {vocab.definition}
                              </p>
                              <p className="text-sm font-medium text-blue-400 mb-3">
                                🇲🇳 {vocab.mongolian}
                              </p>
                              <div className="p-3 bg-muted/30 rounded-xl">
                                <p className="text-sm italic">
                                  "{vocab.exampleSentence}"
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Questions Tab */}
                  <TabsContent value="questions">
                    <div className="space-y-4">
                      {result.questions.map((q, qIndex) => (
                        <motion.div
                          key={qIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: qIndex * 0.1 }}
                        >
                          <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3 mb-4">
                                <span className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                                  {qIndex + 1}
                                </span>
                                <p className="text-lg font-medium">
                                  {q.question}
                                </p>
                              </div>
                              <div className="grid gap-2 ml-11">
                                {q.options.map((option, oIndex) => {
                                  const isSelected =
                                    selectedAnswers[qIndex] === option;
                                  const isCorrect = option === q.correctAnswer;
                                  const showResult = showResults[qIndex];

                                  return (
                                    <button
                                      key={oIndex}
                                      onClick={() => {
                                        if (!showResult) {
                                          setSelectedAnswers(prev => ({
                                            ...prev,
                                            [qIndex]: option,
                                          }));
                                        }
                                      }}
                                      disabled={showResult}
                                      className={cn(
                                        'w-full text-left p-3 rounded-xl border transition-all',
                                        isSelected &&
                                          !showResult &&
                                          'border-emerald-500 bg-emerald-500/10',
                                        !isSelected &&
                                          !showResult &&
                                          'border-border/50 hover:border-emerald-500/50 hover:bg-muted/30',
                                        showResult &&
                                          isCorrect &&
                                          'border-emerald-500 bg-emerald-500/20',
                                        showResult &&
                                          isSelected &&
                                          !isCorrect &&
                                          'border-red-500 bg-red-500/20',
                                        showResult &&
                                          !isSelected &&
                                          !isCorrect &&
                                          'opacity-50'
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        {showResult && isCorrect && (
                                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        )}
                                        {showResult &&
                                          isSelected &&
                                          !isCorrect && (
                                            <XCircle className="h-4 w-4 text-red-500" />
                                          )}
                                        <span>{option}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="ml-11 mt-4 flex items-center gap-3">
                                {!showResults[qIndex] && (
                                  <Button
                                    onClick={() => checkAnswer(qIndex)}
                                    disabled={!selectedAnswers[qIndex]}
                                    size="sm"
                                    className="bg-emerald-500 hover:bg-emerald-600 rounded-lg"
                                  >
                                    Шалгах
                                  </Button>
                                )}
                                {showResults[qIndex] && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="w-full p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                                  >
                                    <p className="text-sm text-blue-400">
                                      <span className="font-semibold">
                                        Тайлбар:
                                      </span>{' '}
                                      {q.explanation}
                                    </p>
                                  </motion.div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Grammar Tab */}
                  <TabsContent value="grammar">
                    <div className="space-y-4">
                      {result.grammarPoints.map((grammar, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
                            <CardContent className="pt-6">
                              <h4 className="text-lg font-semibold text-emerald-500 mb-3">
                                📚 {grammar.pattern}
                              </h4>
                              <p className="text-muted-foreground mb-4">
                                {grammar.explanation}
                              </p>
                              <div className="p-4 bg-muted/30 rounded-xl">
                                <p className="text-sm">
                                  <span className="text-emerald-400 font-medium">
                                    Жишээ:
                                  </span>{' '}
                                  {grammar.example}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
