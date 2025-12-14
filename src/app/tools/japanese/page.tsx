
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VocabularyManager from '@/components/shared/VocabularyManager';
import GrammarList from '@/components/shared/GrammarList';
import KanaGrid from './components/KanaGrid';
import { getHiragana, getKatakana, getJapaneseWords, getJapaneseGrammar } from '@/lib/data';
import type { JapaneseWord } from '@/lib/types';

const japaneseColumns = [
    { key: 'word' as keyof JapaneseWord, header: 'Japanese Word' },
    { key: 'romaji' as keyof JapaneseWord, header: 'Romaji' },
    { key: 'meaning' as keyof JapaneseWord, header: 'Mongolian Meaning' },
];

export default async function JapanesePage() {
    const hiragana = await getHiragana();
    const katakana = await getKatakana();
    const initialJapaneseWords = await getJapaneseWords();
    const japaneseGrammar = await getJapaneseGrammar();

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
                    <KanaGrid kana={hiragana} title="Hiragana" storageKey="hiragana-memorized" />
                </TabsContent>
                <TabsContent value="katakana" className="mt-6">
                    <KanaGrid kana={katakana} title="Katakana" storageKey="katakana-memorized" />
                </TabsContent>
                <TabsContent value="vocabulary" className="mt-6">
                    <VocabularyManager
                        storageKey="japanese-words"
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
