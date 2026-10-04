'use client';

import { useRouter } from 'next/navigation';
import type { GrammarRule } from '@/lib/types';
import { useEditMode } from '@/providers/EditModeContext';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
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
import { EditGrammarRuleDialog } from '@/features/language/components/EditGrammarRuleDialog';
import { InlineTextEditor, InlineArrayEditor } from '@/components/common/InlineTextEditor';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/supabase';
import { doc, deleteDoc, updateDoc } from '@/supabase/db';
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
  const { firestore, user } = useSupabase();
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

  const SectionHeader = ({
    number,
    titleEn,
    titleMn,
    editButton,
  }: {
    icon?: React.ElementType;
    number: number;
    titleEn: string;
    titleMn: string;
    editButton?: React.ReactNode;
    gradient?: string;
  }) => (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-[#111] pb-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
          {String(number).padStart(2, '0')} · {titleEn}
        </p>
        <h3 className="mt-1 text-2xl">{titleMn}</h3>
      </div>
      {editButton}
    </div>
  );

  return (
    <div className="space-y-16 text-[#111]">
      <div className="flex flex-col gap-4 border-b border-[#111] pb-8 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
            {rule.category}
          </p>
          <div className="text-2xl sm:text-3xl">
            <InlineTextEditor
              value={rule.title}
              onSave={newValue => handleSectionUpdate('title', newValue)}
              isEditMode={isEditMode}
              displayClassName="block"
              placeholder="Дүрмийн нэр..."
            />
          </div>
          <div className="max-w-2xl text-sm leading-relaxed text-[#111]/60">
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
          <div className="flex shrink-0 gap-2">
            <EditGrammarRuleDialog
              rule={rule}
              onUpdateRule={onUpdateRule}
              collectionPath={collectionPath}
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none border-[#111]/30 bg-transparent"
              >
                <Edit className="mr-2 h-4 w-4" />
                Засах
              </Button>
            </EditGrammarRuleDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none border-[#c41212] bg-transparent text-[#c41212]"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
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

      <section>
          <SectionHeader
            number={1}
            titleMn="Хэрэглээ"
            titleEn="Usage"
          />

          <InlineArrayEditor
            items={rule.usage}
            onSave={data => handleSectionUpdate('usage', data)}
            isEditMode={isEditMode}
            createEmpty={() => ({ condition: '', example: '' })}
            renderItem={(use, i) => (
              <div
                key={i}
                className="group relative mb-4 border-b border-[#111]/10 py-4 last:mb-0 last:border-0"
              >
                <div className="space-y-2">
                  <p className="font-medium">
                    {use.condition}
                  </p>
                  <p className="italic text-[#111]/50 flex items-start gap-2">
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
      </section>

      <section>
          <SectionHeader
            number={2}
            titleMn="Үйл үгний хэлбэр"
            titleEn="Verb Form"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border-t border-[#111]">
              <div className="border-b border-[#111]/15 py-3">
                <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c41212]">
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
                  <div className="prose prose-sm max-w-none prose-headings:text-[#111] prose-p:text-[#111]/80 prose-td:text-[#111] prose-th:text-[#111] prose-strong:text-[#111] prose-table:my-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {rule.form.regular}
                    </ReactMarkdown>
                  </div>
                </InlineTextEditor>
              </div>
            </div>

            <div className="border-t border-[#111]">
              <div className="border-b border-[#111]/15 py-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c41212]">
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
                  <div className="prose prose-sm max-w-none prose-headings:text-[#111] prose-p:text-[#111]/80 prose-td:text-[#111] prose-th:text-[#111] prose-strong:text-[#111] prose-table:my-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {rule.form.irregular}
                    </ReactMarkdown>
                  </div>
                </InlineTextEditor>
              </div>
            </div>
          </div>
      </section>

      <section>
          <SectionHeader
            number={3}
            titleMn="Өгүүлбэрийн бүтэц"
            titleEn="Sentence Structure"
          />

          <Tabs defaultValue="positive" className="w-full">
            <TabsList className="mb-8 h-auto gap-8 bg-transparent p-0">
              <TabsTrigger
                value="positive"
                className="rounded-none border-0 bg-transparent px-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#111]/40 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-[#c41212] data-[state=active]:shadow-none"
              >
                Positive
              </TabsTrigger>
              <TabsTrigger
                value="negative"
                className="rounded-none border-0 bg-transparent px-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#111]/40 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-[#c41212] data-[state=active]:shadow-none"
              >
                Negative
              </TabsTrigger>
              <TabsTrigger
                value="question"
                className="rounded-none border-0 bg-transparent px-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#111]/40 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-[#c41212] data-[state=active]:shadow-none"
              >
                Question
              </TabsTrigger>
            </TabsList>

            <TabsContent value="positive" className="mt-6">
              <div className="border-t border-[#111]">
                <div className="border-b border-[#111]/15 py-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c41212]">
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
                    <div className="prose prose-sm max-w-none prose-headings:text-[#111] prose-p:text-[#111]/80 prose-td:text-[#111] prose-th:text-[#111] prose-strong:text-[#111]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {rule.structure.positive.formula}
                      </ReactMarkdown>
                    </div>
                  </InlineTextEditor>
                  <div className="space-y-2 border-t border-[#111]/15 pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#111]/45">
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
                            className="flex items-center gap-3 border-b border-[#111]/10 py-2 last:border-0"
                          >
                            <span className="text-[10px] text-[#c41212]">+</span>
                            <span className="italic">{ex}</span>
                          </div>
                        ))}
                      </div>
                    </InlineTextEditor>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="negative" className="mt-6">
              <div className="border-t border-[#111]">
                <div className="border-b border-[#111]/15 py-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c41212]">
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
                    <div className="prose prose-sm max-w-none prose-headings:text-[#111] prose-p:text-[#111]/80 prose-td:text-[#111] prose-th:text-[#111] prose-strong:text-[#111]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {rule.structure.negative.formula}
                      </ReactMarkdown>
                    </div>
                  </InlineTextEditor>
                  <div className="space-y-2 border-t border-[#111]/15 pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#111]/45">
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
                            className="flex items-center gap-3 border-b border-[#111]/10 py-2 last:border-0"
                          >
                            <span className="text-[10px] text-[#c41212]">–</span>
                            <span className="italic">{ex}</span>
                          </div>
                        ))}
                      </div>
                    </InlineTextEditor>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="question" className="mt-6">
              <div className="border-t border-[#111]">
                <div className="border-b border-[#111]/15 py-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c41212]">
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
                    <div className="prose prose-sm max-w-none prose-headings:text-[#111] prose-p:text-[#111]/80 prose-td:text-[#111] prose-th:text-[#111] prose-strong:text-[#111]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {rule.structure.question.formula}
                      </ReactMarkdown>
                    </div>
                  </InlineTextEditor>
                  <div className="space-y-2 border-t border-[#111]/15 pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#111]/45">
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
                            className="flex items-center gap-3 border-b border-[#111]/10 py-2 last:border-0"
                          >
                            <span className="text-[10px] text-[#c41212]">?</span>
                            <span className="italic">{ex}</span>
                          </div>
                        ))}
                      </div>
                    </InlineTextEditor>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
      </section>

      <section>
          <SectionHeader
            number={4}
            titleMn="Цаг хугацааны илэрхийлэл"
            titleEn="Time Expressions"
          />

          <InlineArrayEditor
            items={rule.timeExpressions}
            onSave={data => handleSectionUpdate('timeExpressions', data)}
            isEditMode={isEditMode}
            createEmpty={() => ({ word: '', translation: '' })}
            renderItem={(exp, i) => (
              <div
                key={i}
                className="mb-3 mr-6 inline-flex border-b border-[#111]/15 pb-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{exp.word}</span>
                  <span className="text-[#111]/30">·</span>
                  <span className="text-sm text-[#111]/50">
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
      </section>
    </div>
  );
}
