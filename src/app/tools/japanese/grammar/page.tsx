
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { GrammarRule } from '@/lib/types';
import BackButton from '@/components/shared/BackButton';
import GrammarList from '@/components/shared/GrammarList';
import { Skeleton } from '@/components/ui/skeleton';
import { useEditMode } from '@/contexts/EditModeContext';
import { AddGrammarRuleDialog } from '@/components/shared/AddGrammarRuleDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function JapaneseGrammarPage() {
  const { firestore } = useFirebase();
  const { isEditMode } = useEditMode();
  const [rules, setRules] = useState<GrammarRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRules = async () => {
      if (!firestore) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const rulesCollection = collection(firestore, 'japaneseGrammar');
        const rulesSnapshot = await getDocs(rulesCollection);
        const rulesList = rulesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as GrammarRule));
        setRules(rulesList);
      } catch (error) {
        console.error("Error fetching Japanese grammar rules: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, [firestore]);

  const handleAddRule = async (newRule: Omit<GrammarRule, 'id'>) => {
    if (!firestore) {
        toast({ title: "Алдаа", description: "Дүрэм нэмэхийн тулд нэвтэрнэ үү.", variant: "destructive" });
        return;
    }
    try {
        const rulesCollection = collection(firestore, 'japaneseGrammar');
        const docRef = await addDoc(rulesCollection, { ...newRule, createdAt: serverTimestamp() });
        setRules(prevRules => [{ id: docRef.id, ...newRule }, ...prevRules]);
        toast({ title: "Амжилттай", description: "Шинэ дүрэм нэмэгдлээ." });
    } catch (error) {
        console.error("Error adding new rule: ", error);
        toast({ title: "Алдаа", description: "Дүрэм нэмэхэд алдаа гарлаа.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center pt-8 flex items-center justify-center gap-4">
        <h1 className="text-4xl font-bold font-headline font-jp">Япон хэлний дүрэм</h1>
         {isEditMode && (
             <AddGrammarRuleDialog onAddRule={handleAddRule}>
                <Button variant="outline" size="icon">
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">Шинэ дүрэм нэмэх</span>
                </Button>
            </AddGrammarRuleDialog>
        )}
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
