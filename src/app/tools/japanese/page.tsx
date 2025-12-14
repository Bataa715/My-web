'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VocabularyManager from '@/components/shared/VocabularyManager';
import GrammarList from '@/components/shared/GrammarList';
import KanaGrid from './components/KanaGrid';
import type { JapaneseWord, Kana, GrammarRule } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { collection, getDocs, query, orderBy, writeBatch, doc } from 'firebase/firestore';
import BackButton from '@/components/shared/BackButton';

const japaneseColumns = [
    { key: 'word' as keyof JapaneseWord, header: 'Japanese Word' },
    { key: 'romaji' as keyof JapaneseWord, header: 'Romaji' },
    { key: 'meaning' as keyof JapaneseWord, header: 'Mongolian Meaning' },
];

const initialHiraganaData: Omit<Kana, 'id'>[] = [
    { character: 'あ', romaji: 'a' }, { character: 'い', romaji: 'i' }, { character: 'う', romaji: 'u' }, { character: 'え', romaji: 'e' }, { character: 'お', romaji: 'o' },
    { character: 'か', romaji: 'ka' }, { character: 'き', romaji: 'ki' }, { character: 'く', romaji: 'ku' }, { character: 'け', romaji: 'ke' }, { character: 'こ', romaji: 'ko' },
    { character: 'さ', romaji: 'sa' }, { character: 'し', romaji: 'shi' }, { character: 'す', romaji: 'su' }, { character: 'せ', romaji: 'se' }, { character: 'そ', romaji: 'so' },
];

const initialKatakanaData: Omit<Kana, 'id'>[] = [
    { character: 'ア', romaji: 'a' }, { character: 'イ', romaji: 'i' }, { character: 'ウ', romaji: 'u' }, { character: 'エ', romaji: 'e' }, { character: 'オ', romaji: 'o' },
    { character: 'カ', romaji: 'ka' }, { character: 'キ', romaji: 'ki' }, { character: 'ク', romaji: 'ku' }, { character: 'ケ', romaji: 'ke' }, { character: 'コ', romaji: 'ko' },
    { character: 'サ', romaji: 'sa' }, { character: 'シ', romaji: 'shi' }, { character: 'ス', romaji: 'su' }, { character: 'セ', romaji: 'se' }, { character: 'ソ', romaji: 'so' },
];

const initialJapaneseWordsData: Omit<JapaneseWord, 'id' | 'memorized'>[] = [
    { word: 'こんにちは', romaji: 'konnichiwa', meaning: 'сайн уу' },
    { word: 'ありがとう', romaji: 'arigatou', meaning: 'баярлалаа' },
    { word: 'はい', romaji: 'hai', meaning: 'тийм' },
    { word: 'いいえ', romaji: 'iie', meaning: 'үгүй' },
];

const initialJapaneseGrammarData: Omit<GrammarRule, 'id'>[] = [
    { title: 'です (desu)', explanation: 'Tohirhoi, medegdel, tailbarlahad hereglene.', examples: ['これは本です。 (Kore wa hon desu.) - Энэ бол ном.'] },
    { title: 'は (wa) and が (ga)', explanation: 'Subjectiin temdeglel.', examples: ['私は学生です。 (Watashi wa gakusei desu.) - Би оюутан.'] },
];


export default function JapanesePage() {
    const { firestore } = useFirebase();
    const [hiragana, setHiragana] = useState<Kana[]>([]);
    const [katakana, setKatakana] = useState<Kana[]>([]);
    const [initialJapaneseWords, setInitialJapaneseWords] = useState<JapaneseWord[]>([]);
    const [japaneseGrammar, setJapaneseGrammar] = useState<GrammarRule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore) return;

        async function seedCollection(collectionName: string, data: any[]) {
            const collectionRef = collection(firestore, collectionName);
            const snapshot = await getDocs(query(collectionRef));
            if (snapshot.empty) {
                console.log(`Seeding ${collectionName}...`);
                const batch = writeBatch(firestore);
                data.forEach(item => {
                    const docRef = doc(collectionRef);
                    if (collectionName.includes('Words')) {
                        batch.set(docRef, {...item, memorized: false });
                    } else {
                        batch.set(docRef, item);
                    }
                });
                await batch.commit();
            }
        }

        async function getCollectionData<T>(collectionName: string, orderByField: string): Promise<T[]> {
            try {
                const colRef = collection(firestore, collectionName);
                const q = query(colRef, orderBy(orderByField, 'asc'));
                const snapshot = await getDocs(q);
                if (snapshot.empty) return [];
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
            } catch (error) {
                console.error(`Error fetching ${collectionName}:`, error);
                return [];
            }
        }
        
        async function fetchData() {
            setLoading(true);
            await Promise.all([
                seedCollection('hiragana', initialHiraganaData),
                seedCollection('katakana', initialKatakanaData),
                seedCollection('japaneseWords', initialJapaneseWordsData),
                seedCollection('japaneseGrammar', initialJapaneseGrammarData),
            ]);

            const [h, k, w, g] = await Promise.all([
                getCollectionData<Kana>('hiragana', 'romaji'),
                getCollectionData<Kana>('katakana', 'romaji'),
                getCollectionData<JapaneseWord>('japaneseWords', 'word'),
                getCollectionData<GrammarRule>('japaneseGrammar', 'title'),
            ]);
            setHiragana(h);
            setKatakana(k);
            setInitialJapaneseWords(w);
            setJapaneseGrammar(g);
            setLoading(false);
        }
        fetchData();
    }, [firestore]);

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-8">
            <BackButton />
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">Япон хэл</h1>
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
