'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VocabularyManager from '@/components/shared/VocabularyManager';
import GrammarList from '@/components/shared/GrammarList';
import type { EnglishWord, GrammarRule } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, getDocs, query, orderBy, writeBatch, doc } from 'firebase/firestore';
import BackButton from '@/components/shared/BackButton';

const englishColumns = [
    { key: 'word' as keyof EnglishWord, header: 'English Word' },
    { key: 'meaning' as keyof EnglishWord, header: 'Mongolian Meaning' },
];

const initialEnglishWordsData: Omit<EnglishWord, 'id' | 'memorized'>[] = [
    { word: 'apple', meaning: 'алим' },
    { word: 'book', meaning: 'ном' },
    { word: 'cat', meaning: 'муур' },
    { word: 'dog', meaning: 'нохой' },
    { word: 'house', meaning: 'байшин' },
];

const initialEnglishGrammarData: Omit<GrammarRule, 'id'>[] = [
    { title: 'Present Simple', explanation: 'Одоо, энгийн цаг.', examples: ['I go to school.', 'She works in an office.'] },
    { title: 'Past Simple', explanation: 'Өнгөрсөн, энгийн цаг.', examples: ['I went to the cinema yesterday.', 'They visited their grandparents.'] },
];


export default function EnglishPage() {
    const { firestore } = useFirebase();
    const [initialEnglishWords, setInitialEnglishWords] = useState<EnglishWord[]>([]);
    const [englishGrammar, setEnglishGrammar] = useState<GrammarRule[]>([]);
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
                seedCollection('englishWords', initialEnglishWordsData),
                seedCollection('englishGrammar', initialEnglishGrammarData)
            ]);

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
            <BackButton />
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">Англи хэл</h1>
                <p className="text-muted-foreground">Үгсийн сан болон дүрмээ бататгаарай.</p>
            </div>
            <div className="space-y-8">
                <VocabularyManager
                    collectionPath="englishWords"
                    initialWords={initialEnglishWords}
                    wordType="english"
                    columns={englishColumns}
                />
                <GrammarList rules={englishGrammar} />
            </div>
        </div>
    );
}
