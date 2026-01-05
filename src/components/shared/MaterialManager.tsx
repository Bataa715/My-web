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
import { PlusCircle, Trash2 } from 'lucide-react';
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

  return (
    <div className="space-y-8">
      <BackButton />
      <div className="text-center pt-8 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold font-headline">{pageTitle}</h1>
          {isEditMode && (
            <AddMaterialDialog
              onAddMaterial={handleAddMaterial}
              dialogTitle={dialogTitle}
              dialogDescription={dialogDescription}
            >
              <Button variant="outline" size="icon">
                <PlusCircle className="h-5 w-5" />
                <span className="sr-only">Шинэ материал нэмэх</span>
              </Button>
            </AddMaterialDialog>
          )}
        </div>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          {pageDescription}
        </p>
      </div>
      {loading ? (
        <div className="space-y-4 pt-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : !user ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            Материал харахын тулд нэвтэрнэ үү.
          </p>
        </div>
      ) : (
        <div className="pt-8 space-y-4">
          {materials.length > 0 ? (
            materials.map(material => (
              <Card key={material.id} className="relative group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{material.title}</CardTitle>
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
                              Энэ үйлдлийг буцаах боломжгүй. "{material.title}"
                              материал бүрмөсөн устгагдах болно.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteMaterial(material.id!)}
                            >
                              Устгах
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  {material.source && (
                    <CardDescription>
                      Эх сурвалж: {material.source}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {material.content}
                  </ReactMarkdown>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="text-center p-8">
              <CardContent>
                <p className="text-muted-foreground">
                  Одоогоор материал байхгүй байна.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
