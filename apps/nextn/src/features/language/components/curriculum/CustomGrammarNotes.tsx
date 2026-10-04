'use client';

import { useEffect, useState } from 'react';
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
import { AddGrammarRuleDialog } from '@/features/language/components/AddGrammarRuleDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEditMode } from '@/providers/EditModeContext';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

/**
 * "My notes" — the user's own grammar rules, stored per account. Sits below the
 * built-in curriculum so the lessons never depend on the database.
 */
export default function CustomGrammarNotes({ lang }: { lang: 'english' | 'japanese' }) {
  const collectionPath = lang === 'english' ? 'englishGrammar' : 'japaneseGrammar';
  const { firestore, user } = useSupabase();
  const { isEditMode } = useEditMode();
  const { toast } = useToast();
  const [rules, setRules] = useState<GrammarRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const col = collection(firestore, `users/${user.uid}/${collectionPath}`);
        const snap = await getDocs(query(col, orderBy('createdAt', 'desc')));
        setRules(snap.docs.map(d => ({ id: d.id, ...d.data() }) as GrammarRule));
      } catch (err) {
        console.error('Error fetching grammar notes:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [firestore, user, collectionPath]);

  const handleAdd = async (rule: Omit<GrammarRule, 'id' | 'createdAt'>) => {
    if (!firestore || !user) return;
    try {
      const col = collection(firestore, `users/${user.uid}/${collectionPath}`);
      const ref = await addDoc(col, { ...rule, createdAt: serverTimestamp() });
      setRules(prev => [{ id: ref.id, ...rule, createdAt: new Date() }, ...prev]);
      toast({ title: 'Амжилттай', description: 'Шинэ дүрэм нэмэгдлээ.' });
    } catch (error) {
      console.error('Error adding rule: ', error);
      toast({ title: 'Алдаа', description: 'Дүрэм нэмэхэд алдаа гарлаа.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore || !user) return;
    const backup = [...rules];
    setRules(prev => prev.filter(r => r.id !== id));
    try {
      await deleteDoc(doc(firestore, `users/${user.uid}/${collectionPath}`, id));
      toast({ title: 'Амжилттай', description: 'Дүрэм устгагдлаа.' });
    } catch (error) {
      console.error('Error deleting rule: ', error);
      setRules(backup);
      toast({ title: 'Алдаа', description: 'Дүрэм устгахад алдаа гарлаа.', variant: 'destructive' });
    }
  };

  const handleUpdate = (updated: GrammarRule) =>
    setRules(prev => prev.map(r => (r.id === updated.id ? updated : r)));

  if (!user) return null;
  if (!loading && rules.length === 0 && !isEditMode) return null;

  return (
    <section className="mt-20 border-t border-[#111] pt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
            Миний тэмдэглэл
          </h2>
          <p className="mt-1 text-sm text-[#111]/55">Өөрийн нэмсэн, засаж болох дүрмүүд.</p>
        </div>
        {isEditMode && (
          <AddGrammarRuleDialog onAddRule={handleAdd} ruleType={lang}>
            <Button
              variant="outline"
              className="rounded-none border-[#111]/30 bg-transparent text-[11px] font-semibold uppercase tracking-[0.16em]"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Дүрэм нэмэх
            </Button>
          </AddGrammarRuleDialog>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <GrammarList
          rules={rules}
          onDeleteRule={handleDelete}
          onUpdateRule={handleUpdate}
          collectionPath={collectionPath}
        />
      )}
    </section>
  );
}
