'use server';

import type { EnglishWord, JapaneseWord, GrammarRule, Kana, ProgrammingConcept, CheatSheetItem, ProgressItem } from './types';
import { getFirestore, collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore } = initializeFirebase();

async function getCollectionData<T>(collectionName: string, orderByField: string, order: 'asc' | 'desc' = 'asc'): Promise<T[]> {
  try {
    const colRef = collection(firestore, collectionName);
    const q = query(colRef, orderBy(orderByField, order));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`No documents found in ${collectionName}`);
      return [];
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      const docData: { [key: string]: any } = { id: doc.id };
      for (const key in data) {
        if (data[key] instanceof Timestamp) {
          docData[key] = data[key].toDate();
        } else {
          docData[key] = data[key];
        }
      }
      return docData as T;
    });
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    // In case of error, return an empty array to prevent app crash
    return [];
  }
}

export async function getEnglishWords() { return getCollectionData<EnglishWord>('englishWords', 'word'); }
export async function getEnglishGrammar() { return getCollectionData<GrammarRule>('englishGrammar', 'title'); }
export async function getHiragana() { return getCollectionData<Kana>('hiragana', 'romaji'); }
export async function getKatakana() { return getCollectionData<Kana>('katakana', 'romaji'); }
export async function getJapaneseWords() { return getCollectionData<JapaneseWord>('japaneseWords', 'word'); }
export async function getJapaneseGrammar() { return getCollectionData<GrammarRule>('japaneseGrammar', 'title'); }
export async function getProgrammingConcepts() { return getCollectionData<ProgrammingConcept>('programmingConcepts', 'title'); }
export async function getCheatSheetItems() { return getCollectionData<CheatSheetItem>('cheatSheetItems', 'title'); }
export async function getInitialProgressItems() { return getCollectionData<ProgressItem>('progressItems', 'label'); }
