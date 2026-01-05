'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { Kana } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/shared/BackButton';
import KanaGrid from '@/app/tools/japanese/components/KanaGrid';

export default function KanaPage() {
  const { firestore } = useFirebase();
  const [hiragana, setHiragana] = useState<Kana[]>([]);
  const [katakana, setKatakana] = useState<Kana[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getKanaData = async () => {
      if (!firestore) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const hiraganaSnap = await getDocs(collection(firestore, 'hiragana'));
        const hiraganaData = hiraganaSnap.docs.map(
          doc => ({ id: doc.id, ...doc.data() }) as Kana
        );
        setHiragana(hiraganaData);

        const katakanaSnap = await getDocs(collection(firestore, 'katakana'));
        const katakanaData = katakanaSnap.docs.map(
          doc => ({ id: doc.id, ...doc.data() }) as Kana
        );
        setKatakana(katakanaData);
      } catch (error) {
        console.error('Error fetching Kana data:', error);
      } finally {
        setLoading(false);
      }
    };

    getKanaData();
  }, [firestore]);

  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center pt-8">
        <h1 className="text-4xl font-bold">Кана үсэг (かな)</h1>
        <p className="mt-2 text-muted-foreground">
          Япон хэлний авианы бичлэгүүд.
        </p>
      </div>

      <Tabs defaultValue="hiragana" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hiragana">Хирагана (ひらがな)</TabsTrigger>
          <TabsTrigger value="katakana">Катакана (カタカナ)</TabsTrigger>
        </TabsList>
        {loading ? (
          <div className="mt-4">
            <Skeleton className="h-96 w-full" />
          </div>
        ) : (
          <>
            <TabsContent value="hiragana">
              <KanaGrid
                kana={hiragana}
                title="Хирагана үсгүүд"
                collectionPath="hiragana"
              />
            </TabsContent>
            <TabsContent value="katakana">
              <KanaGrid
                kana={katakana}
                title="Катакана үсгүүд"
                collectionPath="katakana"
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
