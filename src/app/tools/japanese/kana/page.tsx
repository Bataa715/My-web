'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { Kana } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/shared/BackButton';
import KanaGrid from '@/app/tools/japanese/components/KanaGrid';
import { motion } from 'framer-motion';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import { Languages } from 'lucide-react';

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
    <div className="min-h-screen relative">
      {/* Background Particles */}
      <div className="fixed inset-0 -z-10">
        <InteractiveParticles quantity={30} />
      </div>

      <motion.div
        className="space-y-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BackButton />

        {/* Hero Section */}
        <div className="text-center pt-8 flex flex-col items-center justify-center gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/30 via-pink-500/30 to-fuchsia-500/30 blur-3xl rounded-full scale-150" />
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 backdrop-blur-sm border border-rose-500/20">
              <Languages className="h-12 w-12 text-rose-400" />
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold font-headline bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Кана үсэг (かな)
          </motion.h1>
          <motion.p
            className="text-muted-foreground max-w-2xl text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Япон хэлний авианы бичлэгүүд.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="hiragana" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-xl border-0 rounded-2xl p-1 h-auto">
              <TabsTrigger
                value="hiragana"
                className="rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
              >
                Хирагана (ひらがな)
              </TabsTrigger>
              <TabsTrigger
                value="katakana"
                className="rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
              >
                Катакана (カタカナ)
              </TabsTrigger>
            </TabsList>
            {loading ? (
              <div className="mt-6">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            ) : (
              <>
                <TabsContent value="hiragana" className="mt-6">
                  <KanaGrid
                    kana={hiragana}
                    title="Хирагана үсгүүд"
                    collectionPath="hiragana"
                  />
                </TabsContent>
                <TabsContent value="katakana" className="mt-6">
                  <KanaGrid
                    kana={katakana}
                    title="Катакана үсгүүд"
                    collectionPath="katakana"
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
