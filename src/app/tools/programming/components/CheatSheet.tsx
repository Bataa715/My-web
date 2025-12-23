
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Trash2, Edit, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { CheatSheetItem } from '@/lib/types';
import { useEditMode } from '@/contexts/EditModeContext';
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
import { AddCheatSheetDialog } from './AddCheatSheetDialog';
import { EditCheatSheetDialog } from './EditCheatSheetDialog';


interface CheatSheetProps {
    items: CheatSheetItem[];
    onAddItem: (item: Omit<CheatSheetItem, 'id'>) => void;
    onUpdateItem: (id: string, item: Omit<CheatSheetItem, 'id'>) => void;
    onDeleteItem: (id: string) => void;
}

export default function CheatSheet({ items, onAddItem, onUpdateItem, onDeleteItem }: CheatSheetProps) {
  const { isEditMode } = useEditMode();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    toast({ title: "Copied to clipboard!" });
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Cheat Sheet</CardTitle>
            <CardDescription>Хэрэгтэй кодны хэсгүүд болон syntax.</CardDescription>
        </div>
        {isEditMode && (
          <AddCheatSheetDialog onAddItem={onAddItem}>
            <Button variant="outline" size="icon">
              <PlusCircle />
            </Button>
          </AddCheatSheetDialog>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border bg-muted/50 group">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h3 className="font-semibold text-sm font-mono">{item.title}</h3>
              <div className="flex items-center gap-1">
                 {isEditMode && (
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditCheatSheetDialog item={item} onUpdateItem={onUpdateItem}>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4"/></Button>
                    </EditCheatSheetDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                          <AlertDialogDescription>"{item.title}"-г устгах гэж байна. Энэ үйлдэл буцаагдахгүй.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteItem(item.id!)}>Устгах</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCopy(item.snippet, item.id!)}
                >
                    {copiedId === item.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <pre className="p-4 text-sm overflow-x-auto font-code">
              <code>{item.snippet}</code>
            </pre>
          </div>
        ))}
         {items.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            {isEditMode ? "Шинэ хэрэгтэй кодны хэсэг нэмнэ үү." : "Хэрэгтэй кодны хэсэг олдсонгүй."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
