'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import VocabularyManager from "@/components/shared/VocabularyManager";
import BackButton from "@/components/shared/BackButton";
import type { JapaneseWord } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { initialJapaneseWords } from '@/data/japanese';


const columns = [
  { key: 'word' as keyof JapaneseWord, header: 'Япон үг' },
  { key: 'romaji' as keyof JapaneseWord, header: 'Ромажи' },
  { key: 'meaning' as keyof JapaneseWord, header: 'Утга' },
];

export default function JapaneseVocabularyPage() {
  const { firestore } = useFirebase();
  const [words, setWords] = useState<JapaneseWord[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!firestore) {
      const localWords = initialJapaneseWords.map((word, index) => ({
        ...word,
        id: `local-${index}`,
        memorized: false,
      }));
      setWords(localWords);
      setLoading(false);
      return;
    }
    
    const fetchPublicWords = async () => {
      setLoading(true);
      try {
        const wordsCollection = collection(firestore, 'japaneseWords');
        const wordsSnapshot = await getDocs(wordsCollection);
        if (wordsSnapshot.empty) {
            console.log("No public words found, using initial local words.");
            const localWords = initialJapaneseWords.map((word, index) => ({
                ...word,
                id: `local-fallback-${index}`,
                memorized: false,
            }));
            setWords(localWords);
        } else {
            const wordsList = wordsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            } as JapaneseWord));
            setWords(wordsList);
        }

      } catch (error) {
        console.error("Error fetching public Japanese words: ", error);
         const localWords = initialJapaneseWords.map((word, index) => ({
            ...word,
            id: `local-error-${index}`,
            memorized: false,
        }));
        setWords(localWords);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicWords();
  }, [firestore]);


  return (
    <div className="space-y-8">
      <BackButton />
       {loading ? (
        <div className="space-y-4 pt-8">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <VocabularyManager
            collectionPath="japaneseWords"
            initialWords={words}
            wordType="japanese"
            columns={columns}
            title="Япон үгс"
        />
      )}
    </div>
  );
}
