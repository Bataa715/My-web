
'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
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
  const { firestore, user } = useFirebase();
  const { isEditMode } = useEditMode();
  const [rules, setRules] = useState<GrammarRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (!user || !firestore) {
        setLoading(false);
        return;
    }
    const fetchRules = async () => {
      setLoading(true);
      try {
        const rulesCollection = collection(firestore, `users/${user.uid}/japaneseGrammar`);
        const q = query(rulesCollection, orderBy('createdAt', 'desc'));
        const rulesSnapshot = await getDocs(q);
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
  }, [firestore, user]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(rules.map(r => r.category)))], [rules]);

  const filteredRules = useMemo(() => {
    if (selectedCategory === "All") return rules;
    return rules.filter(rule => rule.category === selectedCategory);
  }, [rules, selectedCategory]);

 const handleAddRule = async (newRule: Omit<GrammarRule, 'id' | 'createdAt'>) => {
    if (!firestore || !user) {
        toast({ title: "Алдаа", description: "Дүрэм нэмэхийн тулд нэвтэрнэ үү.", variant: "destructive" });
        return;
    }
    try {
        const rulesCollection = collection(firestore, `users/${user.uid}/japaneseGrammar`);
        const docRef = await addDoc(rulesCollection, { ...newRule, createdAt: serverTimestamp() });
        setRules(prevRules => [{ id: docRef.id, ...newRule, createdAt: new Date() }, ...prevRules]);
        toast({ title: "Амжилттай", description: "Шинэ дүрэм нэмэгдлээ." });
    } catch (error) {
        console.error("Error adding new rule: ", error);
        toast({ title: "Алдаа", description: "Дүрэм нэмэхэд алдаа гарлаа.", variant: "destructive" });
    }
  };

  const handleUpdateRule = (updatedRule: GrammarRule) => {
    setRules(prevRules => prevRules.map(rule => rule.id === updatedRule.id ? updatedRule : rule));
  };

  const handleDeleteRule = async (id: string) => {
    if (!firestore || !user) {
      toast({ title: "Алдаа", description: "Дүрэм устгахын тулд нэвтэрнэ үү.", variant: "destructive" });
      return;
    }
    const originalRules = [...rules];
    setRules(prevRules => prevRules.filter(rule => rule.id !== id));
    try {
      await deleteDoc(doc(firestore, `users/${user.uid}/japaneseGrammar`, id));
      toast({ title: "Амжилттай", description: "Дүрэм устгагдлаа." });
    } catch (error) {
      console.error("Error deleting rule: ", error);
      setRules(originalRules);
      toast({ title: "Алдаа", description: "Дүрэм устгахад алдаа гарлаа.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center pt-8 flex items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Япон хэлний дүрэм</h1>
         {isEditMode && (
             <AddGrammarRuleDialog onAddRule={handleAddRule} ruleType="japanese">
                <Button variant="outline" size="icon">
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">Шинэ дүрэм нэмэх</span>
                </Button>
            </AddGrammarRuleDialog>
        )}
      </div>
      {loading ? (
         <div className="space-y-4 pt-8">
            <div className="flex justify-center flex-wrap gap-2 py-8">
                 <Skeleton className="h-10 w-20" />
                 <Skeleton className="h-10 w-24" />
                 <Skeleton className="h-10 w-28" />
             </div>
           <Skeleton className="h-24 w-full" />
           <Skeleton className="h-24 w-full" />
           <Skeleton className="h-24 w-full" />
         </div>
       ) : !user ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Дүрмийн жагсаалтыг харахын тулд нэвтэрнэ үү.</p>
        </div>
       ) : (
         <>
            <div className="flex justify-center flex-wrap gap-2 py-8">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full transition-colors duration-300"
                >
                  {category}
                </Button>
              ))}
            </div>
            <div className="pt-2">
                <GrammarList rules={filteredRules} onDeleteRule={handleDeleteRule} onUpdateRule={handleUpdateRule} collectionPath="japaneseGrammar" />
            </div>
         </>
       )}
    </div>
  );
}
