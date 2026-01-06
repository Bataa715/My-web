'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Headphones,
  Sparkles,
  Brain,
  Volume2,
  VolumeX,
  BookOpen,
  MessageSquare,
  PenLine,
  Lightbulb,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import BackButton from '@/components/shared/BackButton';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import { useToast } from '@/hooks/use-toast';
import {
  generateListeningPractice,
  type ListeningPracticeOutput,
} from '@/ai/flows/listening-practice-flow';
import { cn } from '@/lib/utils';

const topicSuggestions = [
  'Ordering food at a restaurant',
  'Job interview conversation',
  'Asking for directions',
  'Making a phone call',
  'Shopping at a store',
  'At the airport',
  'Doctor visit',
  'Hotel check-in',
];

export default function ListeningPage() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'intermediate'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ListeningPracticeOutput | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [fillBlanksAnswers, setFillBlanksAnswers] = useState<
    Record<number, string>
  >({});
  const [showFillBlanksResults, setShowFillBlanksResults] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Сэдэв хоосон байна',
        description: 'Сэдэв оруулна уу.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setShowTranscript(false);
    setFillBlanksAnswers({});
    setShowFillBlanksResults(false);

    try {
      const practice = await generateListeningPractice({ topic, level });
      setResult(practice);
      toast({
        title: 'Амжилттай!',
        description: 'Сонсох дасгал бэлэн боллоо.',
      });
    } catch (error) {
      console.error('Error generating practice:', error);
      toast({
        title: 'Алдаа гарлаа',
        description: 'AI үүсгэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const speakScript = () => {
    if (!result) return;

    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(result.script);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const speakWord = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
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
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30 mb-6"
            >
              <Headphones className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Listening Practice
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              AI-ийн тусламжтай сонсох чадвараа сайжруулаарай
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
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Сэдэв сонгох
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Жишээ: Ordering food at a restaurant..."
                  className="bg-background/50 border-border/50 rounded-xl"
                />

                {/* Topic suggestions */}
                <div className="flex flex-wrap gap-2">
                  {topicSuggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setTopic(suggestion)}
                      className="px-3 py-1.5 text-sm bg-amber-500/10 text-amber-500 rounded-full hover:bg-amber-500/20 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

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
                    onClick={handleGenerate}
                    disabled={loading || !topic.trim()}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl gap-2 px-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Үүсгэж байна...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        Дасгал үүсгэх
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
                <Tabs defaultValue="listen" className="space-y-6">
                  <TabsList className="bg-card/50 backdrop-blur-sm rounded-xl p-1 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="listen" className="rounded-lg gap-2">
                      <Headphones className="h-4 w-4" />
                      Сонсох
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
                    <TabsTrigger
                      value="fillblanks"
                      className="rounded-lg gap-2"
                    >
                      <PenLine className="h-4 w-4" />
                      Нөхөх
                    </TabsTrigger>
                  </TabsList>

                  {/* Listen Tab */}
                  <TabsContent value="listen">
                    <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-3xl">
                      <CardContent className="pt-6 space-y-6">
                        {/* Audio Controls */}
                        <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl">
                          <Button
                            onClick={speakScript}
                            size="lg"
                            className={cn(
                              'h-16 w-16 rounded-full',
                              isPlaying
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                            )}
                          >
                            {isPlaying ? (
                              <Pause className="h-8 w-8" />
                            ) : (
                              <Play className="h-8 w-8 ml-1" />
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              speechSynthesis.cancel();
                              setIsPlaying(false);
                            }}
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-full"
                          >
                            <RotateCcw className="h-5 w-5" />
                          </Button>
                        </div>

                        {/* Tips */}
                        <div className="space-y-3">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-500" />
                            Сонсохдоо анхаарах
                          </h3>
                          <div className="grid gap-2">
                            {result.listeningTips.map((tip, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 p-3 bg-muted/30 rounded-xl"
                              >
                                <span className="text-amber-500 font-bold">
                                  {index + 1}.
                                </span>
                                <span className="text-sm">{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Transcript Toggle */}
                        <div className="space-y-3">
                          <Button
                            onClick={() => setShowTranscript(!showTranscript)}
                            variant="outline"
                            className="rounded-xl gap-2"
                          >
                            {showTranscript ? (
                              <VolumeX className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                            {showTranscript ? 'Текст нуух' : 'Текст харах'}
                          </Button>

                          <AnimatePresence>
                            {showTranscript && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                              >
                                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                  <p className="leading-relaxed">
                                    {result.script}
                                  </p>
                                </div>
                                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                  <p className="text-muted-foreground leading-relaxed">
                                    {result.scriptMongolian}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
                                <div>
                                  <h4 className="text-xl font-bold text-amber-500">
                                    {vocab.word}
                                  </h4>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {vocab.pronunciation}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => speakWord(vocab.word)}
                                  className="h-8 w-8 rounded-lg"
                                >
                                  <Volume2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <p className="text-sm">{vocab.meaning}</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Questions Tab */}
                  <TabsContent value="questions">
                    <div className="space-y-4">
                      {result.comprehensionQuestions.map((q, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3 mb-3">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="font-medium mb-1">
                                    {q.question}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {q.questionMongolian}
                                  </p>
                                </div>
                              </div>
                              <div className="ml-11 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <p className="text-sm">
                                  <span className="font-semibold text-amber-500">
                                    Хариулт:
                                  </span>{' '}
                                  {q.answer}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Fill in Blanks Tab */}
                  <TabsContent value="fillblanks">
                    <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-3xl">
                      <CardContent className="pt-6 space-y-4">
                        <p className="text-muted-foreground mb-4">
                          Хоосон зайг нөхөж бичнэ үү:
                        </p>
                        {result.fillInBlanks.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-muted/30 rounded-xl space-y-3"
                          >
                            <p className="font-medium">{item.sentence}</p>
                            {item.hint && (
                              <p className="text-xs text-muted-foreground">
                                💡 Hint: {item.hint}
                              </p>
                            )}
                            <div className="flex gap-3">
                              <Input
                                value={fillBlanksAnswers[index] || ''}
                                onChange={e =>
                                  setFillBlanksAnswers(prev => ({
                                    ...prev,
                                    [index]: e.target.value,
                                  }))
                                }
                                placeholder="Хариултаа бичнэ үү..."
                                className="bg-background/50 rounded-lg"
                                disabled={showFillBlanksResults}
                              />
                            </div>
                            {showFillBlanksResults && (
                              <div
                                className={cn(
                                  'p-2 rounded-lg text-sm',
                                  fillBlanksAnswers[index]
                                    ?.toLowerCase()
                                    .trim() === item.answer.toLowerCase().trim()
                                    ? 'bg-emerald-500/20 text-emerald-500'
                                    : 'bg-red-500/20 text-red-500'
                                )}
                              >
                                {fillBlanksAnswers[index]
                                  ?.toLowerCase()
                                  .trim() === item.answer.toLowerCase().trim()
                                  ? '✓ Зөв!'
                                  : `✗ Зөв хариулт: ${item.answer}`}
                              </div>
                            )}
                          </motion.div>
                        ))}
                        {!showFillBlanksResults && (
                          <Button
                            onClick={() => setShowFillBlanksResults(true)}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl"
                          >
                            Шалгах
                          </Button>
                        )}
                      </CardContent>
                    </Card>
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
