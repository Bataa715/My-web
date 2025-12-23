
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, orderBy, query, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import BackButton from '@/components/shared/BackButton';
import type { Language } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import LanguageCard from './components/LanguageCard';
import { AddLanguageDialog } from './components/AddLanguageDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function ProgrammingPage() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user || !firestore) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const languagesRef = collection(firestore, `users/${user.uid}/languages`);
            const q = query(languagesRef, orderBy("createdAt", "asc"));
            const snapshot = await getDocs(q);
            
            const langData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Language));
            setLanguages(langData);

        } catch (error) {
            console.error("Error fetching programming languages:", error);
            toast({ title: "Алдаа", description: "Програмчлалын хэлний мэдээлэл татахад алдаа гарлаа.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [firestore, user, toast]);

    useEffect(() => {
        if(user && firestore) {
            fetchData();
        } else if (!user) {
            setLoading(false);
        }
    }, [user, firestore, fetchData]);

    const handleAddLanguage = async (language: Omit<Language, 'id' | 'createdAt' | 'progress'>) => {
        if (!user || !firestore) return;
        const langRef = collection(firestore, `users/${user.uid}/languages`);
        try {
            const newLang = { ...language, progress: 0, createdAt: serverTimestamp() };
            const docRef = await addDoc(langRef, newLang);
            setLanguages(prev => [...prev, { ...language, id: docRef.id, progress: 0, createdAt: new Date() }]);
            toast({ title: "Амжилттай нэмэгдлээ."});
        } catch (error) {
            console.error(error);
            toast({ title: "Алдаа гарлаа", variant: "destructive" });
        }
    };
    
    const handleDeleteLanguage = async (id: string, name: string) => {
        if (!user || !firestore) return;
        const originalLanguages = [...languages];
        setLanguages(prev => prev.filter(l => l.id !== id));
        try {
            const docRef = doc(firestore, `users/${user.uid}/languages`, id);
            await deleteDoc(docRef);
            toast({ title: `"${name}" устгагдлаа` });
        } catch (error) {
            setLanguages(originalLanguages);
            toast({ title: "Алдаа", description: "Хэл устгахад алдаа гарлаа.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex justify-between items-center">
                 <BackButton />
                 <AddLanguageDialog onAddLanguage={handleAddLanguage}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Шинэ хэл нэмэх
                    </Button>
                </AddLanguageDialog>
            </div>
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tighter text-primary">The Language Library</h1>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Өөрийн суралцах програмчлалын хэлнүүдээ удирдаарай.</p>
            </div>

            {loading ? (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                </div>
            ) : !user ? (
                <div className="text-center py-20 mt-4 glassmorphism-card">
                    <p className="text-lg text-muted-foreground">Хэлнүүдийг харахын тулд нэвтэрнэ үү.</p>
                </div>
            ) : (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {languages.map(lang => (
                        <LanguageCard key={lang.id} language={lang} onDelete={handleDeleteLanguage} />
                    ))}
                     {languages.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <p className="text-muted-foreground">Та одоогоор ямар ч хэл нэмээгүй байна.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
