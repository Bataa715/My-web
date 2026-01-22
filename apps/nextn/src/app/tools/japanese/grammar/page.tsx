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
} from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { GrammarRule } from '@/lib/types';
import BackButton from '@/components/shared/BackButton';
import GrammarList from '@/components/shared/GrammarList';
import { Skeleton } from '@/components/ui/skeleton';
import { useEditMode } from '@/contexts/EditModeContext';
import { AddGrammarRuleDialog } from '@/components/shared/AddGrammarRuleDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookText, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import { Card, CardContent } from '@/components/ui/card';
import { AIGrammarRuleDialog } from '@/components/shared/AIGrammarRuleDialog';

export default function JapaneseGrammarPage() {
  const { firestore, user } = useFirebase();
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
    <div className="min-h-screen relative">
      {/* Background Particles */}
      <div className="fixed inset-0 -z-10">
        <InteractiveParticles quantity={30} />
      </div>

      <motion.div
        className="space-y-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BackButton />

        {/* Hero Section */}
        <div className="text-center pt-8 flex flex-col items-center justify-center gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/30 via-pink-500/30 to-fuchsia-500/30 blur-3xl rounded-full scale-150" />
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 backdrop-blur-sm border border-rose-500/20">
              <BookText className="h-12 w-12 text-rose-400" />
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.h1
              className="text-4xl md:text-5xl font-bold font-headline bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Япон хэлний дүрэм
            </motion.h1>
            {isEditMode && (
              <div className="flex items-center gap-2">
                <AIGrammarRuleDialog
                  onAddRule={handleAddRule}
                  ruleType="japanese"
                >
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    AI-ээр үүсгэх
                  </Button>
                </AIGrammarRuleDialog>
                <AddGrammarRuleDialog
                  onAddRule={handleAddRule}
                  ruleType="japanese"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all duration-300 rounded-xl"
                  >
                    <PlusCircle className="h-5 w-5 text-rose-400" />
                    <span className="sr-only">Гараар нэмэх</span>
                  </Button>
                </AddGrammarRuleDialog>
              </div>
            )}
          </div>
          <motion.p
            className="text-muted-foreground max-w-2xl text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Япон хэлний дүрмүүдийг судлаж, тэмдэглэл хийгээрэй
          </motion.p>
        </div>

        {loading ? (
          <div className="space-y-4 pt-8">
            <div className="flex justify-center flex-wrap gap-2 py-8">
              <Skeleton className="h-10 w-20 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>
        ) : !user ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-xl border-0 rounded-2xl p-8 shadow-lg shadow-rose-500/5">
              <CardContent className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-rose-500/10">
                  <Sparkles className="h-8 w-8 text-rose-400" />
                </div>
                <p className="text-muted-foreground text-lg">
                  Дүрмийн жагсаалтыг харахын тулд нэвтэрнэ үү.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Category Filter */}
            <motion.div
              className="flex justify-center flex-wrap gap-2 py-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {categories.map(category => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? 'default' : 'outline'
                  }
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 shadow-lg shadow-rose-500/25'
                      : 'bg-card/50 backdrop-blur-xl border-0 hover:bg-rose-500/10'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </motion.div>

            {/* Grammar List */}
            <motion.div
              className="pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <GrammarList
                rules={filteredRules}
                onDeleteRule={handleDeleteRule}
                onUpdateRule={handleUpdateRule}
                collectionPath="japaneseGrammar"
              />
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
