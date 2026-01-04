
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookOpen } from 'lucide-react';
import BackButton from '@/components/shared/BackButton';
import MaterialManager from '@/components/shared/MaterialManager';

export default function ReadingPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const handleStartReading = async () => {
    if (!text.trim()) {
      toast({
        title: "Текст хоосон байна",
        description: "Уншиж эхлэхийн тулд текст оруулна уу.",
        variant: "destructive",
      });
      return;
    }

    if (!firestore || !user) {
      toast({
        title: "Нэвтрээгүй байна",
        description: "Уншсан материалаа хадгалахын тулд нэвтэрнэ үү.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const readingMaterialsCollection = collection(firestore, `users/${user.uid}/englishReading`);
      const docRef = await addDoc(readingMaterialsCollection, {
        title: text.substring(0, 50) + '...',
        content: text,
        source: 'User Input',
        createdAt: serverTimestamp(),
      });
      router.push(`/tools/english/reading/${docRef.id}`);
    } catch (error) {
      console.error("Error saving reading material:", error);
      toast({
        title: "Алдаа гарлаа",
        description: "Унших материалыг хадгалахад алдаа гарлаа.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center pt-8">
        <h1 className="text-4xl font-bold">Унших & Суралцах</h1>
        <p className="mt-2 text-muted-foreground">Текстээ оруулаад, AI туслахтай хамт уншиж, суралцаарай.</p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Текст оруулах</CardTitle>
          <CardDescription>
            Уншихыг хүссэн англи текстээ энд хуулж тавиад "Уншиж эхлэх" товчийг дарна уу.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your English text here..."
            className="min-h-[250px] text-base"
          />
          <Button onClick={handleStartReading} disabled={loading} className="w-full mt-4">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
            Уншиж эхлэх
          </Button>
        </CardContent>
      </Card>

      <div className="max-w-4xl mx-auto">
        <MaterialManager
            collectionName="englishReading"
            pageTitle="Хадгалсан материалууд"
            pageDescription="Таны өмнө нь уншиж байсан текстүүд."
            dialogTitle="Шинэ унших материал нэмэх"
            dialogDescription="Материалын гарчиг, унших эх, болон эх сурвалжийг оруулна уу."
            showBackButton={false}
            showAddButton={false}
        />
      </div>
    </div>
  );
}
