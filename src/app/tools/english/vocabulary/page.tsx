
'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import VocabularyManager from "@/components/shared/VocabularyManager";
import BackButton from "@/components/shared/BackButton";
import type { EnglishWord } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { initialEnglishWords } from '@/data/english';


const columns = [
  { key: 'word' as keyof EnglishWord, header: 'English Word' },
  { key: 'meaning' as keyof EnglishWord, header: 'Утга' },
];

export default function EnglishVocabularyPage() {
  const { firestore } = useFirebase();
  const [words, setWords] = useState<EnglishWord[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // For users who are not logged in, or when firestore is not available,
    // we show the initial words without any memorized status from a local file.
    if (!firestore) {
      const localWords = initialEnglishWords.map((word, index) => ({
        ...word,
        id: `local-${index}`,
        memorized: false,
      }));
      setWords(localWords);
      setLoading(false);
      return;
    }
    
    // For logged-in users, we fetch the public words from Firestore.
    // The VocabularyManager will then handle merging these with user-specific data.
    const fetchPublicWords = async () => {
      setLoading(true);
      try {
        const wordsCollection = collection(firestore, 'englishWords');
        const wordsSnapshot = await getDocs(wordsCollection);
        if (wordsSnapshot.empty) {
            console.log("No public words found, using initial local words.");
            const localWords = initialEnglishWords.map((word, index) => ({
                ...word,
                id: `local-fallback-${index}`, // Differentiate from pure local
                memorized: false,
            }));
            setWords(localWords);
        } else {
            const wordsList = wordsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            } as EnglishWord));
            setWords(wordsList);
        }

      } catch (error) {
        console.error("Error fetching public English words: ", error);
        // Fallback to local words on error
         const localWords = initialEnglishWords.map((word, index) => ({
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
            collectionPath="englishWords"
            initialWords={words}
            wordType="english"
            columns={columns}
            title="Англи үгс"
        />
      )}
    </div>
  );
}
