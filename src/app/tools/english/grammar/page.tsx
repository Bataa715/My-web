'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { GrammarRule } from '@/lib/types';
import BackButton from '@/components/shared/BackButton';
import GrammarList from '@/components/shared/GrammarList';
import { Skeleton } from '@/components/ui/skeleton';

export default function EnglishGrammarPage() {
  const { firestore } = useFirebase();
  const [rules, setRules] = useState<GrammarRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      if (!firestore) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const rulesCollection = collection(firestore, 'englishGrammar');
        const rulesSnapshot = await getDocs(rulesCollection);
        const rulesList = rulesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as GrammarRule));
        setRules(rulesList);
      } catch (error) {
        console.error("Error fetching English grammar rules: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, [firestore]);

  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center pt-8">
        <h1 className="text-4xl font-bold font-headline">Англи хэлний дүрэм</h1>
        <p className="mt-2 text-muted-foreground">Дүрэмүүдтэй танилцаж, мэдлэгээ бататгаарай.</p>
      </div>
      {loading ? (
        <div className="space-y-4 pt-8">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="pt-8">
            <GrammarList rules={rules} />
        </div>
      )}
    </div>
  );
}
