'use client';

import { useEffect, useState, useCallback, use, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import TechIcon from '@/components/shared/TechIcon';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlusCircle,
  Edit,
  Trash2,
  StickyNote,
  Lightbulb,
  Code2,
  FileText,
  Terminal,
  Clock,
  BookMarked,
  Copy,
  Check,
  FolderOpen,
  Folder,
  ArrowLeft,
  ChevronRight,
  Plus,
  Minus,
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
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Code snippet component with copy functionality and collapse/expand
const CodeSnippet = ({
  code,
  title,
  onEdit,
  onDelete,
}: {
  code: string;
  title: string;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split('\n').length;
  const shouldCollapse = lineCount > 5;
  const previewCode = shouldCollapse
    ? code.split('\n').slice(0, 4).join('\n') + '\n...'
    : code;

  return (
    <motion.div
      variants={itemVariants}
      className="group relative bg-card/50 backdrop-blur-xs rounded-2xl border border-border/50 overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
      onClick={() => shouldCollapse && setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-green-400" />
          <span className="font-medium text-sm">{title}</span>
          {shouldCollapse && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {lineCount} мөр
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {shouldCollapse && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={e => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <>
                  <Minus className="h-3 w-3 mr-1" />
                  Хураах
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Дэлгэх
                </>
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={e => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={e => e.stopPropagation()}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Устгахдаа итгэлтэй байна уу?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Устгах</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.pre
          key={isExpanded ? 'expanded' : 'collapsed'}
          initial={{ height: 'auto' }}
          animate={{ height: 'auto' }}
          className={cn(
            'p-4 overflow-x-auto text-sm',
            !isExpanded && shouldCollapse && 'max-h-[140px] overflow-hidden'
          )}
        >
          <code className="text-green-300 font-mono">
            {isExpanded || !shouldCollapse ? code : previewCode}
          </code>
        </motion.pre>
      </AnimatePresence>
      {!isExpanded && shouldCollapse && (
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-card/90 to-transparent pointer-events-none flex items-end justify-center pb-2">
          <span className="text-xs text-muted-foreground">
            Дарж бүтнээр харах
          </span>
        </div>
      )}
    </motion.div>
  );
};

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
      <DialogContent className="bg-card/95 backdrop-blur-xl border-0 max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {item ? `${title} засах` : `Шинэ ${title} нэмэх`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {fields.map((field: any) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  value={(formData as any)[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required
                  rows={field.name === 'snippet' ? 10 : 4}
                  className="bg-background/50 border-border/50 focus:border-primary/50 rounded-xl resize-none"
                />
              ) : (
                <Input
                  id={field.name}
                  value={(formData as any)[field.name] || ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required
                  type={field.type || 'text'}
                  className="bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
                />
              )}
            </div>
          ))}
          <DialogFooter className="gap-2 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="rounded-xl">
                Цуцлах
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="rounded-xl bg-linear-to-r from-orange-500 to-amber-500 text-white"
            >
              Хадгалах
            </Button>
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
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

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

      const [langSnap, chaptersSnap, notesSnap, conceptsSnap, snippetsSnap] =
        await Promise.all([
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
        chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Chapter)
      );
      setNotes(
        notesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Note)
      );
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

  // Get notes for selected chapter
  const chapterNotes = useMemo(() => {
    if (!selectedChapter) return [];
    return notes.filter(note => note.chapterId === selectedChapter.id);
  }, [notes, selectedChapter]);

  // Get notes count per chapter
  const getNotesCount = useCallback(
    (chapterId: string) => {
      return notes.filter(note => note.chapterId === chapterId).length;
    },
    [notes]
  );

  // Update progress
  const updateProgress = async (delta: number) => {
    if (!user || !firestore || !langId || !language) return;
    const newProgress = Math.max(
      0,
      Math.min(100, (language.progress || 0) + delta)
    );
    try {
      const langDocRef = doc(
        firestore,
        `users/${user.uid}/languages/${langId}`
      );
      await updateDoc(langDocRef, { progress: newProgress });
      setLanguage(prev => (prev ? { ...prev, progress: newProgress } : prev));
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({ title: 'Явц шинэчлэхэд алдаа гарлаа.', variant: 'destructive' });
    }
  };

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
        await updateDoc(docRef, {
          ...updateData,
          updatedAt: serverTimestamp(),
        });
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

  const accentColor = language?.primaryColor || '249, 115, 22';

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <InteractiveParticles quantity={30} />
        <div className="p-4 md:p-8 space-y-6 relative z-10">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <div className="flex flex-col lg:flex-row gap-8">
            <Skeleton className="h-64 w-full lg:w-80 rounded-2xl" />
            <div className="flex-1 space-y-6">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!language) {
    return (
      <div className="min-h-screen relative">
        <InteractiveParticles quantity={30} />
        <div className="p-4 md:p-8 relative z-10">
          <BackButton />
          <div className="flex flex-col justify-center items-center h-[60vh]">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Code2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">Хэл олдсонгүй.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative"
    >
      <InteractiveParticles quantity={40} />

      <div className="relative z-10 p-4 md:p-8 pt-4">
        <BackButton />

        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-80 shrink-0 space-y-6"
          >
            {/* Language Info Card */}
            <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
              <div
                className="h-24 relative"
                style={{
                  background: `linear-gradient(135deg, rgba(${accentColor}, 0.3), rgba(${accentColor}, 0.1))`,
                }}
              >
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center bg-card border-4 border-background"
                    style={{
                      color: `rgb(${accentColor})`,
                      boxShadow: `0 0 20px rgba(${accentColor}, 0.3)`,
                    }}
                  >
                    <TechIcon techName={language.iconUrl} className="w-8 h-8" />
                  </div>
                </div>
              </div>
              <CardContent className="pt-12 pb-6 text-center">
                <h2 className="text-2xl font-bold mb-2">{language.name}</h2>
                <p className="text-muted-foreground text-sm mb-4">Workspace</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-muted/30">
                    <p
                      className="text-lg font-bold"
                      style={{ color: `rgb(${accentColor})` }}
                    >
                      {chapters.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Бүлэг</p>
                  </div>
                  <div className="p-2 rounded-xl bg-muted/30">
                    <p
                      className="text-lg font-bold"
                      style={{ color: `rgb(${accentColor})` }}
                    >
                      {notes.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Тэмдэглэл</p>
                  </div>
                  <div className="p-2 rounded-xl bg-muted/30">
                    <p
                      className="text-lg font-bold"
                      style={{ color: `rgb(${accentColor})` }}
                    >
                      {snippets.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Snippet</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Явц</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-muted/50"
                        onClick={() => updateProgress(-5)}
                        disabled={language.progress <= 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium w-10 text-center">
                        {language.progress}%
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-muted/50"
                        onClick={() => updateProgress(5)}
                        disabled={language.progress >= 100}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${language.progress}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `rgb(${accentColor})` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Concepts Card - Always visible in sidebar */}
            <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Lightbulb
                    className="h-4 w-4"
                    style={{ color: `rgb(${accentColor})` }}
                  />
                  <CardTitle className="text-base font-medium">
                    Гол ойлголтууд
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-muted/50"
                  onClick={() => openDialog('concepts')}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {concepts.slice(0, 5).map((concept, index) => (
                    <motion.div
                      key={concept.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{concept.emoji || '💡'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{concept.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {concept.explanation}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {concepts.length === 0 && (
                  <p className="text-muted-foreground text-xs text-center py-4">
                    Ойлголт нэмээрэй
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 min-w-0"
          >
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="bg-card/50 backdrop-blur-xl border-0 rounded-xl p-1 mb-6 w-full sm:w-auto">
                <TabsTrigger
                  value="notes"
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <StickyNote className="h-4 w-4" />
                  <span className="hidden sm:inline">Тэмдэглэл</span>
                </TabsTrigger>
                <TabsTrigger
                  value="snippets"
                  className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <Code2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Snippets</span>
                </TabsTrigger>
              </TabsList>

              {/* Notes Tab - with Chapters */}
              <TabsContent value="notes" className="space-y-4">
                <AnimatePresence mode="wait">
                  {selectedChapter ? (
                    // Chapter Notes View
                    <motion.div
                      key="chapter-notes"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl"
                            onClick={() => setSelectedChapter(null)}
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                          <div>
                            <div className="flex items-center gap-2">
                              <FolderOpen
                                className="h-5 w-5"
                                style={{ color: `rgb(${accentColor})` }}
                              />
                              <h3 className="text-xl font-bold">
                                {selectedChapter.title}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {chapterNotes.length} тэмдэглэл
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => openDialog('notes')}
                          className="rounded-xl gap-2 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">Шинэ</span>
                        </Button>
                      </div>

                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
                        <AnimatePresence mode="popLayout">
                          {chapterNotes.map((note, index) => (
                            <motion.div
                              key={note.id}
                              variants={itemVariants}
                              layout
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ delay: index * 0.05 }}
                              className="group relative cursor-pointer"
                              onClick={() => setViewingNote(note)}
                            >
                              <div
                                className="h-48 bg-card/50 backdrop-blur-xs border-0 rounded-2xl overflow-hidden hover:bg-card/70 transition-all hover:scale-[1.02] hover:shadow-lg p-4 flex flex-col relative"
                                style={{
                                  boxShadow: `0 4px 20px rgba(${accentColor}, 0.1)`,
                                }}
                              >
                                <div
                                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                                  style={{ background: `rgb(${accentColor})` }}
                                />
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-base line-clamp-1 flex-1 pr-2">
                                    {note.title}
                                  </h4>
                                  <div
                                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => openDialog('notes', note)}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-0 rounded-2xl">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Устгахдаа итгэлтэй байна уу?
                                          </AlertDialogTitle>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="rounded-xl">
                                            Цуцлах
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              handleDelete('notes', note.id!)
                                            }
                                            className="rounded-xl"
                                          >
                                            Устгах
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <p className="text-sm text-muted-foreground line-clamp-4">
                                    {note.content}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 pt-2 mt-auto border-t border-border/30">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {(note as any).updatedAt
                                      ? new Date(
                                          (note as any).updatedAt.seconds * 1000
                                        ).toLocaleDateString('mn-MN')
                                      : 'Огноо байхгүй'}
                                  </span>
                                </div>
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                                    Дарж унших
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {chapterNotes.length === 0 && (
                          <motion.div
                            variants={itemVariants}
                            className="text-center py-16 col-span-full"
                          >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                              <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">
                              Энэ бүлэгт тэмдэглэл байхгүй.
                            </p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                              Шинэ тэмдэглэл нэмж эхлээрэй!
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.div>
                  ) : (
                    // Chapters & Concepts Grid View (default)
                    <motion.div
                      key="chapters-view"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      {/* Chapters Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              <BookMarked
                                className="h-5 w-5"
                                style={{ color: `rgb(${accentColor})` }}
                              />
                              Бүлгүүд
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Бүлэг дээр дарж тэмдэглэлүүдээ харна уу
                            </p>
                          </div>
                          <Button
                            onClick={() => openDialog('chapters')}
                            className="rounded-xl gap-2 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                          >
                            <PlusCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Шинэ бүлэг</span>
                          </Button>
                        </div>

                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                          <AnimatePresence mode="popLayout">
                            {chapters.map((chapter, index) => (
                              <motion.div
                                key={chapter.id}
                                variants={itemVariants}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className="group cursor-pointer"
                                onClick={() => setSelectedChapter(chapter)}
                              >
                                <div
                                  className="bg-card/50 backdrop-blur-xs rounded-2xl p-5 hover:bg-card/70 transition-all hover:scale-[1.02]"
                                  style={{
                                    boxShadow: `0 4px 20px rgba(${accentColor}, 0.1)`,
                                  }}
                                >
                                  <div className="flex items-center gap-4">
                                    <div
                                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                                      style={{
                                        backgroundColor: `rgba(${accentColor}, 0.15)`,
                                        color: `rgb(${accentColor})`,
                                      }}
                                    >
                                      <FolderOpen className="h-7 w-7" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-muted-foreground">
                                          {String(
                                            chapter.order || index + 1
                                          ).padStart(2, '0')}
                                        </span>
                                        <h4 className="font-semibold text-lg truncate">
                                          {chapter.title}
                                        </h4>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {getNotesCount(chapter.id!)} тэмдэглэл
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                        onClick={e => e.stopPropagation()}
                                      >
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() =>
                                            openDialog('chapters', chapter)
                                          }
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-destructive hover:text-destructive"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-0 rounded-2xl">
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>
                                                Бүлэг устгах уу?
                                              </AlertDialogTitle>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel className="rounded-xl">
                                                Цуцлах
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() =>
                                                  handleDelete(
                                                    'chapters',
                                                    chapter.id!
                                                  )
                                                }
                                                className="rounded-xl"
                                              >
                                                Устгах
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          {chapters.length === 0 && (
                            <motion.div
                              variants={itemVariants}
                              className="text-center py-12 col-span-full"
                            >
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                                <Folder className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <p className="text-muted-foreground">
                                Бүлэг байхгүй байна.
                              </p>
                              <p className="text-sm text-muted-foreground/70 mt-1">
                                Бүлэг нэмж тэмдэглэлүүдээ зохион байгуулаарай!
                              </p>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>

                      {/* Concepts Section - Shown when not in a chapter */}
                      {concepts.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-border/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold flex items-center gap-2">
                                <Lightbulb
                                  className="h-5 w-5"
                                  style={{ color: `rgb(${accentColor})` }}
                                />
                                Гол ойлголтууд
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Чухал ойлголтуудаа энд хадгална
                              </p>
                            </div>
                            <Button
                              onClick={() => openDialog('concepts')}
                              variant="outline"
                              className="rounded-xl gap-2"
                            >
                              <PlusCircle className="h-4 w-4" />
                              <span className="hidden sm:inline">Нэмэх</span>
                            </Button>
                          </div>

                          <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                          >
                            <AnimatePresence mode="popLayout">
                              {concepts.map((concept, index) => (
                                <motion.div
                                  key={concept.id}
                                  variants={itemVariants}
                                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="group"
                                >
                                  <div
                                    className="bg-card/50 backdrop-blur-xs rounded-2xl p-4 hover:bg-card/70 transition-all cursor-pointer"
                                    style={{
                                      boxShadow: `0 4px 20px rgba(${accentColor}, 0.1)`,
                                    }}
                                  >
                                    <div className="flex items-start gap-3">
                                      <span className="text-2xl">
                                        {concept.emoji || '💡'}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-semibold text-base">
                                            {concept.title}
                                          </h4>
                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7"
                                              onClick={() =>
                                                openDialog('concepts', concept)
                                              }
                                            >
                                              <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                                >
                                                  <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-0 rounded-2xl">
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>
                                                    Устгахдаа итгэлтэй байна уу?
                                                  </AlertDialogTitle>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel className="rounded-xl">
                                                    Цуцлах
                                                  </AlertDialogCancel>
                                                  <AlertDialogAction
                                                    onClick={() =>
                                                      handleDelete(
                                                        'concepts',
                                                        concept.id!
                                                      )
                                                    }
                                                    className="rounded-xl"
                                                  >
                                                    Устгах
                                                  </AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                          </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                          {concept.explanation}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Note View Modal */}
                <Dialog
                  open={!!viewingNote}
                  onOpenChange={open => !open && setViewingNote(null)}
                >
                  <DialogContent className="bg-card/95 backdrop-blur-xl border-0 max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden">
                    {viewingNote && (
                      <>
                        <DialogHeader className="pb-4 border-b border-border/30">
                          <DialogTitle className="text-2xl font-bold text-foreground">
                            {viewingNote.title}
                          </DialogTitle>
                          <DialogDescription className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {(viewingNote as any).updatedAt
                                ? new Date(
                                    (viewingNote as any).updatedAt.seconds *
                                      1000
                                  ).toLocaleDateString('mn-MN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })
                                : 'Огноо байхгүй'}
                            </span>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="overflow-y-auto max-h-[60vh] py-4">
                          <div className="prose prose-sm prose-invert max-w-none text-foreground [&_p]:text-foreground [&_li]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground [&_strong]:text-foreground [&_code]:text-green-300 [&_pre]:bg-muted/50">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {viewingNote.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <DialogFooter className="pt-4 border-t border-border/30 gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => setViewingNote(null)}
                            className="rounded-xl"
                          >
                            Хаах
                          </Button>
                          <Button
                            onClick={() => {
                              setViewingNote(null);
                              openDialog('notes', viewingNote);
                            }}
                            className="rounded-xl bg-linear-to-r from-orange-500 to-amber-500 text-white gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Засах
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </TabsContent>

              {/* Snippets Tab */}
              <TabsContent value="snippets" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Code Snippets</h3>
                    <p className="text-sm text-muted-foreground">
                      Түгээмэл ашигладаг кодын хэсгүүд
                    </p>
                  </div>
                  <Button
                    onClick={() => openDialog('snippets')}
                    className="rounded-xl gap-2 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Шинэ</span>
                  </Button>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {snippets.map(item => (
                      <CodeSnippet
                        key={item.id}
                        title={item.title}
                        code={item.snippet}
                        onEdit={() => openDialog('snippets', item)}
                        onDelete={() => handleDelete('snippets', item.id!)}
                      />
                    ))}
                  </AnimatePresence>
                  {snippets.length === 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="text-center py-16"
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                        <Terminal className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Snippet байхгүй байна.
                      </p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Кодын хэсгүүдээ хадгалаарай!
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.main>
        </div>
      </div>

      {/* Dialogs */}
      <ItemDialog
        open={dialogOpen === 'chapters'}
        onOpenChange={(open: boolean) => !open && setDialogOpen(null)}
        onSave={(data: any) => handleSave('chapters', data)}
        item={selectedItem}
        title="Бүлэг"
        fields={[
          { name: 'title', label: 'Гарчиг', placeholder: 'Бүлгийн нэр' },
          { name: 'order', label: 'Дугаар', type: 'number', placeholder: '1' },
        ]}
      />
      <ItemDialog
        open={dialogOpen === 'notes'}
        onOpenChange={(open: boolean) => !open && setDialogOpen(null)}
        onSave={(data: any) =>
          handleSave('notes', { ...data, chapterId: selectedChapter?.id })
        }
        item={selectedItem}
        title="Тэмдэглэл"
        fields={[
          { name: 'title', label: 'Гарчиг', placeholder: 'Тэмдэглэлийн нэр' },
          {
            name: 'content',
            label: 'Агуулга (Markdown дэмждэг)',
            type: 'textarea',
            placeholder: '## Гарчиг\n\nТайлбар...',
          },
        ]}
      />
      <ItemDialog
        open={dialogOpen === 'concepts'}
        onOpenChange={(open: boolean) => !open && setDialogOpen(null)}
        onSave={(data: any) => handleSave('concepts', data)}
        item={selectedItem}
        title="Ойлголт"
        fields={[
          { name: 'title', label: 'Гарчиг', placeholder: 'Ойлголтын нэр' },
          { name: 'emoji', label: 'Emoji', placeholder: '💡' },
          {
            name: 'explanation',
            label: 'Тайлбар',
            type: 'textarea',
            placeholder: 'Ойлголтын тайлбар...',
          },
        ]}
      />
      <ItemDialog
        open={dialogOpen === 'snippets'}
        onOpenChange={(open: boolean) => !open && setDialogOpen(null)}
        onSave={(data: any) => handleSave('snippets', data)}
        item={selectedItem}
        title="Snippet"
        fields={[
          { name: 'title', label: 'Гарчиг', placeholder: 'Snippet-ийн нэр' },
          {
            name: 'snippet',
            label: 'Код',
            type: 'textarea',
            placeholder: 'console.log("Hello World")',
          },
        ]}
      />
    </motion.div>
  );
}
