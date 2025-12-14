'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VocabularyManager from '@/components/shared/VocabularyManager';
import GrammarList from '@/components/shared/GrammarList';
import type { EnglishWord, GrammarRule } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useUser, useFirebase } from '@/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const englishColumns = [
    { key: 'word' as keyof EnglishWord, header: 'English Word' },
    { key: 'meaning' as keyof EnglishWord, header: 'Mongolian Meaning' },
];

export default function EnglishPage() {
    const { firestore } = useFirebase();
    const [initialEnglishWords, setInitialEnglishWords] = useState<EnglishWord[]>([]);
    const [englishGrammar, setEnglishGrammar] = useState<GrammarRule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            const [words, grammar] = await Promise.all([
                getCollectionData<EnglishWord>('englishWords', 'word'),
                getCollectionData<GrammarRule>('englishGrammar', 'title')
            ]);
            setInitialEnglishWords(words);
            setEnglishGrammar(grammar);
            setLoading(false);
        }
        fetchData();
    }, [firestore]);


    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">🇬🇧 Англи хэл</h1>
                <p className="text-muted-foreground">Үгсийн сан болон дүрмээ бататгаарай.</p>
            </div>
            <Tabs defaultValue="vocabulary" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="vocabulary">Үг цээжлэх</TabsTrigger>
                    <TabsTrigger value="grammar">Дүрэм</TabsTrigger>
                </TabsList>
                <TabsContent value="vocabulary" className="mt-6">
                    <VocabularyManager
                        collectionPath="englishWords"
                        initialWords={initialEnglishWords}
                        wordType="english"
                        columns={englishColumns}
                    />
                </TabsContent>
                <TabsContent value="grammar" className="mt-6">
                    <GrammarList rules={englishGrammar} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
