'use client';

import { useState, type ReactNode, useEffect, cloneElement } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type {
  GrammarRule,
  GrammarPracticeQuestion,
  GrammarRuleUsage,
  GrammarTimeExpression,
} from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface EditGrammarRuleDialogProps {
  children: ReactNode;
  rule: GrammarRule;
  onUpdateRule: (updatedRule: GrammarRule) => void;
  collectionPath: 'englishGrammar' | 'japaneseGrammar';
}

const emptyPracticeQuestion: GrammarPracticeQuestion = {
  question: '',
  options: ['', ''],
  correctAnswer: '',
  explanation: '',
};
const emptyUsage: GrammarRuleUsage = { condition: '', example: '' };
const emptyTimeExpression: GrammarTimeExpression = {
  word: '',
  translation: '',
};

export function EditGrammarRuleDialog({
  children,
  rule,
  onUpdateRule,
  collectionPath,
}: EditGrammarRuleDialogProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [usages, setUsages] = useState<GrammarRuleUsage[]>([]);
  const [formRegular, setFormRegular] = useState('');
  const [formIrregular, setFormIrregular] = useState('');
  const [structurePositiveFormula, setStructurePositiveFormula] = useState('');
  const [structurePositiveExamples, setStructurePositiveExamples] =
    useState('');
  const [structureNegativeFormula, setStructureNegativeFormula] = useState('');
  const [structureNegativeExamples, setStructureNegativeExamples] =
    useState('');
  const [structureQuestionFormula, setStructureQuestionFormula] = useState('');
  const [structureQuestionExamples, setStructureQuestionExamples] =
    useState('');
  const [timeExpressions, setTimeExpressions] = useState<
    GrammarTimeExpression[]
  >([]);
  const [practiceQuestions, setPracticeQuestions] = useState<
    GrammarPracticeQuestion[]
  >([]);

  useEffect(() => {
    if (open) {
      setTitle(rule.title);
      setCategory(rule.category);
      setIntroduction(rule.introduction);
      setUsages(rule.usage.length > 0 ? rule.usage : [emptyUsage]);
      setFormRegular(rule.form.regular);
      setFormIrregular(rule.form.irregular);
      setStructurePositiveFormula(rule.structure.positive.formula);
      setStructurePositiveExamples(rule.structure.positive.examples.join('\n'));
      setStructureNegativeFormula(rule.structure.negative.formula);
      setStructureNegativeExamples(rule.structure.negative.examples.join('\n'));
      setStructureQuestionFormula(rule.structure.question.formula);
      setStructureQuestionExamples(rule.structure.question.examples.join('\n'));
      setTimeExpressions(
        rule.timeExpressions.length > 0
          ? rule.timeExpressions
          : [emptyTimeExpression]
      );
      setPracticeQuestions(
        rule.practice.length > 0
          ? (rule.practice.map(p => ({
              ...p,
              options: p.options.join(', '),
            })) as any)
          : [emptyPracticeQuestion]
      );
    }
  }, [open, rule]);

  const handleArrayChange = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    field: keyof T,
    value: string
  ) => {
    setter(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddToArray = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    emptyItem: T
  ) => {
    setter(prev => [...prev, emptyItem]);
  };

  const handleRemoveFromArray = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number
  ) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !rule.id || !user) {
      toast({
        title: 'Алдаа',
        description: 'Дүрэм засах боломжгүй. Нэвтэрсэн эсэхээ шалгана уу.',
        variant: 'destructive',
      });
      return;
    }

    const updatedRuleData: Omit<GrammarRule, 'id' | 'createdAt'> = {
      title,
      category,
      introduction,
      usage: usages,
      form: { regular: formRegular, irregular: formIrregular },
      structure: {
        positive: {
          formula: structurePositiveFormula,
          examples: structurePositiveExamples.split('\n').filter(Boolean),
        },
        negative: {
          formula: structureNegativeFormula,
          examples: structureNegativeExamples.split('\n').filter(Boolean),
        },
        question: {
          formula: structureQuestionFormula,
          examples: structureQuestionExamples.split('\n').filter(Boolean),
        },
      },
      timeExpressions,
      practice: practiceQuestions.map(q => ({
        ...q,
        options: q.options
          .toString()
          .split(',')
          .map(s => s.trim()),
      })),
    };

    try {
      const docRef = doc(
        firestore,
        `users/${user.uid}/${collectionPath}`,
        rule.id
      );
      await updateDoc(docRef, updatedRuleData);
      onUpdateRule({
        ...updatedRuleData,
        id: rule.id,
        createdAt: rule.createdAt,
      });
      toast({
        title: 'Амжилттай',
        description: `"${title}" дүрэм шинэчлэгдлээ.`,
      });
      setOpen(false);
    } catch (error) {
      console.error('Error updating rule: ', error);
      toast({
        title: 'Алдаа',
        description: 'Дүрэм шинэчлэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {cloneElement(children as React.ReactElement<any>, {
          onClick: () => setOpen(true),
        })}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>"{rule.title}" дүрмийг засах</DialogTitle>
          <DialogDescription>
            Дүрмийн хэсэг тус бүрийн мэдээллийг Markdown ашиглан өөрчилнө үү.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <form onSubmit={handleSubmit} className="grid gap-6 py-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold">1. Товч ойлголт</h3>
                <div>
                  <Label htmlFor="edit-rule-title">Гарчиг</Label>
                  <Input
                    id="edit-rule-title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-rule-category">Ангилал</Label>
                  <Input
                    id="edit-rule-category"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-rule-introduction">
                    Танилцуулга (1-2 өгүүлбэр)
                  </Label>
                  <Textarea
                    id="edit-rule-introduction"
                    value={introduction}
                    onChange={e => setIntroduction(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold">2. Хэрэглээ</h3>
                {usages.map((usage, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-end border p-2 rounded-md"
                  >
                    <div className="flex-1 space-y-2">
                      <Input
                        value={usage.condition}
                        onChange={e =>
                          handleArrayChange(
                            setUsages,
                            index,
                            'condition',
                            e.target.value
                          )
                        }
                        placeholder="Нөхцөл..."
                      />
                      <Input
                        value={usage.example}
                        onChange={e =>
                          handleArrayChange(
                            setUsages,
                            index,
                            'example',
                            e.target.value
                          )
                        }
                        placeholder="Жишээ..."
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromArray(setUsages, index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddToArray(setUsages, emptyUsage)}
                >
                  <PlusCircle className="mr-2" />
                  Хэрэглээ нэмэх
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold">
                  3. Үйл үгний хэлбэр (Markdown)
                </h3>
                <div>
                  <Label>Regular Verbs</Label>
                  <Textarea
                    value={formRegular}
                    onChange={e => setFormRegular(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Irregular Verbs</Label>
                  <Textarea
                    value={formIrregular}
                    onChange={e => setFormIrregular(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold">
                  4. Өгүүлбэрийн бүтэц (Markdown)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>🟢 Positive</Label>
                    <Textarea
                      value={structurePositiveFormula}
                      onChange={e =>
                        setStructurePositiveFormula(e.target.value)
                      }
                    />
                    <Textarea
                      value={structurePositiveExamples}
                      onChange={e =>
                        setStructurePositiveExamples(e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>🔴 Negative</Label>
                    <Textarea
                      value={structureNegativeFormula}
                      onChange={e =>
                        setStructureNegativeFormula(e.target.value)
                      }
                    />
                    <Textarea
                      value={structureNegativeExamples}
                      onChange={e =>
                        setStructureNegativeExamples(e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>❓ Question</Label>
                    <Textarea
                      value={structureQuestionFormula}
                      onChange={e =>
                        setStructureQuestionFormula(e.target.value)
                      }
                    />
                    <Textarea
                      value={structureQuestionExamples}
                      onChange={e =>
                        setStructureQuestionExamples(e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold">
                  5. Цаг хугацааны илэрхийлэл
                </h3>
                {timeExpressions.map((exp, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-end border p-2 rounded-md"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        value={exp.word}
                        onChange={e =>
                          handleArrayChange(
                            setTimeExpressions,
                            index,
                            'word',
                            e.target.value
                          )
                        }
                        placeholder="Цаг"
                      />
                      <Input
                        value={exp.translation}
                        onChange={e =>
                          handleArrayChange(
                            setTimeExpressions,
                            index,
                            'translation',
                            e.target.value
                          )
                        }
                        placeholder="Орчуулга"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleRemoveFromArray(setTimeExpressions, index)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleAddToArray(setTimeExpressions, emptyTimeExpression)
                  }
                >
                  <PlusCircle className="mr-2" />
                  Цаг нэмэх
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold">6. Дасгал</h3>
                {practiceQuestions.map((q, index) => (
                  <div
                    key={index}
                    className="space-y-2 border p-4 rounded-md relative"
                  >
                    <Label>Асуулт {index + 1}</Label>
                    <Textarea
                      value={q.question}
                      onChange={e =>
                        handleArrayChange(
                          setPracticeQuestions,
                          index,
                          'question',
                          e.target.value
                        )
                      }
                    />
                    <Label>Хариултууд (таслалаар тусгаарлана)</Label>
                    <Input
                      value={q.options as any}
                      onChange={e =>
                        handleArrayChange(
                          setPracticeQuestions,
                          index,
                          'options',
                          e.target.value as any
                        )
                      }
                    />
                    <Label>Зөв хариулт</Label>
                    <Input
                      value={q.correctAnswer}
                      onChange={e =>
                        handleArrayChange(
                          setPracticeQuestions,
                          index,
                          'correctAnswer',
                          e.target.value
                        )
                      }
                    />
                    <Label>Тайлбар</Label>
                    <Textarea
                      value={q.explanation}
                      onChange={e =>
                        handleArrayChange(
                          setPracticeQuestions,
                          index,
                          'explanation',
                          e.target.value
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleRemoveFromArray(setPracticeQuestions, index)
                      }
                      className="absolute top-2 right-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleAddToArray(
                      setPracticeQuestions,
                      emptyPracticeQuestion
                    )
                  }
                >
                  <PlusCircle className="mr-2" />
                  Асуулт нэмэх
                </Button>
              </CardContent>
            </Card>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Цуцлах
                </Button>
              </DialogClose>
              <Button type="submit">Хадгалах</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
