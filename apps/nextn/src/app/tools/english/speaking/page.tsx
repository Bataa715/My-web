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
  Mic,
  Sparkles,
  Brain,
  Volume2,
  MessageCircle,
  Users,
  Lightbulb,
  BookOpen,
  Play,
} from 'lucide-react';
import BackButton from '@/components/shared/BackButton';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import { useToast } from '@/hooks/use-toast';
import {
  generateSpeakingPractice,
  type SpeakingPracticeOutput,
} from '@/ai/flows/speaking-practice-flow';
import { cn } from '@/lib/utils';

const topicSuggestions = [
  'Introducing yourself',
  'At the coffee shop',
  'Making a reservation',
  'Talking about hobbies',
  'Asking for help',
  'Job interview',
  'Meeting new people',
  'Shopping for clothes',
];

export default function SpeakingPage() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'intermediate'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpeakingPracticeOutput | null>(null);
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

    try {
      const practice = await generateSpeakingPractice({ topic, level });
      setResult(practice);
      toast({ title: 'Амжилттай!', description: 'Ярих дасгал бэлэн боллоо.' });
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

  const speakText = (text: string, rate = 0.85) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
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
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30 mb-6"
            >
              <Mic className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-pink-400 via-rose-500 to-red-500 bg-clip-text text-transparent">
              Speaking Practice
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              AI-ийн тусламжтай ярих чадвараа сайжруулаарай
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
                  <Sparkles className="h-5 w-5 text-pink-500" />
                  Сэдэв сонгох
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Жишээ: Introducing yourself at a party..."
                  className="bg-background/50 border-border/50 rounded-xl"
                />

                {/* Topic suggestions */}
                <div className="flex flex-wrap gap-2">
                  {topicSuggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setTopic(suggestion)}
                      className="px-3 py-1.5 text-sm bg-pink-500/10 text-pink-500 rounded-full hover:bg-pink-500/20 transition-colors"
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
                    className="bg-linear-to-r from-pink-500 to-rose-600 text-white rounded-xl gap-2 px-6"
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
                <Tabs defaultValue="situation" className="space-y-6">
                  <TabsList className="bg-card/50 backdrop-blur-xs rounded-xl p-1 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="situation" className="rounded-lg gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Нөхцөл байдал
                    </TabsTrigger>
                    <TabsTrigger value="dialogue" className="rounded-lg gap-2">
                      <Users className="h-4 w-4" />
                      Харилцан яриа
                    </TabsTrigger>
                    <TabsTrigger value="phrases" className="rounded-lg gap-2">
                      <BookOpen className="h-4 w-4" />
                      Хэллэгүүд
                    </TabsTrigger>
                    <TabsTrigger value="practice" className="rounded-lg gap-2">
                      <Mic className="h-4 w-4" />
                      Дасгал
                    </TabsTrigger>
                  </TabsList>

                  {/* Situation Tab */}
                  <TabsContent value="situation">
                    <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-3xl">
                      <CardContent className="pt-6 space-y-6">
                        <div className="p-6 bg-linear-to-br from-pink-500/10 to-rose-500/10 rounded-2xl border border-pink-500/20">
                          <h3 className="text-lg font-semibold text-pink-500 mb-3">
                            🎭 Scenario
                          </h3>
                          <p className="text-lg leading-relaxed mb-4">
                            {result.situation}
                          </p>
                          <p className="text-muted-foreground">
                            {result.situationMongolian}
                          </p>
                        </div>

                        {/* Pronunciation Tips */}
                        <div className="space-y-3">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-pink-500" />
                            Дуудлагын зөвлөмж
                          </h3>
                          <div className="grid gap-3 md:grid-cols-2">
                            {result.pronunciationTips.map((tip, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                              >
                                <div>
                                  <span className="font-bold text-pink-500">
                                    {tip.word}
                                  </span>
                                  {tip.ipa && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {tip.ipa}
                                    </span>
                                  )}
                                  <p className="text-sm text-muted-foreground">
                                    {tip.tip}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => speakText(tip.word, 0.7)}
                                  className="h-8 w-8 rounded-lg"
                                >
                                  <Volume2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Dialogue Tab */}
                  <TabsContent value="dialogue">
                    <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-3xl">
                      <CardContent className="pt-6">
                        <div className="flex justify-end mb-4">
                          <Button
                            onClick={() => {
                              const fullDialogue = result.dialogue
                                .map(d => d.english)
                                .join('. ');
                              speakText(fullDialogue, 0.8);
                            }}
                            variant="outline"
                            size="sm"
                            className="rounded-lg gap-2"
                          >
                            <Play className="h-4 w-4" />
                            Бүгдийг сонсох
                          </Button>
                        </div>
                        <div className="space-y-4">
                          {result.dialogue.map((line, index) => (
                            <motion.div
                              key={index}
                              initial={{
                                opacity: 0,
                                x: line.speaker === 'A' ? -20 : 20,
                              }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={cn(
                                'flex gap-4',
                                line.speaker === 'B' && 'flex-row-reverse'
                              )}
                            >
                              <div
                                className={cn(
                                  'w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0',
                                  line.speaker === 'A'
                                    ? 'bg-pink-500/20 text-pink-500'
                                    : 'bg-blue-500/20 text-blue-500'
                                )}
                              >
                                {line.speaker}
                              </div>
                              <div
                                className={cn(
                                  'flex-1 max-w-[80%] p-4 rounded-2xl',
                                  line.speaker === 'A'
                                    ? 'bg-pink-500/10 rounded-tl-none'
                                    : 'bg-blue-500/10 rounded-tr-none'
                                )}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <p className="font-medium">{line.english}</p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => speakText(line.english)}
                                    className="h-6 w-6 shrink-0"
                                  >
                                    <Volume2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {line.mongolian}
                                </p>
                                {line.pronunciation && (
                                  <p className="text-xs text-pink-400 mt-2">
                                    💡 {line.pronunciation}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Phrases Tab */}
                  <TabsContent value="phrases">
                    <div className="grid gap-4 md:grid-cols-2">
                      {result.keyPhrases.map((phrase, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl h-full">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-lg font-bold text-pink-500">
                                  "{phrase.phrase}"
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => speakText(phrase.phrase)}
                                  className="h-8 w-8 rounded-lg"
                                >
                                  <Volume2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {phrase.meaning}
                              </p>
                              <div className="p-3 bg-muted/30 rounded-xl">
                                <p className="text-sm italic">
                                  📝 {phrase.usage}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Practice Tab */}
                  <TabsContent value="practice">
                    <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-3xl">
                      <CardContent className="pt-6">
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/20 mb-4">
                            <Mic className="h-8 w-8 text-pink-500" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">
                            Дасгал асуултууд
                          </h3>
                          <p className="text-muted-foreground">
                            Эдгээр асуултуудад чанга хариулж дадлага хийгээрэй
                          </p>
                        </div>

                        <div className="space-y-4">
                          {result.practiceQuestions.map((question, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-4 p-4 bg-linear-to-r from-pink-500/10 to-rose-500/10 rounded-xl border border-pink-500/20"
                            >
                              <span className="shrink-0 w-8 h-8 rounded-full bg-pink-500/20 text-pink-500 flex items-center justify-center font-bold">
                                {index + 1}
                              </span>
                              <p className="flex-1 font-medium">{question}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => speakText(question)}
                                className="h-10 w-10 rounded-xl"
                              >
                                <Volume2 className="h-5 w-5" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>

                        <div className="mt-6 p-4 bg-muted/30 rounded-xl">
                          <p className="text-sm text-muted-foreground text-center">
                            💡 <strong>Зөвлөгөө:</strong> Дуу чанга гаргаж ярих
                            нь чухал! Өрөөндөө ганцаараа байгаа юм шиг дадлага
                            хийгээрэй.
                          </p>
                        </div>
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
