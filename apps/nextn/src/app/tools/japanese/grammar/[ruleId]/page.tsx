'use client';

import React, { useEffect, useState, use } from 'react';
import { doc, getDoc } from '@/supabase/db';
import { useSupabase } from '@/supabase';
import type { GrammarRule } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import GrammarRuleDetail from '@/features/language/components/GrammarRuleDetail';
import ToolPageShell from '@/features/tools/ToolPageShell';

export default function JapaneseGrammarRulePage({
  params,
}: {
  params: Promise<{ ruleId: string }>;
}) {
  const { ruleId } = use(params);
  const { firestore, user } = useSupabase();
  const [rule, setRule] = useState<GrammarRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          `users/${user.uid}/japaneseGrammar`,
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
    setRule(null);
    setError('Энэ дүрэм устгагдсан.');
  };

  return (
    <ToolPageShell
      title={rule?.title || 'Grammar'}
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Япон хэл', href: '/tools/japanese' },
        { label: 'Дүрэм', href: '/tools/japanese/grammar' },
        { label: rule?.title || 'Дүрэм' },
      ]}
    >
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {error && (
        <p className="py-16 text-center text-sm text-[#c41212]">{error}</p>
      )}

      {!loading && !error && rule && (
        <GrammarRuleDetail
          rule={rule}
          onUpdateRule={handleUpdateRule}
          onDeleteRule={handleDeleteRule}
          collectionPath="japaneseGrammar"
        />
      )}
    </ToolPageShell>
  );
}
