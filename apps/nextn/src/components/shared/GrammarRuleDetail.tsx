'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import type { GrammarRule } from '@/lib/types';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '../ui/button';
import {
  Trash2,
  BookOpen,
  Edit,
  Pencil,
  Lightbulb,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '../ui/badge';
import { EditGrammarRuleDialog } from './EditGrammarRuleDialog';
import { SectionEditDialog } from './SectionEditDialog';
import { InlineTextEditor, InlineArrayEditor } from './InlineTextEditor';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import PracticeGenerator from './PracticeGenerator';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GrammarRuleDetailProps {
  rule: GrammarRule;
  onUpdateRule: (rule: GrammarRule) => void;
  onDeleteRule: (id: string) => void;
  collectionPath: 'englishGrammar' | 'japaneseGrammar';
}

export default function GrammarRuleDetail({
  rule,
  onUpdateRule,
  onDeleteRule,
  collectionPath,
}: GrammarRuleDetailProps) {
  const { isEditMode } = useEditMode();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const router = useRouter();

  const handleDelete = async () => {
    if (!firestore || !rule.id || !user) {
      toast({
        title: 'Алдаа',
        description: 'Дүрэм устгах боломжгүй',
        variant: 'destructive',
      });
      return;
    }
    try {
      await deleteDoc(
        doc(firestore, `users/${user.uid}/${collectionPath}`, rule.id)
      );
      toast({ title: 'Амжилттай', description: 'Дүрэм устгагдлаа.' });
      onDeleteRule(rule.id);
      router.back();
    } catch (error) {
      console.error('Error deleting rule: ', error);
      toast({
        title: 'Алдаа',
        description: 'Дүрэм устгахад алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSectionUpdate = async (field: string, data: any) => {
    if (!firestore || !rule.id || !user) {
      toast({
        title: 'Алдаа',
        description: 'Хэсэг засах боломжгүй.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const docRef = doc(
        firestore,
        `users/${user.uid}/${collectionPath}`,
        rule.id
      );
      await updateDoc(docRef, { [field]: data });

      const updatedRule = { ...rule, [field]: data };
      onUpdateRule(updatedRule);

      toast({
        title: 'Амжилттай',
        description: 'Хэсэг шинэчлэгдлээ.',
      });
    } catch (error) {
      console.error('Error updating section:', error);
      toast({
        title: 'Алдаа',
        description: 'Хэсэг шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleStructureUpdate = async (
    type: 'positive' | 'negative' | 'question',
    data: { formula: string; examples: string[] }
  ) => {
    if (!firestore || !rule.id || !user) {
      toast({
        title: 'Алдаа',
        description: 'Хэсэг засах боломжгүй.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const docRef = doc(
        firestore,
        `users/${user.uid}/${collectionPath}`,
        rule.id
      );
      const newStructure = {
        ...rule.structure,
        [type]: data,
      };
      await updateDoc(docRef, { structure: newStructure });

      const updatedRule = { ...rule, structure: newStructure };
      onUpdateRule(updatedRule);

      toast({
        title: 'Амжилттай',
        description: 'Бүтэц шинэчлэгдлээ.',
      });
    } catch (error) {
      console.error('Error updating structure:', error);
      toast({
        title: 'Алдаа',
        description: 'Бүтэц шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const SectionEditButton = ({ children }: { children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
    >
      {children}
    </Button>
  );

  const SectionHeader = ({
    icon: Icon,
    number,
    titleEn,
    titleMn,
    editButton,
    gradient,
  }: {
    icon: React.ElementType;
    number: number;
    titleEn: string;
    titleMn: string;
    editButton?: React.ReactNode;
    gradient: string;
  }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl',
            gradient
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">
            {number}. {titleMn}
          </h3>
          <p className="text-sm text-muted-foreground">{titleEn}</p>
        </div>
      </div>
      {editButton}
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 border border-primary/20">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30">
                  <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                </div>
                <Badge
                  variant="secondary"
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-primary/20 text-primary border-primary/30"
                >
                  {rule.category}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                <InlineTextEditor
                  value={rule.title}
                  onSave={newValue => handleSectionUpdate('title', newValue)}
                  isEditMode={isEditMode}
                  displayClassName="block"
                  placeholder="Дүрмийн нэр..."
                />
              </h1>

              <div className="text-sm sm:text-base md:text-lg text-foreground/80 max-w-2xl leading-relaxed">
                <InlineTextEditor
                  value={rule.introduction}
                  onSave={newValue =>
                    handleSectionUpdate('introduction', newValue)
                  }
                  isEditMode={isEditMode}
                  multiline
                  displayClassName="block"
                  placeholder="Танилцуулга..."
                />
              </div>
            </div>

            {isEditMode && rule.id && (
              <div className="flex gap-2 shrink-0">
                <EditGrammarRuleDialog
                  rule={rule}
                  onUpdateRule={onUpdateRule}
                  collectionPath={collectionPath}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-2 bg-background/50 backdrop-blur-sm hover:bg-background/80 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                    Засах
                  </Button>
                </EditGrammarRuleDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Устгах
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Та итгэлтэй байна уу?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Энэ үйлдлийг буцаах боломжгүй. &quot;{rule.title}&quot;
                        дүрэм бүрмөсөн устгагдах болно.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Устгах
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Section */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <SectionHeader
            icon={Lightbulb}
            number={1}
            titleMn="Хэрэглээ"
            titleEn="Usage"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          />

          <InlineArrayEditor
            items={rule.usage}
            onSave={data => handleSectionUpdate('usage', data)}
            isEditMode={isEditMode}
            createEmpty={() => ({ condition: '', example: '' })}
            renderItem={(use, i) => (
              <div
                key={i}
                className="group relative pl-6 py-4 pr-4 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/20 transition-all mb-4 last:mb-0"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">
                    {use.condition}
                  </p>
                  <p className="text-muted-foreground italic flex items-start gap-2">
                    <Sparkles className="h-4 w-4 mt-1 shrink-0 text-amber-500" />
                    <span>&quot;{use.example}&quot;</span>
                  </p>
                </div>
              </div>
            )}
            renderEditItem={(use, index, onChange, onRemove) => (
              <div
                key={index}
                className="flex gap-2 items-start border p-3 rounded-md bg-muted/30"
              >
                <div className="flex-1 space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Нөхцөл
                    </Label>
                    <Input
                      value={use.condition}
                      onChange={e =>
                        onChange({ ...use, condition: e.target.value })
                      }
                      placeholder="Хэзээ хэрэглэх вэ..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Жишээ
                    </Label>
                    <Input
                      value={use.example}
                      onChange={e =>
                        onChange({ ...use, example: e.target.value })
                      }
                      placeholder="Жишээ өгүүлбэр..."
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRemove}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Form Section */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <SectionHeader
            icon={FileText}
            number={2}
            titleMn="Үйл үгний хэлбэр"
            titleEn="Verb Form"
            gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
              <div className="px-5 py-3 bg-blue-500/10 border-b border-blue-500/20">
                <h4 className="font-semibold text-blue-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Regular Verbs
                </h4>
              </div>
              <div className="p-5">
                <InlineTextEditor
                  value={rule.form.regular}
                  onSave={async newValue => {
                    await handleSectionUpdate('form', {
                      ...rule.form,
                      regular: newValue,
                    });
                  }}
                  isEditMode={isEditMode}
                  multiline
                  placeholder="Markdown форматаар бичнэ үү..."
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-td:text-foreground prose-th:text-blue-400 prose-th:font-semibold prose-strong:text-foreground prose-p:text-foreground/90 prose-table:my-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {rule.form.regular}
                    </ReactMarkdown>
                  </div>
                </InlineTextEditor>
              </div>
            </div>

            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 overflow-hidden">
              <div className="px-5 py-3 bg-purple-500/10 border-b border-purple-500/20">
                <h4 className="font-semibold text-purple-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Irregular Verbs
                </h4>
              </div>
              <div className="p-5">
                <InlineTextEditor
                  value={rule.form.irregular}
                  onSave={async newValue => {
                    await handleSectionUpdate('form', {
                      ...rule.form,
                      irregular: newValue,
                    });
                  }}
                  isEditMode={isEditMode}
                  multiline
                  placeholder="Markdown форматаар бичнэ үү..."
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-td:text-foreground prose-th:text-purple-400 prose-th:font-semibold prose-strong:text-foreground prose-p:text-foreground/90 prose-table:my-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {rule.form.irregular}
                    </ReactMarkdown>
                  </div>
                </InlineTextEditor>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Structure Section */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <SectionHeader
            icon={MessageSquare}
            number={3}
            titleMn="Өгүүлбэрийн бүтэц"
            titleEn="Sentence Structure"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />

          <Tabs defaultValue="positive" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14 p-1.5 bg-muted/50 rounded-xl">
              <TabsTrigger
                value="positive"
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 rounded-lg gap-2 text-base"
              >
                <CheckCircle2 className="h-4 w-4" />
                Positive
              </TabsTrigger>
              <TabsTrigger
                value="negative"
                className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 rounded-lg gap-2 text-base"
              >
                <XCircle className="h-4 w-4" />
                Negative
              </TabsTrigger>
              <TabsTrigger
                value="question"
                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 rounded-lg gap-2 text-base"
              >
                <HelpCircle className="h-4 w-4" />
                Question
              </TabsTrigger>
            </TabsList>

            <TabsContent value="positive" className="mt-6">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                  <h4 className="font-semibold text-emerald-400">
                    Positive Structure
                  </h4>
                </div>
                <div className="p-5 space-y-4">
                  <InlineTextEditor
                    value={rule.structure.positive.formula}
                    onSave={async newValue => {
                      await handleStructureUpdate('positive', {
                        ...rule.structure.positive,
                        formula: newValue,
                      });
                    }}
                    isEditMode={isEditMode}
                    multiline
                    placeholder="Бүтцийн томъёо..."
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-td:text-foreground prose-th:text-emerald-400 prose-th:font-semibold prose-strong:text-foreground prose-p:text-foreground/90">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {rule.structure.positive.formula}
                      </ReactMarkdown>
                    </div>
                  </InlineTextEditor>
                  <div className="space-y-2 pt-4 border-t border-emerald-500/10">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Жишээнүүд
                    </p>
                    <InlineTextEditor
                      value={rule.structure.positive.examples.join('\n')}
                      onSave={async newValue => {
                        const examples = newValue.split('\n').filter(Boolean);
                        await handleStructureUpdate('positive', {
                          ...rule.structure.positive,
                          examples,
                        });
                      }}
                      isEditMode={isEditMode}
                      multiline
                      placeholder="Жишээ өгүүлбэрүүд (мөр бүр шинэ жишээ)..."
                    >
                      <div className="space-y-2">
                        {rule.structure.positive.examples.map((ex, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-emerald-500/5"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span className="text-foreground italic">{ex}</span>
                          </div>
                        ))}
                      </div>
                    </InlineTextEditor>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="negative" className="mt-6">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-red-500/10 border-b border-red-500/20">
                  <h4 className="font-semibold text-red-400">
                    Negative Structure
                  </h4>
                </div>
                <div className="p-5 space-y-4">
                  <InlineTextEditor
                    value={rule.structure.negative.formula}
                    onSave={async newValue => {
                      await handleStructureUpdate('negative', {
                        ...rule.structure.negative,
                        formula: newValue,
                      });
                    }}
                    isEditMode={isEditMode}
                    multiline
                    placeholder="Бүтцийн томъёо..."
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-td:text-foreground prose-th:text-red-400 prose-th:font-semibold prose-strong:text-foreground prose-p:text-foreground/90">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {rule.structure.negative.formula}
                      </ReactMarkdown>
                    </div>
                  </InlineTextEditor>
                  <div className="space-y-2 pt-4 border-t border-red-500/10">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Жишээнүүд
                    </p>
                    <InlineTextEditor
                      value={rule.structure.negative.examples.join('\n')}
                      onSave={async newValue => {
                        const examples = newValue.split('\n').filter(Boolean);
                        await handleStructureUpdate('negative', {
                          ...rule.structure.negative,
                          examples,
                        });
                      }}
                      isEditMode={isEditMode}
                      multiline
                      placeholder="Жишээ өгүүлбэрүүд (мөр бүр шинэ жишээ)..."
                    >
                      <div className="space-y-2">
                        {rule.structure.negative.examples.map((ex, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-red-500/5"
                          >
                            <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                            <span className="text-foreground italic">{ex}</span>
                          </div>
                        ))}
                      </div>
                    </InlineTextEditor>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="question" className="mt-6">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-blue-500/10 border-b border-blue-500/20">
                  <h4 className="font-semibold text-blue-400">
                    Question Structure
                  </h4>
                </div>
                <div className="p-5 space-y-4">
                  <InlineTextEditor
                    value={rule.structure.question.formula}
                    onSave={async newValue => {
                      await handleStructureUpdate('question', {
                        ...rule.structure.question,
                        formula: newValue,
                      });
                    }}
                    isEditMode={isEditMode}
                    multiline
                    placeholder="Бүтцийн томъёо..."
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-td:text-foreground prose-th:text-blue-400 prose-th:font-semibold prose-strong:text-foreground prose-p:text-foreground/90">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {rule.structure.question.formula}
                      </ReactMarkdown>
                    </div>
                  </InlineTextEditor>
                  <div className="space-y-2 pt-4 border-t border-blue-500/10">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Жишээнүүд
                    </p>
                    <InlineTextEditor
                      value={rule.structure.question.examples.join('\n')}
                      onSave={async newValue => {
                        const examples = newValue.split('\n').filter(Boolean);
                        await handleStructureUpdate('question', {
                          ...rule.structure.question,
                          examples,
                        });
                      }}
                      isEditMode={isEditMode}
                      multiline
                      placeholder="Жишээ өгүүлбэрүүд (мөр бүр шинэ жишээ)..."
                    >
                      <div className="space-y-2">
                        {rule.structure.question.examples.map((ex, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-blue-500/5"
                          >
                            <HelpCircle className="h-4 w-4 text-blue-500 shrink-0" />
                            <span className="text-foreground italic">{ex}</span>
                          </div>
                        ))}
                      </div>
                    </InlineTextEditor>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Time Expressions Section */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <SectionHeader
            icon={Clock}
            number={4}
            titleMn="Цаг хугацааны илэрхийлэл"
            titleEn="Time Expressions"
            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          />

          <InlineArrayEditor
            items={rule.timeExpressions}
            onSave={data => handleSectionUpdate('timeExpressions', data)}
            isEditMode={isEditMode}
            createEmpty={() => ({ word: '', translation: '' })}
            renderItem={(exp, i) => (
              <div
                key={i}
                className="inline-flex group relative px-4 py-2.5 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all hover:scale-105 mr-3 mb-3"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-pink-500" />
                  <span className="font-medium text-foreground">
                    {exp.word}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground text-sm">
                    {exp.translation}
                  </span>
                </div>
              </div>
            )}
            renderEditItem={(exp, index, onChange, onRemove) => (
              <div
                key={index}
                className="flex gap-2 items-center border p-2 rounded-md bg-muted/30"
              >
                <Input
                  value={exp.word}
                  onChange={e => onChange({ ...exp, word: e.target.value })}
                  placeholder="Үг..."
                  className="flex-1"
                />
                <Input
                  value={exp.translation}
                  onChange={e =>
                    onChange({ ...exp, translation: e.target.value })
                  }
                  placeholder="Орчуулга..."
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRemove}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Practice Section */}
      <PracticeGenerator rule={rule} />
    </div>
  );
}
