
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VocabularyManager from '@/components/shared/VocabularyManager';
import GrammarList from '@/components/shared/GrammarList';
import { getEnglishWords, getEnglishGrammar } from '@/lib/data';
import type { EnglishWord } from '@/lib/types';

const englishColumns = [
    { key: 'word' as keyof EnglishWord, header: 'English Word' },
    { key: 'meaning' as keyof EnglishWord, header: 'Mongolian Meaning' },
];

export default async function EnglishPage() {
    const initialEnglishWords = await getEnglishWords();
    const englishGrammar = await getEnglishGrammar();

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
                        storageKey="english-words"
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
