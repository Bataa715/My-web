'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import BackButton from '@/components/shared/BackButton';
import {
  Volume2,
  BookOpen,
  Gamepad2,
  Search,
  Filter,
  Grid,
  List,
  Check,
  Star,
  ChevronRight,
} from 'lucide-react';
import {
  hiraganaData,
  katakanaData,
  kanaRows,
  kanaRowsKatakana,
  KanaCharacter,
} from '@/data/kana';
import FlashcardGame from '../components/FlashcardGame';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ViewMode = 'grid' | 'rows' | 'game';
type FilterType =
  | 'all'
  | 'vowel'
  | 'consonant'
  | 'dakuten'
  | 'handakuten'
  | 'combo';

export default function KanaPage() {
  const [activeTab, setActiveTab] = useState<'hiragana' | 'katakana'>(
    'hiragana'
  );
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [memorized, setMemorized] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kana-memorized');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  const currentData = activeTab === 'hiragana' ? hiraganaData : katakanaData;
  const currentRows = activeTab === 'hiragana' ? kanaRows : kanaRowsKatakana;

  const filteredData = useMemo(() => {
    let data = currentData;

    if (filter !== 'all') {
      data = data.filter(k => k.type === filter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        k =>
          k.character.includes(query) || k.romaji.toLowerCase().includes(query)
      );
    }

    return data;
  }, [currentData, filter, searchQuery]);

  const groupedData = useMemo(() => {
    const groups: Record<string, KanaCharacter[]> = {};

    filteredData.forEach(kana => {
      const row = kana.row || 'other';
      if (!groups[row]) {
        groups[row] = [];
      }
      groups[row].push(kana);
    });

    return groups;
  }, [filteredData]);

  const playSound = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleMemorized = (char: string) => {
    const newMemorized = new Set(memorized);
    if (newMemorized.has(char)) {
      newMemorized.delete(char);
    } else {
      newMemorized.add(char);
    }
    setMemorized(newMemorized);
    localStorage.setItem('kana-memorized', JSON.stringify([...newMemorized]));
  };

  const stats = {
    total: currentData.length,
    memorized: currentData.filter(k => memorized.has(k.character)).length,
    basic: currentData.filter(k => k.type === 'vowel' || k.type === 'consonant')
      .length,
    dakuten: currentData.filter(
      k => k.type === 'dakuten' || k.type === 'handakuten'
    ).length,
    combo: currentData.filter(k => k.type === 'combo').length,
  };

  const progress = (stats.memorized / stats.total) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <InteractiveParticles />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <BackButton />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 bg-clip-text text-transparent mb-4">
            {activeTab === 'hiragana' ? 'ひらがな' : 'カタカナ'}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {activeTab === 'hiragana'
              ? 'Бүх 46 үндсэн Хирагана үсэг + dakuten, handakuten, combo үсгүүд'
              : 'Бүх 46 үндсэн Катакана үсэг + dakuten, handakuten, combo үсгүүд'}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <Card className="bg-card/50 backdrop-blur-xl border-0">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-rose-400">
                {stats.total}
              </div>
              <div className="text-xs text-muted-foreground">Нийт үсэг</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-0">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-400">
                {stats.memorized}
              </div>
              <div className="text-xs text-muted-foreground">Цээжилсэн</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-0">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">
                {stats.basic}
              </div>
              <div className="text-xs text-muted-foreground">Үндсэн</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-0">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">
                {stats.dakuten}
              </div>
              <div className="text-xs text-muted-foreground">Dakuten</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-0 col-span-2 md:col-span-1">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">
                {stats.combo}
              </div>
              <div className="text-xs text-muted-foreground">Combo</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Цээжлэлтийн явц</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={v => setActiveTab(v as 'hiragana' | 'katakana')}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger
                value="hiragana"
                className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                ひらがな
              </TabsTrigger>
              <TabsTrigger
                value="katakana"
                className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                カタカナ
              </TabsTrigger>
            </TabsList>

            {/* View Mode & Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Хайх..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 w-40 bg-white/5 border-white/10"
                />
              </div>

              <Select
                value={filter}
                onValueChange={v => setFilter(v as FilterType)}
              >
                <SelectTrigger className="w-36 bg-white/5 border-white/10">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүгд</SelectItem>
                  <SelectItem value="vowel">Эгшиг</SelectItem>
                  <SelectItem value="consonant">Гийгүүлэгч</SelectItem>
                  <SelectItem value="dakuten">Dakuten</SelectItem>
                  <SelectItem value="handakuten">Handakuten</SelectItem>
                  <SelectItem value="combo">Combo</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    viewMode === 'grid' ? 'bg-rose-500/20 text-rose-400' : ''
                  }
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    viewMode === 'rows' ? 'bg-rose-500/20 text-rose-400' : ''
                  }
                  onClick={() => setViewMode('rows')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    viewMode === 'game' ? 'bg-rose-500/20 text-rose-400' : ''
                  }
                  onClick={() => setViewMode('game')}
                >
                  <Gamepad2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="hiragana" className="mt-0">
            <AnimatePresence mode="wait">
              {viewMode === 'game' ? (
                <motion.div
                  key="game"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="bg-card/50 backdrop-blur-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5 text-rose-400" />
                        Flashcard Дадлага
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FlashcardGame
                        type="hiragana"
                        onClose={() => setViewMode('grid')}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : viewMode === 'rows' ? (
                <motion.div
                  key="rows"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {Object.entries(groupedData).map(([rowKey, chars]) => (
                    <Card
                      key={rowKey}
                      className="bg-card/50 backdrop-blur-xl border-0"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-rose-400">
                            {currentRows[rowKey as keyof typeof currentRows]}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {chars.map((kana, index) => (
                            <KanaCard
                              key={index}
                              kana={kana}
                              isMemorized={memorized.has(kana.character)}
                              onPlay={() => playSound(kana.character)}
                              onToggle={() => toggleMemorized(kana.character)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="bg-card/50 backdrop-blur-xl border-0">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                        {filteredData.map((kana, index) => (
                          <KanaCard
                            key={index}
                            kana={kana}
                            isMemorized={memorized.has(kana.character)}
                            onPlay={() => playSound(kana.character)}
                            onToggle={() => toggleMemorized(kana.character)}
                            compact
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="katakana" className="mt-0">
            <AnimatePresence mode="wait">
              {viewMode === 'game' ? (
                <motion.div
                  key="game"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="bg-card/50 backdrop-blur-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5 text-pink-400" />
                        Flashcard Дадлага
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FlashcardGame
                        type="katakana"
                        onClose={() => setViewMode('grid')}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : viewMode === 'rows' ? (
                <motion.div
                  key="rows"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {Object.entries(groupedData).map(([rowKey, chars]) => (
                    <Card
                      key={rowKey}
                      className="bg-card/50 backdrop-blur-xl border-0"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-pink-400">
                            {currentRows[rowKey as keyof typeof currentRows]}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {chars.map((kana, index) => (
                            <KanaCard
                              key={index}
                              kana={kana}
                              isMemorized={memorized.has(kana.character)}
                              onPlay={() => playSound(kana.character)}
                              onToggle={() => toggleMemorized(kana.character)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="bg-card/50 backdrop-blur-xl border-0">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                        {filteredData.map((kana, index) => (
                          <KanaCard
                            key={index}
                            kana={kana}
                            isMemorized={memorized.has(kana.character)}
                            onPlay={() => playSound(kana.character)}
                            onToggle={() => toggleMemorized(kana.character)}
                            compact
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        {/* Quick Practice Button */}
        {viewMode !== 'game' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Button
              onClick={() => setViewMode('game')}
              size="lg"
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-500/25 rounded-full px-6"
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              Flashcard тоглоом
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Kana Card Component
interface KanaCardProps {
  kana: KanaCharacter;
  isMemorized: boolean;
  onPlay: () => void;
  onToggle: () => void;
  compact?: boolean;
}

function KanaCard({
  kana,
  isMemorized,
  onPlay,
  onToggle,
  compact = false,
}: KanaCardProps) {
  const getTypeColor = () => {
    switch (kana.type) {
      case 'vowel':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'consonant':
        return 'from-rose-500/20 to-pink-500/20 border-rose-500/30';
      case 'dakuten':
        return 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
      case 'handakuten':
        return 'from-purple-500/20 to-violet-500/20 border-purple-500/30';
      case 'combo':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
    }
  };

  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPlay}
        onContextMenu={e => {
          e.preventDefault();
          onToggle();
        }}
        className={`
          relative p-2 rounded-xl bg-gradient-to-br ${getTypeColor()}
          border transition-all duration-200 group
          ${isMemorized ? 'ring-2 ring-green-500/50' : ''}
        `}
      >
        {isMemorized && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        <div className="text-2xl font-bold">{kana.character}</div>
        <div className="text-[10px] text-muted-foreground">{kana.romaji}</div>
      </motion.button>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        relative p-3 rounded-xl bg-gradient-to-br ${getTypeColor()}
        border transition-all duration-200 group cursor-pointer
        ${isMemorized ? 'ring-2 ring-green-500/50' : ''}
      `}
    >
      {isMemorized && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          className="text-3xl font-bold cursor-pointer hover:text-rose-400 transition-colors"
          onClick={onPlay}
        >
          {kana.character}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{kana.romaji}</span>
          <span className="text-[10px] text-muted-foreground capitalize">
            {kana.type}
          </span>
        </div>
      </div>

      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={e => {
            e.stopPropagation();
            onPlay();
          }}
        >
          <Volume2 className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 ${isMemorized ? 'text-green-400' : ''}`}
          onClick={e => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <Star className={`w-3 h-3 ${isMemorized ? 'fill-current' : ''}`} />
        </Button>
      </div>
    </motion.div>
  );
}
