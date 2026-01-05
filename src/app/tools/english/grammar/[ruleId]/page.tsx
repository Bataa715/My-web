'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { GrammarRule } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/shared/BackButton';
import GrammarRuleDetail from '@/components/shared/GrammarRuleDetail';

export default function EnglishGrammarRulePage({
  params,
}: {
  params: { ruleId: string };
}) {
  const { firestore, user } = useFirebase();
  const [rule, setRule] = useState<GrammarRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { ruleId } = params;

  useEffect(() => {
    if (!firestore || !ruleId || !user) {
      setLoading(false);
      return;
    }

    const fetchRule = async () => {
      setLoading(true);
      setError(null);
      try {
        const ruleDocRef = doc(
          firestore,
          `users/${user.uid}/englishGrammar`,
          ruleId
        );
        const docSnap = await getDoc(ruleDocRef);

        if (docSnap.exists()) {
          setRule({ id: docSnap.id, ...docSnap.data() } as GrammarRule);
        } else {
          setError('Дүрэм олдсонгүй.');
        }
      } catch (err) {
        console.error('Error fetching grammar rule:', err);
        setError('Дүрэм татахад алдаа гарлаа.');
      } finally {
        setLoading(false);
      }
    };

    fetchRule();
  }, [firestore, ruleId, user]);

  const handleUpdateRule = (updatedRule: GrammarRule) => {
    setRule(updatedRule);
  };

  const handleDeleteRule = () => {
    // Since we are on the detail page, we can just navigate back after deletion.
    // The list on the previous page will refetch.
    // For simplicity, we can let the user navigate back manually.
    setRule(null);
    setError('Энэ дүрэм устгагдсан.');
  };

  return (
    <div className="space-y-8">
      <BackButton />

      {loading && (
        <div className="space-y-4 pt-8">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-8 w-1/4 mx-auto" />
          <div className="space-y-6 pt-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && rule && (
        <GrammarRuleDetail
          rule={rule}
          onUpdateRule={handleUpdateRule}
          onDeleteRule={handleDeleteRule}
          collectionPath="englishGrammar"
        />
      )}
    </div>
  );
}
