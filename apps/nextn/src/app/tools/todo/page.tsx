'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Loader2,
  Trash2,
  ListTodo,
  
  Plus,
  Calendar,
  Flag,
  CheckCircle2,
  Circle,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import ToolPageShell from '@/components/shared/ToolPageShell';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  category?: string;
  createdAt: Timestamp;
}

const priorityConfig = {
  high: {
    label: 'Чухал',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  medium: {
    label: 'Дунд',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  low: {
    label: 'Энгийн',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
};

const categories = [
  { value: 'work', label: 'Ажил', emoji: '💼' },
  { value: 'personal', label: 'Хувийн', emoji: '🏠' },
  { value: 'health', label: 'Эрүүл мэнд', emoji: '💪' },
  { value: 'study', label: 'Суралцах', emoji: '📚' },
  { value: 'other', label: 'Бусад', emoji: '📌' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, x: -100, scale: 0.9 },
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number | string;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card/50 backdrop-blur-xs rounded-2xl p-4 border border-border/30"
  >
    <div className="flex items-center gap-3">
      <div className={cn('p-2.5 rounded-xl', color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </motion.div>
);

const TodoItem = ({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}) => {
  const priority = priorityConfig[todo.priority] || priorityConfig.low;
  const category = categories.find(c => c.value === todo.category);
  const isOverdue =
    todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300',
        todo.completed
          ? 'bg-muted/30 border-border/20'
          : cn('bg-card/50 backdrop-blur-xs hover:bg-card/70', priority.border),
        isOverdue && !todo.completed && 'border-red-500/50 bg-red-500/5'
      )}
    >
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl',
          priority.bg.replace('/10', '')
        )}
      />
      <button
        onClick={onToggle}
        className={cn(
          'mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
          todo.completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-muted-foreground/30 hover:border-emerald-500'
        )}
      >
        {todo.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-base font-medium transition-all',
            todo.completed && 'line-through text-muted-foreground'
          )}
        >
          {todo.task}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {category && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
              {category.emoji} {category.label}
            </span>
          )}
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full flex items-center gap-1',
              priority.bg,
              priority.color
            )}
          >
            <Flag className="h-3 w-3" />
            {priority.label}
          </span>
          {todo.dueDate && (
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full flex items-center gap-1',
                isOverdue && !todo.completed
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-muted/50 text-muted-foreground'
              )}
            >
              <Calendar className="h-3 w-3" />
              {new Date(todo.dueDate).toLocaleDateString('mn-MN', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export default function TodoPage() {
  const { firestore, user } = useFirebase();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { toast } = useToast();

  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');

  const todosRef = useMemoFirebase(
    () =>
      user && firestore
        ? collection(firestore, `users/${user.uid}/todos`)
        : null,
    [user, firestore]
  );

  useEffect(() => {
    if (!todosRef) {
      setLoading(false);
      return;
    }
    const q = query(todosRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const todosData = snapshot.docs.map(
          doc => ({ id: doc.id, ...doc.data() }) as Todo
        );
        setTodos(todosData);
        setLoading(false);
      },
      error => {
        console.error('Error fetching todos:', error);
        toast({
          title: 'Алдаа',
          description: 'Жагсаалт татахад алдаа гарлаа.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [todosRef, toast]);

  const addTodo = async (e: FormEvent) => {
    e.preventDefault();
    if (newTask.trim() === '' || !todosRef) return;
    try {
      await addDoc(todosRef, {
        task: newTask,
        completed: false,
        priority,
        dueDate: dueDate || null,
        category: category || null,
        createdAt: serverTimestamp(),
      });
      setNewTask('');
      setPriority('medium');
      setDueDate('');
      setCategory('');
      setDialogOpen(false);
      toast({ title: 'Амжилттай нэмлээ!' });
    } catch (error) {
      console.error('Error adding todo:', error);
      toast({ title: 'Алдаа гарлаа', variant: 'destructive' });
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    if (!firestore || !user) return;
    const todoDoc = doc(firestore, `users/${user.uid}/todos`, id);
    try {
      await updateDoc(todoDoc, { completed: !completed });
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!firestore || !user) return;
    const todoDoc = doc(firestore, `users/${user.uid}/todos`, id);
    try {
      await deleteDoc(todoDoc);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(t => t.completed).length;
  const activeCount = todos.filter(t => !t.completed).length;
  const highPriorityCount = todos.filter(
    t => t.priority === 'high' && !t.completed
  ).length;
  const completionRate =
    todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <ToolPageShell
      title="Хийх зүйлс"
      description="Өдрийн ажлаа төлөвлөж, бүтээмжээ нэмэгдүүлээрэй"
      icon={<ListTodo className="h-8 w-8" />}
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/tools' },
        { label: 'Todo' },
      ]}
    >
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6 pt-2">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            <StatCard icon={Target} label="Нийт" value={todos.length} color="bg-primary/10 text-primary" />
            <StatCard icon={Circle} label="Идэвхтэй" value={activeCount} color="bg-amber-500/10 text-amber-500" />
            <StatCard icon={CheckCircle2} label="Дууссан" value={completedCount} color="bg-emerald-500/10 text-emerald-500" />
            <StatCard icon={TrendingUp} label="Гүйцэтгэл" value={`${completionRate}%`} color="bg-accent/10 text-accent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-3xl shadow-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <Tabs
                    value={filter}
                    onValueChange={v => setFilter(v as any)}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="bg-muted/50 rounded-xl p-1">
                      <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-card">Бүгд</TabsTrigger>
                      <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-card">Идэвхтэй</TabsTrigger>
                      <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-card">Дууссан</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button
                    onClick={() => setDialogOpen(true)}
                    className="bg-primary text-primary-foreground rounded-xl gap-2 shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Шинэ
                  </Button>
                </div>

                {highPriorityCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20"
                  >
                    <Zap className="h-5 w-5 text-destructive" />
                    <p className="text-sm text-destructive">
                      <span className="font-semibold">{highPriorityCount}</span>{' '}
                      чухал ажил хийгдээгүй байна
                    </p>
                  </motion.div>
                )}

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredTodos.map(todo => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={() => toggleTodo(todo.id, todo.completed)}
                        onDelete={() => deleteTodo(todo.id)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {filteredTodos.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      {filter === 'completed'
                        ? 'Дууссан ажил алга'
                        : filter === 'active'
                          ? 'Идэвхтэй ажил алга, сайхан амар!'
                          : 'Хийх ажил алга, сайхан амар!'}
                    </p>
                    {filter === 'all' && (
                      <Button
                        onClick={() => setDialogOpen(true)}
                        variant="outline"
                        className="mt-4 rounded-xl gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Ажил нэмэх
                      </Button>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-0 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Шинэ ажил нэмэх
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={addTodo} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Ажлын нэр</Label>
              <Input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                placeholder="Юу хийх вэ?"
                className="bg-background/50 border-border/50 rounded-xl"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ач холбогдол</Label>
                <Select value={priority} onValueChange={v => setPriority(v as any)}>
                  <SelectTrigger className="bg-background/50 border-border/50 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="high" className="rounded-lg">
                      <span className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-red-500" /> Чухал
                      </span>
                    </SelectItem>
                    <SelectItem value="medium" className="rounded-lg">
                      <span className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-amber-500" /> Дунд
                      </span>
                    </SelectItem>
                    <SelectItem value="low" className="rounded-lg">
                      <span className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-emerald-500" /> Энгийн
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ангилал</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-background/50 border-border/50 rounded-xl">
                    <SelectValue placeholder="Сонгох" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value} className="rounded-lg">
                        <span className="flex items-center gap-2">
                          {cat.emoji} {cat.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Дуусах хугацаа
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="bg-background/50 border-border/50 rounded-xl"
              />
            </div>
            <DialogFooter className="gap-2 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="rounded-xl">Цуцлах</Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground rounded-xl"
                disabled={!newTask.trim()}
              >
                Нэмэх
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ToolPageShell>
  );
}
