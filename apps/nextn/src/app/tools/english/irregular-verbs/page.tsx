'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Volume2, Shuffle } from 'lucide-react';
import { initialEnglishWords } from '@/features/language/data/english';
import { cn } from '@/lib/utils';
import ToolPageShell from '@/features/tools/ToolPageShell';

const irregularVerbs = initialEnglishWords.filter(word =>
  word.word.includes(' - ')
);

export default function IrregularVerbsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [shuffled, setShuffled] = useState(false);

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const baseForm = text.split(' - ')[0];
      const utterance = new SpeechSynthesisUtterance(baseForm);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredVerbs = useMemo(() => {
    let verbs = [...irregularVerbs];
    if (shuffled) verbs = verbs.sort(() => Math.random() - 0.5);
    if (!searchQuery.trim()) return verbs;
    const query = searchQuery.toLowerCase();
    return verbs.filter(
      verb =>
        verb.word.toLowerCase().includes(query) ||
        verb.translation.toLowerCase().includes(query)
    );
  }, [searchQuery, shuffled]);

  return (
    <ToolPageShell
      title="Verbs"
      description="Англи хэлний дүрмийн бус үйл үгс"
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Англи хэл', href: '/tools/english' },
        { label: 'Үйл үг' },
      ]}
    >
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111]/40" />
          <Input
            placeholder="Үг хайх..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="rounded-none border-[#111]/25 bg-transparent pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShuffled(!shuffled)}
          className={cn(
            'rounded-none border-[#111]/30 bg-transparent text-[11px] font-semibold uppercase tracking-[0.16em]',
            shuffled && 'border-[#c41212] bg-[#c41212] text-white hover:bg-[#c41212]'
          )}
        >
          <Shuffle className="mr-2 h-4 w-4" />
          {shuffled ? 'Холигдсон' : 'Холих'}
        </Button>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c41212]">
          {filteredVerbs.length} үйл үг
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#111] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111]/45">
              <th className="py-3 pr-3">#</th>
              <th className="py-3 pr-3">Base</th>
              <th className="py-3 pr-3">Past</th>
              <th className="py-3 pr-3">P.P.</th>
              <th className="py-3 pr-3">Орчуулга</th>
              <th className="hidden py-3 pr-3 lg:table-cell">Тайлбар</th>
              <th className="w-10 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#111]/15">
            {filteredVerbs.map((verb, index) => {
              const [baseForm = '', pastSimple = '', pastParticiple = ''] =
                verb.word.split(' - ');
              return (
                <tr key={`${verb.word}-${index}`} className="align-top">
                  <td className="py-4 pr-3 text-[#111]/40">{index + 1}</td>
                  <td className="py-4 pr-3 font-medium">{baseForm}</td>
                  <td className="py-4 pr-3">{pastSimple}</td>
                  <td className="py-4 pr-3">{pastParticiple}</td>
                  <td className="py-4 pr-3">{verb.translation}</td>
                  <td className="hidden py-4 pr-3 text-[#111]/50 lg:table-cell">
                    {verb.definition}
                  </td>
                  <td className="py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => speakWord(verb.word)}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredVerbs.length === 0 && (
          <p className="py-12 text-center text-sm text-[#111]/45">
            Хайлтад тохирох үг олдсонгүй
          </p>
        )}
      </div>

      <ul className="mt-16 divide-y divide-[#111]">
        {[
          ['Base Form (V1)', 'Үндсэн хэлбэр — Present Simple', 'go, eat, write'],
          ['Past Simple (V2)', 'Өнгөрсөн цаг — Past Simple', 'went, ate, wrote'],
          ['Past Participle (V3)', 'Perfect болон Passive', 'gone, eaten, written'],
        ].map(([tag, title, example]) => (
          <li key={tag} className="flex items-start gap-4 py-6 sm:gap-8">
            <span className="w-28 shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
              {tag}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg">{title}</span>
              <span className="block text-xs text-[#111]/50">{example}</span>
            </span>
          </li>
        ))}
      </ul>
    </ToolPageShell>
  );
}
