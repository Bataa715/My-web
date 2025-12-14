
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import BackButton from '@/components/shared/BackButton';
import CheatSheet from '@/app/tools/programming/components/CheatSheet';
import ConceptCards from '@/app/tools/programming/components/ConceptCards';
import ProgressTracker from '@/app/tools/programming/components/ProgressTracker';
import type { CheatSheetItem, ProgrammingConcept, ProgressItem } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getProgrammingData() {
    try {
        const { firestore: db } = initializeFirebase();

        const conceptsRef = collection(db, "programmingConcepts");
        const conceptsSnap = await getDocs(conceptsRef);
        const concepts = conceptsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgrammingConcept));

        const cheatSheetRef = collection(db, "cheatSheetItems");
        const cheatSheetSnap = await getDocs(cheatSheetRef);
        const cheatSheetItems = cheatSheetSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheatSheetItem));

        const progressItemsRef = collection(db, "progressItems");
        const q = query(progressItemsRef, orderBy("label"));
        const progressItemsSnap = await getDocs(q);
        const progressItems = progressItemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgressItem));

        return { concepts, cheatSheetItems, progressItems };
    } catch (error) {
        console.error("Error fetching programming data:", error);
        return { concepts: [], cheatSheetItems: [], progressItems: [] };
    }
}

export default async function ProgrammingPage() {
    const { concepts, cheatSheetItems, progressItems } = await getProgrammingData();

    return (
        <div className="space-y-8">
            <BackButton />
            <div className="text-center pt-8">
                <h1 className="text-4xl font-bold font-headline">Програмчлал</h1>
                <p className="mt-2 text-muted-foreground">Үндсэн ойлголтууд, хэрэгтэй кодууд, болон ахиц хянагч.</p>
            </div>

            <Tabs defaultValue="concepts" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="concepts">Үндсэн ойлголт</TabsTrigger>
                    <TabsTrigger value="cheatsheet">Cheat Sheet</TabsTrigger>
                    <TabsTrigger value="progress">Ахиц</TabsTrigger>
                </TabsList>
                <TabsContent value="concepts">
                   <ConceptCards concepts={concepts} />
                </TabsContent>
                <TabsContent value="cheatsheet">
                   <CheatSheet items={cheatSheetItems} />
                </TabsContent>
                <TabsContent value="progress">
                    <ProgressTracker initialItems={progressItems} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
