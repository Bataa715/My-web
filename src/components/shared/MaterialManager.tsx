'use client';

import { useEffect, useState } from 'react';
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
import type { ReadingMaterial } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useEditMode } from '@/contexts/EditModeContext';
import { AddMaterialDialog } from '@/components/shared/AddMaterialDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, BookOpen, Sparkles, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/shared/BackButton';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
} from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import InteractiveParticles from './InteractiveParticles';

type CollectionName =
  | 'englishReading'
  | 'englishListening'
  | 'englishSpeaking'
  | 'englishWriting'
  | 'japaneseReading'
  | 'japaneseListening'
  | 'japaneseSpeaking';

interface MaterialManagerProps {
  collectionName: CollectionName;
  pageTitle: string;
  pageDescription: string;
  dialogTitle: string;
  dialogDescription: string;
}

export default function MaterialManager({
  collectionName,
  pageTitle,
  pageDescription,
  dialogTitle,
  dialogDescription,
}: MaterialManagerProps) {
  const { firestore, user } = useFirebase();
  const { isEditMode } = useEditMode();
  const [materials, setMaterials] = useState<ReadingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !firestore) {
      setLoading(false);
      return;
    }

    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const materialsCollection = collection(
          firestore,
          `users/${user.uid}/${collectionName}`
        );
        const q = query(materialsCollection, orderBy('createdAt', 'desc'));
        const materialsSnapshot = await getDocs(q);
        const materialsList = materialsSnapshot.docs.map(
          doc =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as ReadingMaterial
        );
        setMaterials(materialsList);
      } catch (error) {
        console.error(`Error fetching ${collectionName}: `, error);
        toast({
          title: 'Алдаа',
          description: 'Материал татахад алдаа гарлаа.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [firestore, user, collectionName, toast]);

  const handleAddMaterial = async (
    newMaterial: Omit<ReadingMaterial, 'id' | 'createdAt'>
  ) => {
    if (!firestore || !user) {
      toast({
        title: 'Алдаа',
        description: 'Материал нэмэхийн тулд нэвтэрнэ үү.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const materialsCollection = collection(
        firestore,
        `users/${user.uid}/${collectionName}`
      );
      const docRef = await addDoc(materialsCollection, {
        ...newMaterial,
        createdAt: serverTimestamp(),
      });
      setMaterials(prevMaterials => [
        { id: docRef.id, ...newMaterial, createdAt: new Date() },
        ...prevMaterials,
      ]);
      toast({ title: 'Амжилттай', description: 'Шинэ материал нэмэгдлээ.' });
    } catch (error) {
      console.error('Error adding new material: ', error);
      toast({
        title: 'Алдаа',
        description: 'Материал нэмэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!firestore || !user) {
      toast({
        title: 'Алдаа',
        description: 'Материал устгахын тулд нэвтэрнэ үү.',
        variant: 'destructive',
      });
      return;
    }
    const originalMaterials = [...materials];
    setMaterials(prevMaterials =>
      prevMaterials.filter(material => material.id !== id)
    );
    try {
      await deleteDoc(
        doc(firestore, `users/${user.uid}/${collectionName}`, id)
      );
      toast({ title: 'Амжилттай', description: 'Материал устгагдлаа.' });
    } catch (error) {
      console.error('Error deleting material: ', error);
      setMaterials(originalMaterials);
      toast({
        title: 'Алдаа',
        description: 'Материал устгахад алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
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
        {showBackButton && <BackButton />}

        {/* Hero Section */}
        <div className="text-center pt-8 flex flex-col items-center justify-center gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-teal-500/30 blur-3xl rounded-full scale-150" />
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/20">
              <BookOpen className="h-12 w-12 text-blue-400" />
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.h1
              className="text-4xl md:text-5xl font-bold font-headline bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {pageTitle}
            </motion.h1>
            {isEditMode && showAddButton && (
              <AddMaterialDialog
                onAddMaterial={handleAddMaterial}
                dialogTitle={dialogTitle}
                dialogDescription={dialogDescription}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
                >
                  <PlusCircle className="h-5 w-5 text-blue-400" />
                  <span className="sr-only">Шинэ материал нэмэх</span>
                </Button>
              </AddMaterialDialog>
            )}
          </div>
          <motion.p
            className="text-muted-foreground max-w-2xl text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {pageDescription}
          </motion.p>
        </div>

        {loading ? (
          <div className="space-y-4 pt-8 max-w-4xl mx-auto">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : !user ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-xl border-0 rounded-2xl p-8 shadow-lg shadow-blue-500/5">
              <CardContent className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-blue-500/10">
                  <Sparkles className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-muted-foreground text-lg">
                  Материал харахын тулд нэвтэрнэ үү.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="pt-8 space-y-6 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {materials.length > 0 ? (
              materials.map((material, index) => (
                <motion.div key={material.id} variants={itemVariants}>
                  <Card className="relative group bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 transition-all duration-500">
                    {/* Gradient border effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <CardHeader className="relative">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                            <FileText className="h-5 w-5 text-blue-400" />
                          </div>
                          <CardTitle className="text-xl font-semibold">
                            {material.title}
                          </CardTitle>
                        </div>
                        {isEditMode && material.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Та итгэлтэй байна уу?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Энэ үйлдлийг буцаах боломжгүй. "
                                  {material.title}" материал бүрмөсөн устгагдах
                                  болно.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteMaterial(material.id!)
                                  }
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Устгах
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                      {material.source && (
                        <CardDescription className="mt-2 text-blue-400/70">
                          Эх сурвалж: {material.source}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="relative prose dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-blue-400 prose-strong:text-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {material.content}
                      </ReactMarkdown>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div variants={itemVariants}>
                <Card className="text-center p-12 bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
                  <CardContent className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                      <BookOpen className="h-10 w-10 text-blue-400" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Одоогоор материал байхгүй байна.
                    </p>
                    {isEditMode && showAddButton && (
                      <AddMaterialDialog
                        onAddMaterial={handleAddMaterial}
                        dialogTitle={dialogTitle}
                        dialogDescription={dialogDescription}
                      >
                        <Button className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Эхний материалаа нэмэх
                        </Button>
                      </AddMaterialDialog>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
