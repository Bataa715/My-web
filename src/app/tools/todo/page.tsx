'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
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
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, ListTodo, Sparkles } from 'lucide-react';
import BackButton from '@/components/shared/BackButton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  createdAt: any;
}

export default function TodoPage() {
  const { firestore, user } = useFirebase();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

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
    const unsubscribe = onSnapshot(q, snapshot => {
      const todosData = snapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() }) as Todo
      );
      setTodos(todosData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [todosRef]);

  const addTodo = async (e: FormEvent) => {
    e.preventDefault();
    if (newTask.trim() === '' || !todosRef) return;

    await addDoc(todosRef, {
      task: newTask,
      completed: false,
      createdAt: serverTimestamp(),
    });
    setNewTask('');
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    if (!firestore || !user) return;
    const todoDoc = doc(firestore, `users/${user.uid}/todos`, id);
    await updateDoc(todoDoc, { completed: !completed });
  };

  const deleteTodo = async (id: string) => {
    if (!firestore || !user) return;
    const todoDoc = doc(firestore, `users/${user.uid}/todos`, id);
    await deleteDoc(todoDoc);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4 md:p-6">
      <BackButton />
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-8 pb-12"
        >
          <div className="inline-block p-4 bg-green-500/10 rounded-2xl mb-4">
            <ListTodo className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Хийх зүйлсийн жагсаалт
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Өдрийн ажлаа төлөвлөж, бүтээмжээ нэмэгдүүлээрэй.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/50 backdrop-blur-xl border-0 rounded-2xl shadow-lg shadow-green-500/5">
            <CardHeader>
              <CardTitle>Миний жагсаалт</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addTodo} className="flex gap-2 mb-6">
                <Input
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  placeholder="Шинэ ажил нэмэх..."
                  className="bg-background/50 border-0 rounded-xl focus:ring-2 focus:ring-green-500/50"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 rounded-xl"
                >
                  Нэмэх
                </Button>
              </form>
              <div className="space-y-3">
                <AnimatePresence>
                  {todos.map(todo => (
                    <motion.div
                      key={todo.id}
                      layout
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, height: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="flex items-center gap-3 p-3 bg-background/30 rounded-xl"
                    >
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
                        className="h-5 w-5 rounded-md border-green-500 data-[state=checked]:bg-green-500"
                        id={`todo-${todo.id}`}
                      />
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={cn(
                          'flex-1 text-base transition-colors',
                          todo.completed
                            ? 'text-muted-foreground line-through'
                            : 'text-foreground'
                        )}
                      >
                        {todo.task}
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTodo(todo.id)}
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {!loading && todos.length === 0 && (
                   <div className="text-center p-8 text-muted-foreground">
                    <Sparkles className="mx-auto h-8 w-8 mb-2 text-green-500"/>
                    Хийх ажил алга, сайхан амар!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
