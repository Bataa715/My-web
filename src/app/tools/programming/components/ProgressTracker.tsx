"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { ProgressItem } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ProgressTrackerProps {
  initialItems: ProgressItem[];
}

export default function ProgressTracker({ initialItems }: ProgressTrackerProps) {
  const { firestore, user } = useFirebase();
  const [items, setItems] = useState<ProgressItem[]>(initialItems);

  useEffect(() => {
    if (!user || !firestore) {
        setItems(initialItems.map(i => ({...i, learned: false, practicing: false})));
        return;
    };

    const fetchProgress = async () => {
      const docRef = doc(firestore, `users/${user.uid}/progress`, 'programming');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userProgress = docSnap.data().items as { [id: string]: { learned: boolean, practicing: boolean } };
        const mergedItems = initialItems.map(item => ({
          ...item,
          learned: userProgress[item.id!]?.learned || false,
          practicing: userProgress[item.id!]?.practicing || false,
        }));
        setItems(mergedItems);
      } else {
        setItems(initialItems.map(i => ({...i, learned: false, practicing: false})));
      }
    };
    fetchProgress();
  }, [user, firestore, initialItems]);


  const handleToggle = async (id: string, key: 'learned' | 'practicing') => {
    if (!user || !firestore) return;

    const newItems = items.map(item =>
      item.id === id ? { ...item, [key]: !item[key] } : item
    );
    setItems(newItems);

    const updatedItem = newItems.find(item => item.id === id);
    if (!updatedItem) return;

    const docRef = doc(firestore, `users/${user.uid}/progress`, 'programming');
    try {
        await setDoc(docRef, {
            items: {
                [id]: {
                    learned: updatedItem.learned,
                    practicing: updatedItem.practicing
                }
            }
        }, { merge: true });
    } catch (e) {
        console.error("Error updating progress:", e);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Tracker</CardTitle>
        <CardDescription>Суралцсан болон дадлагажиж буй сэдвүүдээ тэмдэглэх.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.label}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`learned-${item.id}`}
                      checked={item.learned}
                      onCheckedChange={() => handleToggle(item.id!, 'learned')}
                    />
                    <Label htmlFor={`learned-${item.id}`} className="text-sm text-muted-foreground">
                      Сурсан
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`practicing-${item.id}`}
                      checked={item.practicing}
                      onCheckedChange={() => handleToggle(item.id!, 'practicing')}
                    />
                    <Label htmlFor={`practicing-${item.id}`} className="text-sm text-muted-foreground">
                      Дадлагажиж буй
                    </Label>
                  </div>
                </div>
              </div>
              {index < items.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
