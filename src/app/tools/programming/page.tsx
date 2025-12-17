
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import BackButton from '@/components/shared/BackButton';
import CheatSheet from '@/app/tools/programming/components/CheatSheet';
import ConceptCards from '@/app/tools/programming/components/ConceptCards';
import ProgressTracker from '@/app/tools/programming/components/ProgressTracker';
import type { CheatSheetItem, ProgrammingConcept, ProgressItem } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

export default function ProgrammingPage() {
    const { firestore, user } = useFirebase();
    const [concepts, setConcepts] = useState<ProgrammingConcept[]>([]);
    const [cheatSheetItems, setCheatSheetItems] = useState<CheatSheetItem[]>([]);
    const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !firestore) {
            setLoading(false);
            return;
        }
        const getProgrammingData = async () => {
            setLoading(true);
            try {
                const basePath = `users/${user.uid}`;
                const conceptsRef = collection(firestore, `${basePath}/programmingConcepts`);
                const conceptsSnap = await getDocs(conceptsRef);
                const conceptsData = conceptsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgrammingConcept));
                setConcepts(conceptsData);

                const cheatSheetRef = collection(firestore, `${basePath}/cheatSheetItems`);
                const cheatSheetSnap = await getDocs(cheatSheetRef);
                const cheatSheetItemsData = cheatSheetSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheatSheetItem));
                setCheatSheetItems(cheatSheetItemsData);

                const progressItemsRef = collection(firestore, `${basePath}/progressItems`);
                const q = query(progressItemsRef, orderBy("label"));
                const progressItemsSnap = await getDocs(q);
                const progressItemsData = progressItemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgressItem));
                setProgressItems(progressItemsData);

            } catch (error) {
                console.error("Error fetching programming data:", error);
            } finally {
                setLoading(false);
            }
        }
        
        getProgrammingData();

    }, [firestore, user]);


    return (
        <div className="space-y-8">
            <BackButton />
            <div className="text-center pt-8">
                <h1 className="text-4xl font-bold">Програмчлал</h1>
                <p className="mt-2 text-muted-foreground">Үндсэн ойлголтууд, хэрэгтэй кодууд, болон ахиц хянагч.</p>
            </div>

            <Tabs defaultValue="concepts" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="concepts">Үндсэн ойлголт</TabsTrigger>
                    <TabsTrigger value="cheatsheet">Cheat Sheet</TabsTrigger>
                    <TabsTrigger value="progress">Ахиц</TabsTrigger>
                </TabsList>
                {loading ? (
                     <div className="mt-4 space-y-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : !user ? (
                    <div className="text-center py-10 mt-4">
                        <p className="text-muted-foreground">Програмчлалын хэрэгслүүдийг харахын тулд нэвтэрнэ үү.</p>
                    </div>
                ): (
                    <>
                        <TabsContent value="concepts">
                           <ConceptCards concepts={concepts} />
                        </TabsContent>
                        <TabsContent value="cheatsheet">
                           <CheatSheet items={cheatSheetItems} />
                        </TabsContent>
                        <TabsContent value="progress">
                            <ProgressTracker initialItems={progressItems} />
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}
