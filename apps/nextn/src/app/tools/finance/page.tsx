'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolPageShell from '@/components/shared/ToolPageShell';
import { useFirebase } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Trash2,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  ListFilter,
  CalendarDays,
  Loader2,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, subMonths } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: Timestamp;
}

type FilterType = 'all' | 'income' | 'expense';

// ─── Constants ───────────────────────────────────────────────────────────────

const INCOME_CATEGORIES = [
  'Цалин',
  'Бизнес',
  'Хөрөнгө оруулалт',
  'Буцаан олголт',
  'Бэлэг',
  'Бусад',
];

const EXPENSE_CATEGORIES = [
  'Хоол хүнс',
  'Тээвэр',
  'Байр / Түрээс',
  'Цахилгаан / Ус',
  'Эрүүл мэнд',
  'Боловсрол',
  'Зугаа цэнгэл',
  'Хувцас',
  'Гар утас / Интернет',
  'Бусад',
];

const COLOR = {
  emerald: 'text-emerald-500 bg-emerald-500/10',
  blue: 'text-blue-500 bg-blue-500/10',
  red: 'text-red-500 bg-red-500/10',
  amber: 'text-amber-500 bg-amber-500/10',
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtShort(n: number) {
  if (n >= 1_000_000) return `₮${(n / 1_000_000).toFixed(1)}М`;
  if (n >= 1_000) return `₮${(n / 1_000).toFixed(0)}К`;
  return `₮${n}`;
}

function getMonthOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, i);
    return { value: format(d, 'yyyy-MM'), label: format(d, 'yyyy оны MM сар') };
  });
}

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: keyof typeof COLOR;
  sub?: string;
}) {
  return (
    <Card className="border-border/50 hover:border-primary/20 transition-colors">
      <CardContent className="pt-4 pb-4 px-4">
        <div className={cn('inline-flex p-1.5 rounded-lg mb-2', COLOR[color])}>
          {icon}
        </div>
        <p className="text-lg font-bold leading-tight tabular-nums truncate">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs font-medium mt-1" style={{ color: 'inherit' }}>{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FinancePage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<FilterType>('all');
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const monthOptions = useMemo(getMonthOptions, []);

  // ── Firestore realtime subscription ────────────────────────────────────────
  useEffect(() => {
    if (isUserLoading || !user || !firestore) return;
    setLoading(true);
    const col = collection(firestore, 'users', user.uid, 'finances');
    const q = query(col, orderBy('date', 'desc'));
    const unsub = onSnapshot(
      q,
      snap => {
        setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [user, firestore, isUserLoading]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const filtered = useMemo(
    () =>
      transactions.filter(
        t => t.date.startsWith(selectedMonth) && (activeType === 'all' || t.type === activeType)
      ),
    [transactions, selectedMonth, activeType]
  );

  const monthlyStats = useMemo(() => {
    const monthTx = transactions.filter(t => t.date.startsWith(selectedMonth));
    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;
    const savings = income > 0 ? Math.round((balance / income) * 100) : 0;
    return { income, expense, balance, savings };
  }, [transactions, selectedMonth]);

  const allTimeBalance = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return income - expense;
  }, [transactions]);

  const chartData = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(new Date(), 5 - i);
        const key = format(d, 'yyyy-MM');
        const txs = transactions.filter(t => t.date.startsWith(key));
        return {
          month: format(d, 'MM/yy'),
          Орлого: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
          Зарлага: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        };
      }),
    [transactions]
  );

  const categoryBreakdown = useMemo(() => {
    const txs = transactions.filter(
      t => t.date.startsWith(selectedMonth) && t.type === 'expense'
    );
    const total = txs.reduce((s, t) => s + t.amount, 0);
    const map = new Map<string, number>();
    txs.forEach(t => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([cat, amount]) => ({
        cat,
        amount,
        pct: total > 0 ? Math.round((amount / total) * 100) : 0,
      }));
  }, [transactions, selectedMonth]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const resetForm = () =>
    setForm({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });

  const handleAdd = async () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      toast({ title: 'Дүн оруулна уу', variant: 'destructive' });
      return;
    }
    if (!form.category) {
      toast({ title: 'Ангилал сонгоно уу', variant: 'destructive' });
      return;
    }
    if (!user || !firestore) return;
    setSaving(true);
    try {
      await addDoc(collection(firestore, 'users', user.uid, 'finances'), {
        amount,
        type: form.type,
        category: form.category,
        description: form.description.trim(),
        date: form.date,
        createdAt: serverTimestamp(),
      });
      setShowAdd(false);
      resetForm();
      toast({ title: form.type === 'income' ? '✓ Орлого нэмлээ' : '✓ Зарлага нэмлээ' });
    } catch {
      toast({ title: 'Алдаа гарлаа', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !firestore) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'finances', id));
    } catch {
      toast({ title: 'Устгаж чадсангүй', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ToolPageShell
      title="Санхүүгийн Бүртгэл"
      description="Орлого, зарлагаа хянаж хадгаламжаа нэмэгдүүл"
      eyebrow="FINANCE"
      icon={<Wallet className="h-6 w-6" />}
      breadcrumbs={[{ label: 'Хэрэгслүүд', href: '/tools' }, { label: 'Санхүү' }]}
    >
      {/* Loading skeleton */}
      {loading && user && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Not authenticated */}
      {!isUserLoading && !user && (
        <div className="flex flex-col items-center gap-4 py-20 text-center text-muted-foreground">
          <Wallet className="h-14 w-14 opacity-20" />
          <p className="text-sm">Нэвтэрсний дараа санхүүгийн бүртгэлийг ашиглана уу.</p>
        </div>
      )}

      {!loading && user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-5 pb-2"
        >
          {/* ── Stat Cards ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Нийт үлдэгдэл"
              value={fmt(allTimeBalance)}
              icon={<Wallet className="h-4 w-4" />}
              color={allTimeBalance >= 0 ? 'emerald' : 'red'}
            />
            <StatCard
              label="Сарын орлого"
              value={fmt(monthlyStats.income)}
              icon={<TrendingUp className="h-4 w-4" />}
              color="blue"
            />
            <StatCard
              label="Сарын зарлага"
              value={fmt(monthlyStats.expense)}
              icon={<TrendingDown className="h-4 w-4" />}
              color="red"
            />
            <StatCard
              label="Хадгаламжийн хувь"
              value={`${monthlyStats.savings}%`}
              icon={<PiggyBank className="h-4 w-4" />}
              color={
                monthlyStats.savings >= 20
                  ? 'emerald'
                  : monthlyStats.savings >= 0
                    ? 'amber'
                    : 'red'
              }
            />
          </div>

          {/* ── Month selector + type filter + add button ─────────────── */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tabs
              value={activeType}
              onValueChange={v => setActiveType(v as FilterType)}
            >
              <TabsList className="h-9">
                <TabsTrigger value="all" className="text-xs px-3">
                  Бүгд
                </TabsTrigger>
                <TabsTrigger value="income" className="text-xs px-3">
                  Орлого
                </TabsTrigger>
                <TabsTrigger value="expense" className="text-xs px-3">
                  Зарлага
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              size="sm"
              className="ml-auto h-9 gap-1.5"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="h-4 w-4" />
              Нэмэх
            </Button>
          </div>

          {/* ── Transaction List ──────────────────────────────────────── */}
          <div className="space-y-2 min-h-[80px]">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 py-12 text-muted-foreground"
                >
                  <Receipt className="h-10 w-10 opacity-20" />
                  <p className="text-sm">Энэ сард бүртгэл байхгүй байна</p>
                </motion.div>
              ) : (
                filtered.map(tx => (
                  <motion.div
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/50 hover:bg-card transition-colors group"
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full',
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-red-500/10 text-red-500'
                      )}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpCircle className="h-5 w-5" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{tx.category}</span>
                        <span className="hidden sm:inline text-xs text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5 shrink-0">
                          {tx.date}
                        </span>
                      </div>
                      {tx.description ? (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {tx.description}
                        </p>
                      ) : (
                        <p className="sm:hidden text-xs text-muted-foreground mt-0.5">{tx.date}</p>
                      )}
                    </div>

                    {/* Amount + delete */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          'text-sm font-bold tabular-nums',
                          tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                        )}
                      >
                        {tx.type === 'income' ? '+' : '−'}
                        {fmtShort(tx.amount)}
                      </span>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        disabled={deleting === tx.id}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        aria-label="Устгах"
                      >
                        {deleting === tx.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* ── 6-month Bar Chart ─────────────────────────────────────── */}
          <Card className="border-border/50">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                6 сарын харьцуулалт
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={chartData} barGap={2} barCategoryGap="32%">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border) / 0.35)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={fmtShort}
                    width={54}
                  />
                  <Tooltip
                    formatter={(v: number) => [fmt(v)]}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    cursor={{ fill: 'hsl(var(--muted) / 0.4)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                  <Bar dataKey="Орлого" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="Зарлага" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ── Expense category breakdown ────────────────────────────── */}
          {categoryBreakdown.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium">Зарлагын ангилал</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {categoryBreakdown.map(({ cat, amount, pct }) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{cat}</span>
                      <span className="font-medium tabular-nums">
                        {fmtShort(amount)} · {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-red-500/80 to-orange-400/80"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* ── Add Transaction Dialog ──────────────────────────────────────── */}
      <Dialog
        open={showAdd}
        onOpenChange={open => {
          setShowAdd(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Гүйлгээ нэмэх</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Income / Expense toggle */}
            <div className="grid grid-cols-2 gap-2">
              {(['income', 'expense'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, type: t, category: '' }))}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all',
                    form.type === t
                      ? t === 'income'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500'
                        : 'bg-red-500/15 border-red-500/50 text-red-500'
                      : 'border-border/50 text-muted-foreground hover:bg-muted/40'
                  )}
                >
                  {t === 'income' ? (
                    <ArrowUpCircle className="h-4 w-4" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4" />
                  )}
                  {t === 'income' ? 'Орлого' : 'Зарлага'}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="fin-amount">Дүн (₮)</Label>
              <Input
                id="fin-amount"
                type="number"
                inputMode="numeric"
                placeholder="100000"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                min={1}
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Ангилал</Label>
              <Select
                value={form.category}
                onValueChange={v => setForm(f => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ангилал сонгох..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="fin-date">Огноо</Label>
              <Input
                id="fin-date"
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="fin-desc">Тайлбар (заавал биш)</Label>
              <Textarea
                id="fin-desc"
                placeholder="Дэлгэрэнгүй..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                Цуцлах
              </Button>
            </DialogClose>
            <Button size="sm" onClick={handleAdd} disabled={saving}>
              {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ToolPageShell>
  );
}
