
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import BackButton from "@/components/shared/BackButton";
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, getDocs, query, orderBy, writeBatch, serverTimestamp } from 'firebase/firestore';
import type { Exercise, WorkoutLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, Dumbbell, History, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
    

const AddExerciseDialog = ({ onAdd }: { onAdd: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [open, setOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name && category) {
            onAdd({ name, category });
            setName('');
            setCategory('');
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Шинэ дасгал нэмэх
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Шинэ дасгал нэмэх</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="ex-name">Дасгалын нэр</Label>
                        <Input id="ex-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Суниалт" required />
                    </div>
                    <div>
                        <Label htmlFor="ex-category">Ангилал</Label>
                        <Input id="ex-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Цээж, Гар..." required />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Цуцлах</Button></DialogClose>
                        <Button type="submit">Нэмэх</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

const LogWorkoutDialog = ({ exercise, onLog }: { exercise: Exercise, onLog: (log: Omit<WorkoutLog, 'id' | 'date'>) => void }) => {
    const [duration, setDuration] = useState('');
    const [repetitions, setRepetitions] = useState('');
    const [open, setOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(duration || repetitions) {
            onLog({ 
                exerciseId: exercise.id!,
                exerciseName: exercise.name,
                duration: Number(duration) || 0,
                repetitions: Number(repetitions) || 0,
            });
            setDuration('');
            setRepetitions('');
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Тэмдэглэл нэмэх
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>"{exercise.name}" дасгалын тэмдэглэл</DialogTitle>
                </DialogHeader>
                 <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="log-duration">Хугацаа (минут)</Label>
                        <Input id="log-duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="10" />
                    </div>
                    <div>
                        <Label htmlFor="log-reps">Давталт</Label>
                        <Input id="log-reps" type="number" value={repetitions} onChange={(e) => setRepetitions(e.target.value)} placeholder="12" />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Цуцлах</Button></DialogClose>
                        <Button type="submit">Хадгалах</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function FitnessPage() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
    const [loading, setLoading] = useState(true);

    const exercisesRef = useMemoFirebase(() => user && firestore ? collection(firestore, `users/${user.uid}/fitnessExercises`) : null, [user, firestore]);
    const logsRef = useMemoFirebase(() => user && firestore ? collection(firestore, `users/${user.uid}/workoutLogs`) : null, [user, firestore]);

    useEffect(() => {
        const fetchData = async () => {
            if (!exercisesRef || !logsRef) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [exSnap, logSnap] = await Promise.all([
                    getDocs(query(exercisesRef, orderBy('createdAt', 'desc'))),
                    getDocs(query(logsRef, orderBy('date', 'desc')))
                ]);
                
                const exList = exSnap.docs.map(d => ({ id: d.id, ...d.data() } as Exercise));
                const logList = logSnap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutLog));

                setExercises(exList);
                setWorkoutLogs(logList);

            } catch (error) {
                console.error("Error fetching fitness data:", error);
                toast({ title: "Алдаа", description: "Фитнесс мэдээлэл татахад алдаа гарлаа.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [exercisesRef, logsRef, toast]);
    
    const stats = useMemo(() => {
        const exerciseStats: { [key: string]: { totalDuration: number, totalReps: number, logCount: number } } = {};
        
        workoutLogs.forEach(log => {
            if (!exerciseStats[log.exerciseId]) {
                exerciseStats[log.exerciseId] = { totalDuration: 0, totalReps: 0, logCount: 0 };
            }
            exerciseStats[log.exerciseId].totalDuration += log.duration;
            exerciseStats[log.exerciseId].totalReps += log.repetitions;
            exerciseStats[log.exerciseId].logCount += 1;
        });

        return exerciseStats;
    }, [workoutLogs]);


    const handleAddExercise = async (exercise: Omit<Exercise, 'id' | 'createdAt'>) => {
        if (!exercisesRef) return;
        try {
            const docRef = await addDoc(exercisesRef, { ...exercise, createdAt: serverTimestamp() });
            setExercises(prev => [{ ...exercise, id: docRef.id, createdAt: new Date() }, ...prev]);
            toast({ title: "Амжилттай", description: "Шинэ дасгал нэмэгдлээ." });
        } catch (e) {
            console.error(e);
            toast({ title: "Алдаа", description: "Дасгал нэмэхэд алдаа гарлаа.", variant: "destructive" });
        }
    };
    
    const handleLogWorkout = async (log: Omit<WorkoutLog, 'id' | 'date'>) => {
        if (!logsRef) return;
         try {
            const docRef = await addDoc(logsRef, { ...log, date: serverTimestamp() });
            setWorkoutLogs(prev => [{ ...log, id: docRef.id, date: new Date() }, ...prev]);
            toast({ title: "Амжилттай", description: "Дасгалын тэмдэглэл нэмэгдлээ." });
        } catch (e) {
            console.error(e);
            toast({ title: "Алдаа", description: "Тэмдэглэл нэмэхэд алдаа гарлаа.", variant: "destructive" });
        }
    }
    
    const groupedExercises = useMemo(() => {
        return exercises.reduce((acc, ex) => {
            const category = ex.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(ex);
            return acc;
        }, {} as Record<string, Exercise[]>);
    }, [exercises]);
    
    if (loading) {
        return (
             <div className="space-y-8">
                <BackButton />
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <div className="pt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
          <BackButton />
          <div className="text-center pt-8">
              <h1 className="text-4xl font-bold">Fitness Tracker</h1>
          </div>
          
           <div className="flex justify-center">
                <AddExerciseDialog onAdd={handleAddExercise} />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Dumbbell /> Дасгалууд</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.keys(groupedExercises).map(category => (
                            <div key={category}>
                                <h3 className="font-bold mb-2 text-primary">{category}</h3>
                                <div className="space-y-2">
                                {groupedExercises[category].map(ex => (
                                    <Card key={ex.id} className="flex justify-between items-center p-4">
                                        <p className="font-semibold">{ex.name}</p>
                                        <LogWorkoutDialog exercise={ex} onLog={handleLogWorkout} />
                                    </Card>
                                ))}
                                </div>
                            </div>
                        ))}
                         {exercises.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">Дасгал нэмээгүй байна.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart/> Статистик</CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-2">
                        {Object.keys(stats).length > 0 ? (
                           Object.entries(stats).map(([exerciseId, stat]) => {
                                const exercise = exercises.find(ex => ex.id === exerciseId);
                                return (
                                    <Card key={exerciseId} className="p-4">
                                        <p className="font-semibold mb-2">{exercise?.name || 'Тодорхойгүй дасгал'}</p>
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Нийт хугацаа: <strong className="text-foreground">{stat.totalDuration} мин</strong></span>
                                            <span>Нийт давталт: <strong className="text-foreground">{stat.totalReps}</strong></span>
                                             <span>Нийт удаа: <strong className="text-foreground">{stat.logCount}</strong></span>
                                        </div>
                                    </Card>
                                )
                           })
                        ) : (
                            <p className="text-muted-foreground text-center py-4">Статистик байхгүй байна.</p>
                        )}
                    </CardContent>
                </Card>
           </div>

        </div>
    )
}
