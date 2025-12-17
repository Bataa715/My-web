"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Kana } from "@/lib/types";
import { useFirebase } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

interface KanaGridProps {
  kana: Kana[];
  title: string;
  collectionPath: string;
}

export default function KanaGrid({ kana, title, collectionPath }: KanaGridProps) {
  const { firestore, user } = useFirebase();
  const [memorized, setMemorized] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !firestore) return;
    const fetchMemorized = async () => {
      const docRef = doc(firestore, `users/${user.uid}/memorized`, collectionPath);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMemorized(docSnap.data().characters || []);
      }
    };
    fetchMemorized();
  }, [user, firestore, collectionPath]);

  const toggleMemorized = async (character: string) => {
    if (!user || !firestore) return;

    const newMemorized = memorized.includes(character)
      ? memorized.filter(c => c !== character)
      : [...memorized, character];
    
    setMemorized(newMemorized);

    const docRef = doc(firestore, `users/${user.uid}/memorized`, collectionPath);
    try {
        await setDoc(docRef, { characters: newMemorized }, { merge: true });
    } catch (e) {
        console.error("Error updating memorized kana:", e)
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Үсэг дээр дарж цээжилснээ тэмдэглээрэй.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 text-center">
          {kana.map((k, index) => (
            <Button
              key={`${k.character}-${index}`}
              variant="outline"
              onClick={() => toggleMemorized(k.character)}
              className={cn(
                "h-20 flex flex-col transition-all duration-200",
                memorized.includes(k.character)
                  ? "bg-primary/20 text-primary-foreground border-primary"
                  : "bg-card"
              )}
            >
              <span className="text-3xl">{k.character}</span>
              <span className="text-xs text-muted-foreground">{k.romaji}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
