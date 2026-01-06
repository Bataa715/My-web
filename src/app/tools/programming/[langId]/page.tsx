'use client';

import { useEffect, useState, useCallback, use } from 'react';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import BackButton from '@/components/shared/BackButton';
import type {
  Language,
  Chapter,
  Note,
  ProgrammingConcept,
  CheatSheetItem,
} from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Edit,
  Trash2,
  BookOpen,
  StickyNote,
  Lightbulb,
  Code2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Reusable modal for adding/editing items
const ItemDialog = ({
  open,
  onOpenChange,
  onSave,
  item,
  fields,
  title,
}: any) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      const initialData: { [key: string]: any } = {};
      fields.forEach((field: any) => (initialData[field.name] = ''));
      setFormData(initialData);
    }
  }, [item, fields, open]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? `Edit ${title}` : `Add New ${title}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {fields.map((field: any) => (
            <div key={field.name}>
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  value={(formData as any)[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required
                  rows={field.name === 'snippet' ? 10 : 4}
                />
              ) : (
                <Input
                  id={field.name}
                  value={(formData as any)[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required
                  type={field.type || 'text'}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function LanguageDojoPage({
  params,
}: {
  params: Promise<{ langId: string }>;
}) {
  const { langId } = use(params);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const [language, setLanguage] = useState<Language | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [concepts, setConcepts] = useState<ProgrammingConcept[]>([]);
  const [snippets, setSnippets] = useState<CheatSheetItem[]>([]);
  const [loading, setLoading] = useState(true);

  // CRUD state
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!user || !firestore || !langId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const basePath = `users/${user.uid}/languages/${langId}`;
      const langDocRef = doc(firestore, basePath);
      const chaptersRef = collection(firestore, `${basePath}/chapters`);
      const notesRef = collection(firestore, `${basePath}/notes`);
      const conceptsRef = collection(firestore, `${basePath}/concepts`);
      const snippetsRef = collection(firestore, `${basePath}/snippets`);

      const [
        langSnap,
        chaptersSnap,
        notesSnap,
        conceptsSnap,
        snippetsSnap,
      ] = await Promise.all([
        getDoc(langDocRef),
        getDocs(query(chaptersRef, orderBy('order', 'asc'))),
        getDocs(query(notesRef, orderBy('updatedAt', 'desc'))),
        getDocs(query(conceptsRef, orderBy('createdAt', 'desc'))),
        getDocs(query(snippetsRef, orderBy('createdAt', 'desc'))),
      ]);

      if (langSnap.exists()) {
        setLanguage({ id: langSnap.id, ...langSnap.data() } as Language);
      }

      setChapters(
        chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter))
      );
      setNotes(notesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note)));
      setConcepts(
        conceptsSnap.docs.map(
          doc => ({ id: doc.id, ...doc.data() }) as ProgrammingConcept
        )
      );
      setSnippets(
        snippetsSnap.docs.map(
          doc => ({ id: doc.id, ...doc.data() }) as CheatSheetItem
        )
      );
    } catch (error) {
      console.error('Error fetching language data:', error);
      toast({
        title: 'Алдаа',
        description: 'Мэдээлэл татахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [firestore, user, langId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generic CRUD handlers
  const handleSave = async (type: string, data: any) => {
    if (!user || !firestore || !langId) return;
    const path = `users/${user.uid}/languages/${langId}/${type}`;
    const collectionRef = collection(firestore, path);
    try {
      if (data.id) {
        // Update
        const docRef = doc(collectionRef, data.id);
        const { id, ...updateData } = data;
        await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      } else {
        // Add
        await addDoc(collectionRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      toast({ title: 'Амжилттай хадгаллаа.' });
      fetchData(); // Refetch all data
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      toast({ title: 'Хадгалахад алдаа гарлаа.', variant: 'destructive' });
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!user || !firestore || !langId) return;
    const path = `users/${user.uid}/languages/${langId}/${type}`;
    try {
      await deleteDoc(doc(firestore, path, id));
      toast({ title: 'Амжилттай устгалаа.' });
      fetchData(); // Refetch all data
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast({ title: 'Устгахад алдаа гарлаа.', variant: 'destructive' });
    }
  };

  const openDialog = (type: string, item: any | null = null) => {
    setSelectedItem(item);
    setDialogOpen(type);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-10 w-24" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-[60vh] lg:col-span-1 rounded-lg" />
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!language) {
    return (
      <div className="p-4 md:p-8">
        <BackButton />
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-muted-foreground">Хэл олдсонгүй.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <BackButton />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-bold text-primary">{language.name} Workspace</h2>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Бүлгүүд</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDialog('chapters')}>
                <PlusCircle className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {chapters.map(chapter => (
                  <li key={chapter.id} className="group flex items-center justify-between text-sm py-1 rounded hover:bg-muted">
                    <span className="truncate">{chapter.title}</span>
                    <span className="opacity-0 group-hover:opacity-100 flex items-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openDialog('chapters', chapter)}><Edit className="h-3 w-3" /></Button>
                      <AlertDialog>
                         <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader><AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle></AlertDialogHeader>
                           <AlertDialogFooter><AlertDialogCancel>Цуцлах</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('chapters', chapter.id!)}>Устгах</AlertDialogAction></AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                    </span>
                  </li>
                ))}
                {chapters.length === 0 && <p className="text-muted-foreground text-xs text-center py-2">Бүлэг байхгүй.</p>}
              </ul>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Гол ойлголтууд</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDialog('concepts')}><PlusCircle className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-2">
               {concepts.map(concept => (
                <div key={concept.id} className="group flex items-start gap-2 text-sm p-2 rounded hover:bg-muted">
                  <span className="text-lg mt-0.5">{concept.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold">{concept.title}</p>
                    <p className="text-xs text-muted-foreground">{concept.explanation}</p>
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 flex items-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openDialog('concepts', concept)}><Edit className="h-3 w-3" /></Button>
                       <AlertDialog>
                         <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader><AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle></AlertDialogHeader>
                           <AlertDialogFooter><AlertDialogCancel>Цуцлах</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('concepts', concept.id!)}>Устгах</AlertDialogAction></AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                  </span>
                </div>
              ))}
              {concepts.length === 0 && <p className="text-muted-foreground text-xs text-center py-2">Ойлголт байхгүй.</p>}
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader  className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-xl flex items-center gap-2"><StickyNote className="h-5 w-5"/> Notebook</CardTitle>
                <CardDescription>Сүүлийн үеийн тэмдэглэлүүд энд харагдана.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => openDialog('notes')}><PlusCircle className="h-4 w-4 mr-2" /> Шинэ тэмдэглэл</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {notes.slice(0, 3).map(note => (
                 <div key={note.id} className="group relative border-l-2 border-primary/50 pl-4 py-2 hover:bg-muted rounded">
                   <h4 className="font-bold">{note.title}</h4>
                   <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-2 text-muted-foreground"><ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown></div>
                   <span className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 flex items-center">
                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDialog('notes', note)}><Edit className="h-3 w-3" /></Button>
                      <AlertDialog>
                         <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader><AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle></AlertDialogHeader>
                           <AlertDialogFooter><AlertDialogCancel>Цуцлах</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('notes', note.id!)}>Устгах</AlertDialogAction></AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                   </span>
                 </div>
              ))}
              {notes.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">Тэмдэглэл байхгүй.</p>}
            </CardContent>
          </Card>

          <Card>
             <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-xl flex items-center gap-2"><Code2 className="h-5 w-5"/> Cheat Sheet</CardTitle>
                <CardDescription>Түгээмэл ашигладаг кодын хэсгүүд.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => openDialog('snippets')}><PlusCircle className="h-4 w-4 mr-2" /> Шинэ snippet</Button>
            </CardHeader>
            <CardContent className="space-y-4">
               {snippets.map(item => (
                <div key={item.id} className="group relative">
                  <h4 className="font-bold mb-1">{item.title}</h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none bg-muted rounded p-3 text-xs"><pre><code>{item.snippet}</code></pre></div>
                   <span className="opacity-0 group-hover:opacity-100 absolute top-0 right-0 flex items-center">
                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDialog('snippets', item)}><Edit className="h-3 w-3" /></Button>
                      <AlertDialog>
                         <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader><AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle></AlertDialogHeader>
                           <AlertDialogFooter><AlertDialogCancel>Цуцлах</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('snippets', item.id!)}>Устгах</AlertDialogAction></AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                   </span>
                </div>
              ))}
              {snippets.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">Snippet байхгүй.</p>}
            </CardContent>
          </Card>
        </main>
      </div>

       <ItemDialog
        open={dialogOpen === 'chapters'}
        onOpenChange={(open: boolean) => !open && setDialogOpen(null)}
        onSave={(data: any) => handleSave('chapters', data)}
        item={selectedItem}
        title="Chapter"
        fields={[{name: 'title', label: 'Title'}, {name: 'order', label: 'Order', type: 'number'}]}
      />
      <ItemDialog
        open={dialogOpen === 'notes'}
        onOpenChange={(open: boolean) => !open && setDialogOpen(null)}
        onSave={(data: any) => handleSave('notes', data)}
        item={selectedItem}
        title="Note"
        fields={[{name: 'title', label: 'Title'}, {name: 'content', label: 'Content', type: 'textarea'}]}
      />
      <ItemDialog
        open={dialogOpen === 'concepts'}
        onOpenChange={(open: boolean) => !open && setDialogOpen(null)}
        onSave={(data: any) => handleSave('concepts', data)}
        item={selectedItem}
        title="Concept"
        fields={[{name: 'title', label: 'Title'}, {name: 'emoji', label: 'Emoji'}, {name: 'explanation', label: 'Explanation', type: 'textarea'}]}
      />
      <ItemDialog
        open={dialogOpen === 'snippets'}
        onOpenChange={(open: boolean) => !open && setDialogOpen(null)}
        onSave={(data: any) => handleSave('snippets', data)}
        item={selectedItem}
        title="Snippet"
        fields={[{name: 'title', label: 'Title'}, {name: 'snippet', label: 'Code Snippet', type: 'textarea'}]}
      />
    </div>
  );
}
