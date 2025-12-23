
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { ProgressItem } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { AddProgressItemDialog } from './AddProgressItemDialog';
import { EditProgressItemDialog } from './EditProgressItemDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DailyQuestProps {
  initialItems: ProgressItem[];
  onAddItem: (item: Omit<ProgressItem, 'id' | 'learned' | 'practicing'>) => void;
  onUpdateItem: (id: string, item: Omit<ProgressItem, 'id' | 'learned' | 'practicing'>) => void;
  onDeleteItem: (id: string) => void;
}

export default function DailyQuest({ initialItems, onAddItem, onUpdateItem, onDeleteItem }: DailyQuestProps) {
  const { firestore, user } = useFirebase();
  const { isEditMode } = useEditMode();
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
    <Card className="glassmorphism-card neon-glow h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daily Quest</CardTitle>
          <CardDescription>Complete challenges, earn EXP.</CardDescription>
        </div>
        {isEditMode && (
          <AddProgressItemDialog onAddItem={onAddItem}>
             <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
              <PlusCircle />
            </Button>
          </AddProgressItemDialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-center justify-between group">
                <span className="font-medium">{item.label}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`learned-${item.id}`}
                      checked={item.learned}
                      onCheckedChange={() => handleToggle(item.id!, 'learned')}
                      disabled={!isEditMode && !user}
                    />
                    <Label htmlFor={`learned-${item.id}`} className="text-sm text-muted-foreground">
                      Learned
                    </Label>
                  </div>
                  {isEditMode && (
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                         <EditProgressItemDialog item={item} onUpdateItem={onUpdateItem}>
                           <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4"/></Button>
                        </EditProgressItemDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                              <AlertDialogDescription>"{item.label}"-г устгах гэж байна. Энэ үйлдэл буцаагдахгүй.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteItem(item.id!)}>Устгах</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                </div>
              </div>
              {index < items.length - 1 && <Separator className="mt-4 border-primary/20" />}
            </div>
          ))}
           {items.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              {isEditMode ? "Add a new quest to begin." : "No quests available."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
