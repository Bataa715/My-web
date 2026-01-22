'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '@/components/shared/BackButton';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import { useFirebase, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  limit,
} from 'firebase/firestore';
import type { Exercise, WorkoutLog, BodyStats } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  PlusCircle,
  Trash2,
  Dumbbell,
  History,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Target,
  Scale,
  Ruler,
  Activity,
  Flame,
  Heart,
  Zap,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  LineChart,
  Area,
  AreaChart,
} from 'recharts';
import { Timestamp } from 'firebase/firestore';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

// Accent color
const accentColor = '34, 197, 94'; // Green

// BMI Calculator
const calculateBMI = (weight: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
};

const getBMICategory = (bmi: number): { label: string; color: string } => {
  if (bmi < 18.5) return { label: 'Туранхай', color: 'text-blue-400' };
  if (bmi < 25) return { label: 'Хэвийн', color: 'text-green-400' };
  if (bmi < 30) return { label: 'Илүүдэл жин', color: 'text-yellow-400' };
  return { label: 'Таргалалт', color: 'text-red-400' };
};

// Stat Card Component
const StatCard = ({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  color = accentColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}) => (
  <motion.div variants={itemVariants}>
    <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `rgba(${color}, 0.15)`,
                color: `rgb(${color})`,
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold">
                {value}
                {unit && (
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {unit}
                  </span>
                )}
              </p>
            </div>
          </div>
          {trend && (
            <div
              className={`${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground'}`}
            >
              {trend === 'up' ? (
                <TrendingUp className="h-5 w-5" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-5 w-5" />
              ) : (
                <Activity className="h-5 w-5" />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Add Body Stats Dialog
const AddBodyStatsDialog = ({
  onAdd,
  latestStats,
}: {
  onAdd: (stats: Omit<BodyStats, 'id' | 'date'>) => void;
  latestStats?: BodyStats | null;
}) => {
  const [weight, setWeight] = useState(latestStats?.weight?.toString() || '');
  const [height, setHeight] = useState(latestStats?.height?.toString() || '');
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight && height) {
      onAdd({ weight: Number(weight), height: Number(height), notes });
      setNotes('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
          <Scale className="h-4 w-4" />
          Жин бүртгэх
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-0 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Биеийн үзүүлэлт бүртгэх</DialogTitle>
          <DialogDescription>
            Өнөөдрийн жин болон өндрөө оруулна уу
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stat-weight">Жин (кг)</Label>
              <Input
                id="stat-weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="70.5"
                required
                className="bg-background/50 border-border/50 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stat-height">Өндөр (см)</Label>
              <Input
                id="stat-height"
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="175"
                required
                className="bg-background/50 border-border/50 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stat-notes">Тэмдэглэл (заавал биш)</Label>
            <Textarea
              id="stat-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Өнөөдөр сайн мэдрэмжтэй байна..."
              className="bg-background/50 border-border/50 rounded-xl resize-none"
              rows={2}
            />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="rounded-xl">
                Цуцлах
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            >
              Хадгалах
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Add Exercise Dialog
const AddExerciseDialog = ({
  onAdd,
}: {
  onAdd: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void;
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState(false);

  const categories = [
    'Цээж',
    'Нуруу',
    'Мөр',
    'Гар',
    'Хөл',
    'Хэвлий',
    'Кардио',
    'Уян хатан',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && category) {
      onAdd({ name, category });
      setName('');
      setCategory('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-xl gap-2 w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
        >
          <PlusCircle className="h-4 w-4" />
          Шинэ дасгал нэмэх
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-0 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Шинэ дасгал нэмэх</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ex-name">Дасгалын нэр</Label>
            <Input
              id="ex-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Bench Press, Squat..."
              required
              className="bg-background/50 border-border/50 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Ангилал</Label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  type="button"
                  variant={category === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(cat)}
                  className={`rounded-xl text-xs ${category === cat ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0' : ''}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="rounded-xl">
                Цуцлах
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            >
              Нэмэх
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Log Workout Dialog
const LogWorkoutDialog = ({
  exercise,
  onLog,
}: {
  exercise: Exercise;
  onLog: (log: Omit<WorkoutLog, 'id' | 'date'>) => void;
}) => {
  const [sets, setSets] = useState('3');
  const [repetitions, setRepetitions] = useState('12');
  const [weight, setWeight] = useState('');
  const [duration, setDuration] = useState('');
  const [open, setOpen] = useState(false);

  const isCardio = exercise.category === 'Кардио';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLog({
      exerciseId: exercise.id!,
      exerciseName: exercise.name,
      sets: Number(sets) || 0,
      repetitions: Number(repetitions) || 0,
      weight: Number(weight) || 0,
      duration: Number(duration) || 0,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-xl gap-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white h-8"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Бүртгэх
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-0 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-green-400" />
            {exercise.name}
          </DialogTitle>
          <DialogDescription>{exercise.category} дасгал</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {isCardio ? (
            <div className="space-y-2">
              <Label htmlFor="log-duration">Хугацаа (минут)</Label>
              <Input
                id="log-duration"
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="30"
                required
                className="bg-background/50 border-border/50 rounded-xl"
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="log-sets">Сет</Label>
                  <Input
                    id="log-sets"
                    type="number"
                    value={sets}
                    onChange={e => setSets(e.target.value)}
                    className="bg-background/50 border-border/50 rounded-xl text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log-reps">Давталт</Label>
                  <Input
                    id="log-reps"
                    type="number"
                    value={repetitions}
                    onChange={e => setRepetitions(e.target.value)}
                    className="bg-background/50 border-border/50 rounded-xl text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log-weight">Жин (кг)</Label>
                  <Input
                    id="log-weight"
                    type="number"
                    step="0.5"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="20"
                    className="bg-background/50 border-border/50 rounded-xl text-center"
                  />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 text-center">
                <p className="text-sm text-muted-foreground">Нийт:</p>
                <p className="text-lg font-bold text-green-400">
                  {Number(sets) * Number(repetitions)} давталт
                  {weight && ` × ${weight}кг`}
                </p>
              </div>
            </>
          )}
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="rounded-xl">
                Цуцлах
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            >
              Хадгалах
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Weekly Activity Chart
const WeeklyActivityChart = ({ logs }: { logs: WorkoutLog[] }) => {
  const data = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return last7Days.map(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      const logsForDay = logs.filter(log => {
        const logDate =
          log.date instanceof Timestamp ? log.date.toDate() : log.date;
        return format(logDate, 'yyyy-MM-dd') === dayString;
      });
      return {
        name: format(day, 'EEE'),
        workouts: logsForDay.length,
      };
    });
  }, [logs]);

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-green-400" />
          <CardTitle className="text-base font-medium">
            7 хоногийн идэвх
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorWorkouts" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="rgb(34, 197, 94)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="rgb(34, 197, 94)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border) / 0.3)"
            />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card) / 0.95)',
                backdropFilter: 'blur(8px)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="workouts"
              stroke="rgb(34, 197, 94)"
              strokeWidth={2}
              fill="url(#colorWorkouts)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Weight Progress Chart
const WeightProgressChart = ({ stats }: { stats: BodyStats[] }) => {
  const data = useMemo(() => {
    return stats
      .slice(0, 30)
      .reverse()
      .map(stat => {
        const date =
          stat.date instanceof Timestamp ? stat.date.toDate() : stat.date;
        return {
          date: format(date, 'MM/dd'),
          weight: stat.weight,
        };
      });
  }, [stats]);

  if (data.length < 2) return null;

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <CardTitle className="text-base font-medium">
            Жингийн өөрчлөлт
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border) / 0.3)"
            />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card) / 0.95)',
                backdropFilter: 'blur(8px)',
                border: 'none',
                borderRadius: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="rgb(34, 197, 94)"
              strokeWidth={2}
              dot={{ fill: 'rgb(34, 197, 94)', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Exercise Card
const ExerciseCard = ({
  exercise,
  onLog,
  onDelete,
  recentLog,
}: {
  exercise: Exercise;
  onLog: (log: Omit<WorkoutLog, 'id' | 'date'>) => void;
  onDelete: () => void;
  recentLog?: WorkoutLog;
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Цээж':
        return '🏋️';
      case 'Нуруу':
        return '💪';
      case 'Мөр':
        return '🦾';
      case 'Гар':
        return '💪';
      case 'Хөл':
        return '🦵';
      case 'Хэвлий':
        return '🔥';
      case 'Кардио':
        return '🏃';
      case 'Уян хатан':
        return '🧘';
      default:
        return '💪';
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="group bg-card/50 backdrop-blur-sm rounded-2xl p-4 hover:bg-card/70 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getCategoryIcon(exercise.category)}</span>
          <div>
            <p className="font-medium">{exercise.name}</p>
            <p className="text-xs text-muted-foreground">{exercise.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LogWorkoutDialog exercise={exercise} onLog={onLog} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-0 rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Дасгал устгах уу?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">
                  Цуцлах
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="rounded-xl bg-destructive text-destructive-foreground"
                >
                  Устгах
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {recentLog && (
        <div className="mt-2 pt-2 border-t border-border/30 text-xs text-muted-foreground">
          Сүүлд: {recentLog.sets}×{recentLog.repetitions}{' '}
          {recentLog.weight ? `@ ${recentLog.weight}кг` : ''}
        </div>
      )}
    </motion.div>
  );
};

// Workout History
const WorkoutHistory = ({ logs }: { logs: WorkoutLog[] }) => {
  return (
    <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-green-400" />
          <CardTitle className="text-base font-medium">
            Сүүлийн бүртгэлүүд
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {logs.slice(0, 10).map((log, index) => {
            const logDate =
              log.date instanceof Timestamp ? log.date.toDate() : log.date;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.05 }}
                className="flex justify-between items-center p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Dumbbell className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{log.exerciseName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(logDate, 'MM/dd HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {log.duration ? (
                    <p className="text-sm font-medium">{log.duration} мин</p>
                  ) : (
                    <p className="text-sm font-medium">
                      {log.sets}×{log.repetitions}
                      {log.weight ? (
                        <span className="text-green-400"> @{log.weight}кг</span>
                      ) : (
                        ''
                      )}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {logs.length === 0 && (
          <div className="text-center py-8">
            <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground text-sm">
              Бүртгэл байхгүй байна
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Component
export default function FitnessPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [bodyStats, setBodyStats] = useState<BodyStats[]>([]);
  const [loading, setLoading] = useState(true);

  const exercisesRef = useMemoFirebase(
    () =>
      user && firestore
        ? collection(firestore, `users/${user.uid}/fitnessExercises`)
        : null,
    [user, firestore]
  );
  const logsRef = useMemoFirebase(
    () =>
      user && firestore
        ? collection(firestore, `users/${user.uid}/workoutLogs`)
        : null,
    [user, firestore]
  );
  const statsRef = useMemoFirebase(
    () =>
      user && firestore
        ? collection(firestore, `users/${user.uid}/bodyStats`)
        : null,
    [user, firestore]
  );

  const fetchData = useCallback(async () => {
    if (!exercisesRef || !logsRef || !statsRef) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [exSnap, logSnap, statsSnap] = await Promise.all([
        getDocs(query(exercisesRef, orderBy('createdAt', 'desc'))),
        getDocs(query(logsRef, orderBy('date', 'desc'), limit(100))),
        getDocs(query(statsRef, orderBy('date', 'desc'), limit(30))),
      ]);

      setExercises(
        exSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Exercise)
      );
      setWorkoutLogs(
        logSnap.docs.map(d => ({ id: d.id, ...d.data() }) as WorkoutLog)
      );
      setBodyStats(
        statsSnap.docs.map(d => ({ id: d.id, ...d.data() }) as BodyStats)
      );
    } catch (error) {
      console.error('Error fetching fitness data:', error);
      toast({
        title: 'Алдаа',
        description: 'Мэдээлэл татахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [exercisesRef, logsRef, statsRef, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleAddBodyStats = async (stats: Omit<BodyStats, 'id' | 'date'>) => {
    if (!statsRef) return;
    try {
      await addDoc(statsRef, { ...stats, date: serverTimestamp() });
      toast({
        title: 'Амжилттай',
        description: 'Биеийн үзүүлэлт бүртгэгдлээ.',
      });
      fetchData();
    } catch (e) {
      console.error(e);
      toast({ title: 'Алдаа', variant: 'destructive' });
    }
  };

  const handleAddExercise = async (
    exercise: Omit<Exercise, 'id' | 'createdAt'>
  ) => {
    if (!exercisesRef) return;
    try {
      await addDoc(exercisesRef, { ...exercise, createdAt: serverTimestamp() });
      toast({ title: 'Амжилттай', description: 'Шинэ дасгал нэмэгдлээ.' });
      fetchData();
    } catch (e) {
      console.error(e);
      toast({ title: 'Алдаа', variant: 'destructive' });
    }
  };

  const handleLogWorkout = async (log: Omit<WorkoutLog, 'id' | 'date'>) => {
    if (!logsRef) return;
    try {
      await addDoc(logsRef, { ...log, date: serverTimestamp() });
      toast({ title: 'Амжилттай', description: 'Дасгал бүртгэгдлээ.' });
      fetchData();
    } catch (e) {
      console.error(e);
      toast({ title: 'Алдаа', variant: 'destructive' });
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!exercisesRef) return;
    try {
      await deleteDoc(doc(exercisesRef, id));
      toast({ title: 'Устгагдлаа' });
      fetchData();
    } catch (e) {
      console.error(e);
      toast({ title: 'Алдаа', variant: 'destructive' });
    }
  };

  // Computed values
  const latestStats = bodyStats[0] || null;
  const bmi = latestStats
    ? calculateBMI(latestStats.weight, latestStats.height)
    : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const todayLogs = workoutLogs.filter(log => {
    const logDate =
      log.date instanceof Timestamp ? log.date.toDate() : log.date;
    return format(logDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  });

  const weeklyStats = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });
    let totalWorkouts = 0;
    let totalVolume = 0;

    last7Days.forEach(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      const logsForDay = workoutLogs.filter(log => {
        const logDate =
          log.date instanceof Timestamp ? log.date.toDate() : log.date;
        return format(logDate, 'yyyy-MM-dd') === dayString;
      });
      totalWorkouts += logsForDay.length;
      logsForDay.forEach(log => {
        totalVolume +=
          (log.sets || 1) * (log.repetitions || 0) * (log.weight || 1);
      });
    });

    return { totalWorkouts, totalVolume: Math.round(totalVolume) };
  }, [workoutLogs]);

  const groupedExercises = useMemo(() => {
    return exercises.reduce(
      (acc, ex) => {
        const category = ex.category || 'Бусад';
        if (!acc[category]) acc[category] = [];
        acc[category].push(ex);
        return acc;
      },
      {} as Record<string, Exercise[]>
    );
  }, [exercises]);

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <InteractiveParticles quantity={30} />
        <div className="p-4 md:p-8 space-y-6 relative z-10">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-64 rounded-2xl" />
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                  <Dumbbell className="h-6 w-6" />
                </span>
                Fitness Tracker
              </h1>
              <p className="text-muted-foreground mt-2">
                Дасгал хөдөлгөөнөө бүртгэж, хянаарай
              </p>
            </div>
            <AddBodyStatsDialog
              onAdd={handleAddBodyStats}
              latestStats={latestStats}
            />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={Scale}
            label="Жин"
            value={latestStats?.weight || '--'}
            unit="кг"
            trend={
              bodyStats.length > 1 && bodyStats[0].weight < bodyStats[1].weight
                ? 'down'
                : bodyStats.length > 1 &&
                    bodyStats[0].weight > bodyStats[1].weight
                  ? 'up'
                  : 'stable'
            }
          />
          <StatCard
            icon={Ruler}
            label="Өндөр"
            value={latestStats?.height || '--'}
            unit="см"
          />
          <StatCard
            icon={Target}
            label="BMI"
            value={bmi || '--'}
            color={
              bmi && bmi >= 18.5 && bmi < 25
                ? '34, 197, 94'
                : bmi && bmi >= 25
                  ? '234, 179, 8'
                  : '96, 165, 250'
            }
          />
          <StatCard
            icon={Flame}
            label="Өнөөдөр"
            value={todayLogs.length}
            unit="дасгал"
            color="249, 115, 22"
          />
        </motion.div>

        {/* BMI Info */}
        {bmi && bmiCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Биеийн жингийн индекс
                      </p>
                      <p className="text-lg font-bold">
                        BMI {bmi} -{' '}
                        <span className={bmiCategory.color}>
                          {bmiCategory.label}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block w-1/3">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 relative">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-green-400 shadow-lg"
                        style={{
                          left: `${Math.min(Math.max(((bmi - 15) / 25) * 100, 0), 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>15</span>
                      <span>18.5</span>
                      <span>25</span>
                      <span>30</span>
                      <span>40</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Charts & History */}
          <div className="lg:col-span-2 space-y-6">
            <WeeklyActivityChart logs={workoutLogs} />
            <WeightProgressChart stats={bodyStats} />

            {/* Weekly Summary */}
            <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl">
              <CardContent className="py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {weeklyStats.totalWorkouts}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      7 хоногийн дасгал
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <Award className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {weeklyStats.totalVolume.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Нийт хэмжээ (кг)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exercises & History */}
          <div className="space-y-6">
            <AddExerciseDialog onAdd={handleAddExercise} />

            <Tabs defaultValue="exercises" className="w-full">
              <TabsList className="bg-card/50 backdrop-blur-xl border-0 rounded-xl p-1 w-full">
                <TabsTrigger
                  value="exercises"
                  className="flex-1 rounded-lg data-[state=active]:bg-green-500 data-[state=active]:text-white gap-1.5"
                >
                  <Dumbbell className="h-4 w-4" />
                  Дасгалууд
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex-1 rounded-lg data-[state=active]:bg-green-500 data-[state=active]:text-white gap-1.5"
                >
                  <History className="h-4 w-4" />
                  Түүх
                </TabsTrigger>
              </TabsList>

              <TabsContent value="exercises" className="mt-4">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4 max-h-[500px] overflow-y-auto"
                >
                  {Object.keys(groupedExercises).map(category => (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {groupedExercises[category].map(ex => (
                          <ExerciseCard
                            key={ex.id}
                            exercise={ex}
                            onLog={handleLogWorkout}
                            onDelete={() => handleDeleteExercise(ex.id!)}
                            recentLog={workoutLogs.find(
                              log => log.exerciseId === ex.id
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  {exercises.length === 0 && (
                    <div className="text-center py-12">
                      <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">
                        Дасгал нэмээгүй байна
                      </p>
                      <p className="text-sm text-muted-foreground/70">
                        Дээрх товч дээр дарж дасгал нэмнэ үү
                      </p>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <WorkoutHistory logs={workoutLogs} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
