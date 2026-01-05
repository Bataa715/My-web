'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, BookOpen, Sparkles, FileText } from 'lucide-react';
import BackButton from '@/components/shared/BackButton';
import MaterialManager from '@/components/shared/MaterialManager';
import { motion } from 'framer-motion';
import InteractiveParticles from '@/components/shared/InteractiveParticles';

export default function ReadingPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const handleStartReading = async () => {
    if (!text.trim()) {
      toast({
        title: 'Текст хоосон байна',
        description: 'Уншиж эхлэхийн тулд текст оруулна уу.',
        variant: 'destructive',
      });
      return;
    }

    if (!firestore || !user) {
      toast({
        title: 'Нэвтрээгүй байна',
        description: 'Уншсан материалаа хадгалахын тулд нэвтэрнэ үү.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const readingMaterialsCollection = collection(
        firestore,
        `users/${user.uid}/englishReading`
      );
      const docRef = await addDoc(readingMaterialsCollection, {
        title: text.substring(0, 50) + '...',
        content: text,
        source: 'User Input',
        createdAt: serverTimestamp(),
      });
      router.push(`/tools/english/reading/${docRef.id}`);
    } catch (error) {
      console.error('Error saving reading material:', error);
      toast({
        title: 'Алдаа гарлаа',
        description: 'Унших материалыг хадгалахад алдаа гарлаа.',
        variant: 'destructive',
      });
      setLoading(false);
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
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 blur-3xl rounded-full scale-150" />
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/20">
              <BookOpen className="h-12 w-12 text-emerald-400" />
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold font-headline bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Унших & Суралцах
          </motion.h1>
          <motion.p
            className="text-muted-foreground max-w-2xl text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Текстээ оруулаад, AI туслахтай хамт уншиж, суралцаарай.
          </motion.p>
        </div>

        {/* Text Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="max-w-4xl mx-auto bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                  <FileText className="h-5 w-5 text-emerald-400" />
                </div>
                <CardTitle>Текст оруулах</CardTitle>
              </div>
              <CardDescription className="text-base mt-2">
                Уншихыг хүссэн англи текстээ энд хуулж тавиад "Уншиж эхлэх"
                товчийг дарна уу.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste your English text here..."
                className="min-h-[250px] text-base bg-background/50 border-0 rounded-xl resize-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <Button
                onClick={handleStartReading}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 rounded-xl h-12 text-base"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <BookOpen className="mr-2 h-5 w-5" />
                )}
                Уншиж эхлэх
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Saved Materials */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <MaterialManager
            collectionName="englishReading"
            pageTitle="Хадгалсан материалууд"
            pageDescription="Таны өмнө нь уншиж байсан текстүүд."
            dialogTitle="Шинэ унших материал нэмэх"
            dialogDescription="Материалын гарчиг, унших эх, болон эх сурвалжийг оруулна уу."
            showBackButton={false}
            showAddButton={false}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
