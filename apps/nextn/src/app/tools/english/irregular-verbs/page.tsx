'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import BackButton from '@/components/shared/BackButton';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Volume2, BookOpen, Shuffle } from 'lucide-react';
import { initialEnglishWords } from '@/data/english';
import { cn } from '@/lib/utils';

// Filter only irregular verbs (those with " - " pattern)
const irregularVerbs = initialEnglishWords.filter(word =>
  word.word.includes(' - ')
);

export default function IrregularVerbsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [shuffled, setShuffled] = useState(false);

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Get just the base form for pronunciation
      const baseForm = text.split(' - ')[0];
      const utterance = new SpeechSynthesisUtterance(baseForm);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredVerbs = useMemo(() => {
    let verbs = [...irregularVerbs];

    if (shuffled) {
      verbs = verbs.sort(() => Math.random() - 0.5);
    }

    if (!searchQuery.trim()) return verbs;

    const query = searchQuery.toLowerCase();
    return verbs.filter(
      verb =>
        verb.word.toLowerCase().includes(query) ||
        verb.translation.toLowerCase().includes(query)
    );
  }, [searchQuery, shuffled]);

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <InteractiveParticles quantity={30} />
      </div>

      <motion.div
        className="space-y-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BackButton />

        {/* Hero Section */}
        <div className="text-center pt-8 flex flex-col items-center justify-center gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 via-amber-500/30 to-yellow-500/30 blur-3xl rounded-full scale-150" />
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm border border-orange-500/20">
              <BookOpen className="h-12 w-12 text-orange-400" />
            </div>
          </motion.div>

          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-headline bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Irregular Verbs
          </motion.h1>

          <motion.p
            className="text-muted-foreground max-w-xl text-sm md:text-base px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Англи хэлний дүрмийн бус үйл үгс
          </motion.p>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-orange-500/20 text-orange-300"
            >
              {irregularVerbs.length} үйл үг
            </Badge>
          </div>
        </div>

        {/* Search and Controls */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Үг хайх..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 w-full"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShuffled(!shuffled)}
                className={cn(
                  'w-full sm:w-auto',
                  shuffled ? 'bg-orange-500/20 border-orange-500/50' : ''
                )}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                {shuffled ? 'Холигдсон' : 'Холих'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verbs Table */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <BookOpen className="h-5 w-5" />
              Irregular Verbs хүснэгт
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold w-8 md:w-12 text-xs md:text-sm">
                      #
                    </TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm">
                      Base
                    </TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm">
                      Past
                    </TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm">
                      P.P.
                    </TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm">
                      Орчуулга
                    </TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">
                      Тайлбар
                    </TableHead>
                    <TableHead className="w-10 md:w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVerbs.map((verb, index) => {
                    const parts = verb.word.split(' - ');
                    const baseForm = parts[0] || '';
                    const pastSimple = parts[1] || '';
                    const pastParticiple = parts[2] || '';

                    return (
                      <TableRow
                        key={index}
                        className="hover:bg-orange-500/5 transition-colors"
                      >
                        <TableCell className="text-muted-foreground text-xs md:text-sm px-1 md:px-4">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-orange-300 text-xs md:text-sm px-1 md:px-4">
                          {baseForm}
                        </TableCell>
                        <TableCell className="text-amber-300 text-xs md:text-sm px-1 md:px-4">
                          {pastSimple}
                        </TableCell>
                        <TableCell className="text-yellow-300 text-xs md:text-sm px-1 md:px-4">
                          {pastParticiple}
                        </TableCell>
                        <TableCell className="text-foreground text-xs md:text-sm px-1 md:px-4">
                          {verb.translation}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">
                          {verb.definition}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-orange-400"
                            onClick={() => speakWord(verb.word)}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredVerbs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Хайлтад тохирох үг олдсонгүй
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Reference Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Формат тайлбар</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <h4 className="font-semibold text-orange-300 mb-2">
                  Base Form (V1)
                </h4>
                <p className="text-sm text-muted-foreground">
                  Үндсэн хэлбэр - Present Simple-д хэрэглэнэ
                </p>
                <p className="text-sm mt-2 text-orange-200">
                  Жишээ: go, eat, write
                </p>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <h4 className="font-semibold text-amber-300 mb-2">
                  Past Simple (V2)
                </h4>
                <p className="text-sm text-muted-foreground">
                  Өнгөрсөн цаг - Past Simple-д хэрэглэнэ
                </p>
                <p className="text-sm mt-2 text-amber-200">
                  Жишээ: went, ate, wrote
                </p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <h4 className="font-semibold text-yellow-300 mb-2">
                  Past Participle (V3)
                </h4>
                <p className="text-sm text-muted-foreground">
                  Perfect tense болон Passive voice-д хэрэглэнэ
                </p>
                <p className="text-sm mt-2 text-yellow-200">
                  Жишээ: gone, eaten, written
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
