'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ToolPageShell from '@/features/tools/ToolPageShell';
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
} from '@/features/language/data/kana';
import FlashcardGame from '../components/FlashcardGame';
import { useSyncedState } from '@/hooks/use-synced-state';
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
  // Saved to Supabase (with a localStorage cache) so ticks survive redeploys
  // and show up on every device.
  const [memorizedList, setMemorizedList] = useSyncedState<string[]>(
    'kana-memorized',
    []
  );
  const memorized = useMemo(() => new Set(memorizedList), [memorizedList]);

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
    setMemorizedList(prev =>
      prev.includes(char) ? prev.filter(c => c !== char) : [...prev, char]
    );
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
    <ToolPageShell
      title={activeTab === 'hiragana' ? 'Hiragana' : 'Katakana'}
      description={
        activeTab === 'hiragana'
          ? 'Бүх 46 үндсэн Хирагана үсэг + dakuten, handakuten, combo үсгүүд'
          : 'Бүх 46 үндсэн Катакана үсэг + dakuten, handakuten, combo үсгүүд'
      }
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Япон хэл', href: '/tools/japanese' },
        { label: 'Кана' },
      ]}
    >
        <div className="mb-10 grid grid-cols-2 gap-px border border-[#111] bg-[#111] md:grid-cols-5">
          {[
            { value: stats.total, label: 'Нийт үсэг' },
            { value: stats.memorized, label: 'Цээжилсэн' },
            { value: stats.basic, label: 'Үндсэн' },
            { value: stats.dakuten, label: 'Dakuten' },
            { value: stats.combo, label: 'Combo' },
          ].map(item => (
            <div key={item.label} className="bg-[#f3f1ee] px-3 py-4 text-center">
              <div className="text-2xl">{item.value}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#111]/45">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-10">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c41212]">
              Цээжлэлтийн явц
            </span>
            <span className="text-sm text-[#111]/50">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 overflow-hidden bg-[#111]/15">
            <div
              className="h-full bg-[#c41212]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={v => setActiveTab(v as 'hiragana' | 'katakana')}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <TabsList className="rounded-none border border-[#111] bg-transparent">
              <TabsTrigger
                value="hiragana"
                className="rounded-none data-[state=active]:bg-[#c41212] data-[state=active]:text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                ひらがな
              </TabsTrigger>
              <TabsTrigger
                value="katakana"
                className="rounded-none data-[state=active]:bg-[#c41212] data-[state=active]:text-white"
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
                  className="w-40 rounded-none border-[#111]/30 bg-transparent pl-9"
                />
              </div>

              <Select
                value={filter}
                onValueChange={v => setFilter(v as FilterType)}
              >
                <SelectTrigger className="w-36 rounded-none border-[#111]/30 bg-transparent">
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

              <div className="flex gap-1 border border-[#111]/30 p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    viewMode === 'grid' ? 'rounded-none bg-[#c41212] text-white' : 'rounded-none'
                  }
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    viewMode === 'rows' ? 'rounded-none bg-[#c41212] text-white' : 'rounded-none'
                  }
                  onClick={() => setViewMode('rows')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    viewMode === 'game' ? 'rounded-none bg-[#c41212] text-white' : 'rounded-none'
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
                  <Card className="rounded-none border border-[#111] bg-transparent shadow-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base font-normal">
                        <Gamepad2 className="w-5 h-5 text-[#c41212]" />
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
                      className="rounded-none border border-[#111] bg-transparent shadow-none"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 font-normal">
                          <span className="text-[#c41212]">
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
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
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
                  <Card className="rounded-none border border-[#111] bg-transparent shadow-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base font-normal">
                        <Gamepad2 className="w-5 h-5 text-[#c41212]" />
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
                      className="rounded-none border border-[#111] bg-transparent shadow-none"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 font-normal">
                          <span className="text-[#c41212]">
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
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
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
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        {viewMode !== 'game' && (
          <div className="mt-10 flex justify-center">
            <Button
              onClick={() => setViewMode('game')}
              variant="outline"
              className="rounded-none border-[#111] bg-transparent text-[11px] font-semibold uppercase tracking-[0.16em] hover:border-[#c41212] hover:text-[#c41212]"
            >
              <Gamepad2 className="mr-2 h-4 w-4" />
              Flashcard тоглоом
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
    </ToolPageShell>
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
  if (compact) {
    return (
      <button
        type="button"
        onClick={onPlay}
        onContextMenu={e => {
          e.preventDefault();
          onToggle();
        }}
        className={`relative border p-2 transition-colors ${
          isMemorized ? 'border-[#c41212] bg-[#c41212]/8' : 'border-[#111]/25 hover:border-[#111]'
        }`}
      >
        {isMemorized && (
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-[#c41212]">
            <Check className="h-2.5 w-2.5 text-white" />
          </div>
        )}
        <div className="text-2xl">{kana.character}</div>
        <div className="text-[10px] text-[#111]/45">{kana.romaji}</div>
      </button>
    );
  }

  return (
    <div
      className={`group relative cursor-pointer border p-3 ${
        isMemorized ? 'border-[#c41212] bg-[#c41212]/8' : 'border-[#111]/25'
      }`}
    >
      {isMemorized && (
        <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center bg-[#c41212]">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="cursor-pointer text-3xl hover:text-[#c41212]" onClick={onPlay}>
          {kana.character}
        </div>
        <div className="flex flex-col">
          <span className="text-sm">{kana.romaji}</span>
          <span className="text-[10px] capitalize text-[#111]/45">{kana.type}</span>
        </div>
      </div>

      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={e => {
            e.stopPropagation();
            onPlay();
          }}
        >
          <Volume2 className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 ${isMemorized ? 'text-[#c41212]' : ''}`}
          onClick={e => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <Star className={`h-3 w-3 ${isMemorized ? 'fill-current' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
