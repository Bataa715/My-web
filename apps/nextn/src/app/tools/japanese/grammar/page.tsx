'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  query,
  orderBy,
} from '@/supabase/db';
import { useSupabase } from '@/supabase';
import type { GrammarRule } from '@/lib/types';
import GrammarList from '@/features/language/components/GrammarList';
import { Skeleton } from '@/components/ui/skeleton';
import { useEditMode } from '@/providers/EditModeContext';
import { AddGrammarRuleDialog } from '@/features/language/components/AddGrammarRuleDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ToolPageShell from '@/features/tools/ToolPageShell';
export default function JapaneseGrammarPage() {
  const { firestore, user } = useSupabase();
  const { isEditMode } = useEditMode();
  const [rules, setRules] = useState<GrammarRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (!user || !firestore) {
      setLoading(false);
      return;
    }
    const fetchRules = async () => {
      setLoading(true);
      try {
        const rulesCollection = collection(
          firestore,
          `users/${user.uid}/japaneseGrammar`
        );
        const q = query(rulesCollection, orderBy('createdAt', 'desc'));
        const rulesSnapshot = await getDocs(q);
        const rulesList = rulesSnapshot.docs.map(
          doc =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as GrammarRule
        );
        setRules(rulesList);
      } catch (error) {
        console.error('Error fetching Japanese grammar rules: ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, [firestore, user]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(rules.map(r => r.category)))],
    [rules]
  );

  const filteredRules = useMemo(() => {
    if (selectedCategory === 'All') return rules;
    return rules.filter(rule => rule.category === selectedCategory);
  }, [rules, selectedCategory]);

  const handleAddRule = async (
    newRule: Omit<GrammarRule, 'id' | 'createdAt'>
  ) => {
    if (!firestore || !user) {
      toast({
        title: 'Алдаа',
        description: 'Дүрэм нэмэхийн тулд нэвтэрнэ үү.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const rulesCollection = collection(
        firestore,
        `users/${user.uid}/japaneseGrammar`
      );
      const docRef = await addDoc(rulesCollection, {
        ...newRule,
        createdAt: serverTimestamp(),
      });
      setRules(prevRules => [
        { id: docRef.id, ...newRule, createdAt: new Date() },
        ...prevRules,
      ]);
      toast({ title: 'Амжилттай', description: 'Шинэ дүрэм нэмэгдлээ.' });
    } catch (error) {
      console.error('Error adding new rule: ', error);
      toast({
        title: 'Алдаа',
        description: 'Дүрэм нэмэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRule = (updatedRule: GrammarRule) => {
    setRules(prevRules =>
      prevRules.map(rule => (rule.id === updatedRule.id ? updatedRule : rule))
    );
  };

  const handleDeleteRule = async (id: string) => {
    if (!firestore || !user) {
      toast({
        title: 'Алдаа',
        description: 'Дүрэм устгахын тулд нэвтэрнэ үү.',
        variant: 'destructive',
      });
      return;
    }
    const originalRules = [...rules];
    setRules(prevRules => prevRules.filter(rule => rule.id !== id));
    try {
      await deleteDoc(doc(firestore, `users/${user.uid}/japaneseGrammar`, id));
      toast({ title: 'Амжилттай', description: 'Дүрэм устгагдлаа.' });
    } catch (error) {
      console.error('Error deleting rule: ', error);
      setRules(originalRules);
      toast({
        title: 'Алдаа',
        description: 'Дүрэм устгахад алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  return (
    <ToolPageShell
      title="Grammar"
      description="Япон хэлний дүрмүүдийг судлаж, тэмдэглэл хийгээрэй"
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/#tools' },
        { label: 'Япон хэл', href: '/tools/japanese' },
        { label: 'Дүрэм' },
      ]}
    >
      {isEditMode && (
        <div className="mb-8 flex justify-center">
          <AddGrammarRuleDialog onAddRule={handleAddRule} ruleType="japanese">
            <Button
              variant="outline"
              className="rounded-none border-[#111]/30 bg-transparent text-[11px] font-semibold uppercase tracking-[0.16em]"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Дүрэм нэмэх
            </Button>
          </AddGrammarRuleDialog>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : !user ? (
        <p className="py-16 text-center text-sm text-[#111]/45">
          Дүрмийн жагсаалтыг харахын тулд нэвтэрнэ үү.
        </p>
      ) : (
        <>
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-none text-[11px] uppercase tracking-[0.16em] ${
                  selectedCategory === category
                    ? 'border-[#c41212] bg-[#c41212] text-white'
                    : 'border-[#111]/30 bg-transparent hover:border-[#111]'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
          <GrammarList
            rules={filteredRules}
            onDeleteRule={handleDeleteRule}
            onUpdateRule={handleUpdateRule}
            collectionPath="japaneseGrammar"
          />
        </>
      )}
    </ToolPageShell>
  );
}
