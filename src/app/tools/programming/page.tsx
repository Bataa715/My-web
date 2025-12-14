'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConceptCards from './components/ConceptCards';
import CheatSheet from './components/CheatSheet';
import ProgressTracker from './components/ProgressTracker';
import type { ProgrammingConcept, CheatSheetItem, ProgressItem } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { collection, getDocs, query, orderBy, writeBatch, doc } from 'firebase/firestore';

const initialProgrammingConceptsData: Omit<ProgrammingConcept, 'id'>[] = [
    { title: 'Variable', emoji: '📦', explanation: 'Utga hadgalah sav.' },
    { title: 'Function', emoji: '🛠️', explanation: 'Todorhoi uildel hiideg kodnii tsugluulga.' },
    { title: 'Loop', emoji: '🔄', explanation: 'Todorhoi kodnii hesegig olon udaa davtan guitsetgene.' },
];

const initialCheatSheetItemsData: Omit<CheatSheetItem, 'id'>[] = [
    { title: 'Create React Component', snippet: 'function MyComponent() {\n  return <div>Hello</div>;\n}' },
    { title: 'CSS Center a Div', snippet: 'display: flex;\njustify-content: center;\nalign-items: center;' },
];

const initialProgressItemsData: Omit<ProgressItem, 'id' | 'learned' | 'practicing'>[] = [
    { label: 'HTML' },
    { label: 'CSS' },
    { label: 'JavaScript' },
    { label: 'React' },
    { label: 'Next.js' },
];


export default function ProgrammingPage() {
    const { firestore } = useFirebase();
    const [programmingConcepts, setProgrammingConcepts] = useState<ProgrammingConcept[]>([]);
    const [cheatSheetItems, setCheatSheetItems] = useState<CheatSheetItem[]>([]);
    const [initialProgressItems, setInitialProgressItems] = useState<ProgressItem[]>([]);
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
                     if (collectionName === 'progressItems') {
                        batch.set(docRef, {...item, learned: false, practicing: false });
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
                seedCollection('programmingConcepts', initialProgrammingConceptsData),
                seedCollection('cheatSheetItems', initialCheatSheetItemsData),
                seedCollection('progressItems', initialProgressItemsData)
            ]);

            const [concepts, cheats, progress] = await Promise.all([
                getCollectionData<ProgrammingConcept>('programmingConcepts', 'title'),
                getCollectionData<CheatSheetItem>('cheatSheetItems', 'title'),
                getCollectionData<ProgressItem>('progressItems', 'label')
            ]);
            setProgrammingConcepts(concepts);
            setCheatSheetItems(cheats);
            setInitialProgressItems(progress);
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
                <h1 className="text-3xl font-bold font-headline">Программчлал</h1>
                <p className="text-muted-foreground">Үндсэн ойлголт, хэрэгтэй кодууд, болон ахицаа хянах хэсэг.</p>
            </div>
            <Tabs defaultValue="concepts" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="concepts">Concepts</TabsTrigger>
                    <TabsTrigger value="cheatsheet">Cheat Sheet</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>
                <TabsContent value="concepts" className="mt-6">
                    <ConceptCards concepts={programmingConcepts} />
                </TabsContent>
                <TabsContent value="cheatsheet" className="mt-6">
                    <CheatSheet items={cheatSheetItems} />
                </TabsContent>
                <TabsContent value="progress" className="mt-6">
                    <ProgressTracker initialItems={initialProgressItems} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
