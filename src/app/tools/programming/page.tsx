
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConceptCards from './components/ConceptCards';
import CheatSheet from './components/CheatSheet';
import ProgressTracker from './components/ProgressTracker';
import { getProgrammingConcepts, getCheatSheetItems, getInitialProgressItems } from '@/lib/data';

export default async function ProgrammingPage() {
    const programmingConcepts = await getProgrammingConcepts();
    const cheatSheetItems = await getCheatSheetItems();
    const initialProgressItems = await getInitialProgressItems();

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">💻 Программчлал</h1>
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
