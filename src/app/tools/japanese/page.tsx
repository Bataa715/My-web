'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VocabularyManager from '@/components/shared/VocabularyManager';
import GrammarList from '@/components/shared/GrammarList';
import KanaGrid from './components/KanaGrid';
import { getHiragana, getKatakana, getJapaneseWords, getJapaneseGrammar } from '@/lib/data';
import type { JapaneseWord, Kana, GrammarRule } from '@/lib/types';

const japaneseColumns = [
    { key: 'word' as keyof JapaneseWord, header: 'Japanese Word' },
    { key: 'romaji' as keyof JapaneseWord, header: 'Romaji' },
    { key: 'meaning' as keyof JapaneseWord, header: 'Mongolian Meaning' },
];

export default function JapanesePage() {
    const [hiragana, setHiragana] = useState<Kana[]>([]);
    const [katakana, setKatakana] = useState<Kana[]>([]);
    const [initialJapaneseWords, setInitialJapaneseWords] = useState<JapaneseWord[]>([]);
    const [japaneseGrammar, setJapaneseGrammar] = useState<GrammarRule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [h, k, w, g] = await Promise.all([
                getHiragana(),
                getKatakana(),
                getJapaneseWords(),
                getJapaneseGrammar(),
            ]);
            setHiragana(h);
            setKatakana(k);
            setInitialJapaneseWords(w);
            setJapaneseGrammar(g);
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">🇯🇵 Япон хэл</h1>
                <p className="text-muted-foreground">Үсэг, үг, дүрмээ давтан суралцаарай.</p>
            </div>
            <Tabs defaultValue="hiragana" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="hiragana">Hiragana</TabsTrigger>
                    <TabsTrigger value="katakana">Katakana</TabsTrigger>
                    <TabsTrigger value="vocabulary">Үг цээжлэх</TabsTrigger>
                    <TabsTrigger value="grammar">Дүрэм</TabsTrigger>
                </TabsList>
                <TabsContent value="hiragana" className="mt-6">
                    <KanaGrid kana={hiragana} title="Hiragana" collectionPath="hiragana" />
                </TabsContent>
                <TabsContent value="katakana" className="mt-6">
                    <KanaGrid kana={katakana} title="Katakana" collectionPath="katakana" />
                </TabsContent>
                <TabsContent value="vocabulary" className="mt-6">
                    <VocabularyManager
                        collectionPath="japaneseWords"
                        initialWords={initialJapaneseWords}
                        wordType="japanese"
                        columns={japaneseColumns}
                    />
                </TabsContent>
                <TabsContent value="grammar" className="mt-6">
                    <GrammarList rules={japaneseGrammar} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
