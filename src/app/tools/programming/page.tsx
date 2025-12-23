
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, orderBy, query, writeBatch, doc, addDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import BackButton from '@/components/shared/BackButton';
import type { CheatSheetItem, ProgrammingConcept, ProgressItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { initialConcepts, initialCheatSheetItems, initialProgressItems } from '@/data/programming';
import { useToast } from '@/hooks/use-toast';
import SkillTree from './components/SkillTree';
import CodePlayground from './components/CodePlayground';
import DailyQuest from './components/DailyQuest';

export default function ProgrammingPage() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [concepts, setConcepts] = useState<ProgrammingConcept[]>([]);
    const [cheatSheetItems, setCheatSheetItems] = useState<CheatSheetItem[]>([]);
    const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user || !firestore) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const basePath = `users/${user.uid}`;
            const conceptsRef = collection(firestore, `${basePath}/programmingConcepts`);
            const cheatSheetRef = collection(firestore, `${basePath}/cheatSheetItems`);
            const progressItemsRef = collection(firestore, `${basePath}/progressItems`);

            const [conceptsSnap, cheatSheetSnap, progressItemsSnap] = await Promise.all([
                getDocs(query(conceptsRef, orderBy("title"))),
                getDocs(query(cheatSheetRef)),
                getDocs(query(progressItemsRef, orderBy("label")))
            ]);

            if (conceptsSnap.empty && cheatSheetSnap.empty && progressItemsSnap.empty) {
                console.log("No programming data found, seeding initial data...");
                const batch = writeBatch(firestore);
                initialConcepts.forEach(item => batch.set(doc(conceptsRef), item));
                initialCheatSheetItems.forEach(item => batch.set(doc(cheatSheetRef), item));
                initialProgressItems.forEach(item => batch.set(doc(progressItemsRef), { ...item, learned: false, practicing: false }));
                await batch.commit();
                await fetchData();
                return;
            }

            const conceptsData = conceptsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgrammingConcept));
            setConcepts(conceptsData);

            const cheatSheetItemsData = cheatSheetSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheatSheetItem));
            setCheatSheetItems(cheatSheetItemsData);

            const progressItemsData = progressItemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgressItem));
            setProgressItems(progressItemsData);

        } catch (error) {
            console.error("Error fetching programming data:", error);
            toast({ title: "Алдаа", description: "Програмчлалын өгөгдөл татахад алдаа гарлаа.", variant: "destructive" });
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

    // Handlers for Concepts
    const handleAddConcept = async (concept: Omit<ProgrammingConcept, 'id'>) => {
        if (!user || !firestore) return;
        const conceptsRef = collection(firestore, `users/${user.uid}/programmingConcepts`);
        const docRef = await addDoc(conceptsRef, concept);
        setConcepts(prev => [...prev, { ...concept, id: docRef.id }].sort((a,b) => a.title.localeCompare(b.title)));
        toast({ title: "Амжилттай нэмэгдлээ."});
    };
    const handleUpdateConcept = async (id: string, concept: Omit<ProgrammingConcept, 'id'>) => {
        if (!user || !firestore) return;
        const docRef = doc(firestore, `users/${user.uid}/programmingConcepts`, id);
        await updateDoc(docRef, concept);
        setConcepts(prev => prev.map(c => c.id === id ? { ...c, ...concept } : c).sort((a,b) => a.title.localeCompare(b.title)));
         toast({ title: "Амжилттай шинэчлэгдлээ."});
    };
    const handleDeleteConcept = async (id: string) => {
        if (!user || !firestore) return;
        const docRef = doc(firestore, `users/${user.uid}/programmingConcepts`, id);
        await deleteDoc(docRef);
        setConcepts(prev => prev.filter(c => c.id !== id));
        toast({ title: "Амжилттай устгагдлаа."});
    };

    // Handlers for Cheat Sheet
    const handleAddCheatSheetItem = async (item: Omit<CheatSheetItem, 'id'>) => {
        if (!user || !firestore) return;
        const ref = collection(firestore, `users/${user.uid}/cheatSheetItems`);
        const docRef = await addDoc(ref, item);
        setCheatSheetItems(prev => [...prev, { ...item, id: docRef.id }]);
        toast({ title: "Амжилттай нэмэгдлээ."});
    };
    const handleUpdateCheatSheetItem = async (id: string, item: Omit<CheatSheetItem, 'id'>) => {
        if (!user || !firestore) return;
        const docRef = doc(firestore, `users/${user.uid}/cheatSheetItems`, id);
        await updateDoc(docRef, item);
        setCheatSheetItems(prev => prev.map(i => i.id === id ? { ...i, ...item } : i));
        toast({ title: "Амжилттай шинэчлэгдлээ."});
    };
    const handleDeleteCheatSheetItem = async (id: string) => {
        if (!user || !firestore) return;
        const docRef = doc(firestore, `users/${user.uid}/cheatSheetItems`, id);
        await deleteDoc(docRef);
        setCheatSheetItems(prev => prev.filter(i => i.id !== id));
        toast({ title: "Амжилттай устгагдлаа."});
    };

    // Handlers for Progress Items
    const handleAddProgressItem = async (item: Omit<ProgressItem, 'id' | 'learned' | 'practicing'>) => {
        if (!user || !firestore) return;
        const ref = collection(firestore, `users/${user.uid}/progressItems`);
        const docRef = await addDoc(ref, { ...item, learned: false, practicing: false });
        setProgressItems(prev => [...prev, { ...item, id: docRef.id, learned: false, practicing: false }].sort((a,b) => a.label.localeCompare(b.label)));
        toast({ title: "Амжилттай нэмэгдлээ."});
    };
    const handleUpdateProgressItem = async (id: string, item: Omit<ProgressItem, 'id' | 'learned' | 'practicing'>) => {
        if (!user || !firestore) return;
        const docRef = doc(firestore, `users/${user.uid}/progressItems`, id);
        await updateDoc(docRef, item);
        setProgressItems(prev => prev.map(i => i.id === id ? { ...i, ...item } : i).sort((a,b) => a.label.localeCompare(b.label)));
        toast({ title: "Амжилттай шинэчлэгдлээ."});
    };
    const handleDeleteProgressItem = async (id: string) => {
        if (!user || !firestore) return;
        const docRef = doc(firestore, `users/${user.uid}/progressItems`, id);
        await deleteDoc(docRef);
        setProgressItems(prev => prev.filter(i => i.id !== id));
        toast({ title: "Амжилттай устгагдлаа."});
    };


    return (
        <div className="space-y-8 p-4 md:p-8">
            <BackButton />
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tighter text-primary">Programming Dashboard</h1>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Cybernetic learning environment for developers.</p>
            </div>

            {loading ? (
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-96 lg:col-span-1 rounded-lg" />
                    <Skeleton className="h-96 lg:col-span-2 rounded-lg" />
                    <Skeleton className="h-96 lg:col-span-1 rounded-lg" />
                </div>
            ) : !user ? (
                <div className="text-center py-20 mt-4 glassmorphism-card">
                    <p className="text-lg text-muted-foreground">Програмчлалын хэрэгслүүдийг харахын тулд нэвтэрнэ үү.</p>
                </div>
            ) : (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column: Skill Tree */}
                    <div className="lg:col-span-1">
                        <SkillTree
                            concepts={concepts}
                            onAddConcept={handleAddConcept}
                            onUpdateConcept={handleUpdateConcept}
                            onDeleteConcept={handleDeleteConcept}
                        />
                    </div>

                    {/* Center Column: Code Playground */}
                    <div className="lg:col-span-2">
                        <CodePlayground
                            items={cheatSheetItems}
                            onAddItem={handleAddCheatSheetItem}
                            onUpdateItem={handleUpdateCheatSheetItem}
                            onDeleteItem={handleDeleteCheatSheetItem}
                        />
                    </div>

                    {/* Right Column: Daily Quest */}
                    <div className="lg:col-span-1">
                        <DailyQuest
                            initialItems={progressItems}
                            onAddItem={handleAddProgressItem}
                            onUpdateItem={handleUpdateProgressItem}
                            onDeleteItem={handleDeleteProgressItem}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
