
'use client';

import { useState, useEffect, useRef } from 'react';
import type { ReadingMaterial, AIAction, AIResponse, ReadingNote } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Languages, Wand2, MessageSquarePlus, Loader2, Sparkles, Pencil, Trash2 } from 'lucide-react';
import { correctText } from '@/ai/flows/correct-text-flow';
import { translateText } from '@/ai/flows/translate-text-flow';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

interface ReadingViewProps {
  material: ReadingMaterial;
}

export default function ReadingView({ material }: ReadingViewProps) {
  const [selection, setSelection] = useState<Range | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null);
  const [aiAction, setAiAction] = useState<AIAction>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState<ReadingNote[]>([]);

  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  // Fetch notes for this reading material
  useEffect(() => {
    if (!firestore || !user || !material.id) return;

    const notesQuery = query(
      collection(firestore, `users/${user.uid}/readingNotes`),
      where("readingMaterialId", "==", material.id)
    );

    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const fetchedNotes: ReadingNote[] = [];
      snapshot.forEach((doc) => {
        fetchedNotes.push({ id: doc.id, ...doc.data() } as ReadingNote);
      });
      setNotes(fetchedNotes.sort((a, b) => (a.createdAt as any) - (b.createdAt as any)));
    });

    return () => unsubscribe();
  }, [firestore, user, material.id]);

  const handleMouseUp = () => {
    const currentSelection = window.getSelection();
    if (currentSelection && currentSelection.rangeCount > 0) {
      const range = currentSelection.getRangeAt(0);
      if (!range.collapsed) {
        setSelection(range);
        setPopoverTarget(range.startContainer.parentElement);
        setPopoverOpen(true);
        setAiResponse(null);
        setAiAction(null);
      } else {
        setPopoverOpen(false);
      }
    }
  };

  const handleAiAction = async (action: 'translate' | 'correct') => {
    if (!selection) return;

    setAiAction(action);
    setIsLoading(true);
    setAiResponse(null);
    const text = selection.toString();

    try {
      if (action === 'translate') {
        const result = await translateText({ text });
        setAiResponse({ translation: result.translation });
      } else if (action === 'correct') {
        const result = await correctText({ text });
        setAiResponse({ correction: result.correction, explanation: result.explanation });
      }
    } catch (error) {
      console.error(`Error with AI action '${action}':`, error);
      toast({
        title: "AI Алдаа",
        description: "Үйлдлийг гүйцэтгэхэд алдаа гарлаа.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddNote = async () => {
    if (!selection || !noteContent.trim() || !user || !firestore || !material.id) return;
    try {
        await addDoc(collection(firestore, `users/${user.uid}/readingNotes`), {
            readingMaterialId: material.id,
            selectedText: selection.toString(),
            note: noteContent,
            createdAt: serverTimestamp()
        });
        toast({ title: "Амжилттай", description: "Тэмдэглэл нэмэгдлээ." });
        setIsNoteDialogOpen(false);
        setNoteContent('');
        setPopoverOpen(false);
    } catch(e) {
        toast({ title: "Алдаа", description: "Тэмдэглэл нэмэхэд алдаа гарлаа.", variant: "destructive" });
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!firestore || !user) return;
    try {
        await deleteDoc(doc(firestore, `users/${user.uid}/readingNotes`, noteId));
        toast({ title: "Амжилттай", description: "Тэмдэглэл устгагдлаа." });
    } catch(e) {
        toast({ title: "Алдаа", description: "Тэмдэглэл устгахад алдаа гарлаа.", variant: "destructive" });
    }
  }


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{material.title}</CardTitle>
                    {material.source && <CardDescription>Эх сурвалж: {material.source}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div
                        onMouseUp={handleMouseUp}
                        className="prose dark:prose-invert max-w-none text-lg leading-relaxed selection:bg-primary/30"
                    >
                        {material.content.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Pencil className="h-5 w-5" /> Миний тэмдэглэлүүд</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                     {notes.length > 0 ? (
                        notes.map(note => (
                            <div key={note.id} className="p-3 bg-muted/50 rounded-lg group relative">
                                <p className="font-semibold border-l-2 border-primary pl-2 italic">"{note.selectedText}"</p>
                                <p className="mt-2 text-sm">{note.note}</p>
                                 <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100"
                                    onClick={() => handleDeleteNote(note.id!)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        ))
                     ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Одоогоор тэмдэглэл алга байна.</p>
                     )}
                 </CardContent>
            </Card>
        </div>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          {/* Virtual trigger, position is handled manually */}
          <div style={{ position: 'fixed', top: popoverTarget?.getBoundingClientRect().top, left: popoverTarget?.getBoundingClientRect().left }} />
        </PopoverTrigger>
        <PopoverContent className="w-auto" align="start" side="top">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleAiAction('translate')}>
              <Languages className="mr-2 h-4 w-4" /> Орчуулах
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAiAction('correct')}>
              <Wand2 className="mr-2 h-4 w-4" /> AI-аар засах
            </Button>
             <Button variant="outline" size="sm" onClick={() => { setIsNoteDialogOpen(true) }}>
              <MessageSquarePlus className="mr-2 h-4 w-4" /> Тэмдэглэл
            </Button>
          </div>
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {aiResponse && (
            <div className="mt-4 p-4 border-t">
              {aiAction === 'translate' && (
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Орчуулга</h4>
                  <p className="italic text-muted-foreground">{aiResponse.translation}</p>
                </div>
              )}
              {aiAction === 'correct' && (
                <div className="space-y-3">
                   <div>
                        <h4 className="font-bold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Зассан хувилбар</h4>
                        <p className="p-2 bg-green-900/20 rounded-md text-green-300">{aiResponse.correction}</p>
                   </div>
                   <div>
                        <h4 className="font-bold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Тайлбар</h4>
                        <p className="text-sm text-muted-foreground">{aiResponse.explanation}</p>
                   </div>
                </div>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
      
        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Тэмдэглэл нэмэх</DialogTitle>
                    <DialogDescription>
                        Сонгосон тексттэй холбоотой тэмдэглэлээ энд бичнэ үү.
                    </DialogDescription>
                </DialogHeader>
                 <div className="py-4 space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Сонгосон текст:</p>
                    <blockquote className="border-l-2 border-primary pl-4 italic">
                        {selection?.toString()}
                    </blockquote>
                    <Textarea 
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Таны тэмдэглэл..."
                        className="mt-4"
                        rows={5}
                    />
                </div>
                 <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Цуцлах</Button></DialogClose>
                    <Button onClick={handleAddNote}>Хадгалах</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
