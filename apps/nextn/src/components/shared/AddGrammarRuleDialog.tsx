'use client';

import { useState, type ReactNode, useEffect } from 'react';
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

interface AddGrammarRuleDialogProps {
  children: ReactNode;
  onAddRule: (newRule: Omit<GrammarRule, 'id' | 'createdAt'>) => Promise<void>;
  ruleType: 'english' | 'japanese';
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

export function AddGrammarRuleDialog({
  children,
  onAddRule,
}: AddGrammarRuleDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [introduction, setIntroduction] = useState('');

  const [usages, setUsages] = useState<GrammarRuleUsage[]>([emptyUsage]);
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
  >([emptyTimeExpression]);
  const [practiceQuestions, setPracticeQuestions] = useState<
    GrammarPracticeQuestion[]
  >([emptyPracticeQuestion]);

  const resetState = () => {
    setTitle('');
    setCategory('');
    setIntroduction('');
    setUsages([emptyUsage]);
    setFormRegular('');
    setFormIrregular('');
    setStructurePositiveFormula('');
    setStructurePositiveExamples('');
    setStructureNegativeFormula('');
    setStructureNegativeExamples('');
    setStructureQuestionFormula('');
    setStructureQuestionExamples('');
    setTimeExpressions([emptyTimeExpression]);
    setPracticeQuestions([emptyPracticeQuestion]);
  };

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

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

    const newRule: Omit<GrammarRule, 'id' | 'createdAt'> = {
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

    if (title && introduction && category) {
      await onAddRule(newRule);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Шинэ дүрэм нэмэх</DialogTitle>
          <DialogDescription>
            Дүрмийн хэсэг тус бүрийн мэдээллийг Markdown ашиглан оруулна уу.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <form onSubmit={handleSubmit} className="grid gap-6 py-4">
            {/* 1. Introduction */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold">1. Товч ойлголт</h3>
                <div>
                  <Label htmlFor="rule-title">Гарчиг</Label>
                  <Input
                    id="rule-title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Past Simple Tense"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rule-category">Ангилал</Label>
                  <Input
                    id="rule-category"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Tenses, Conditionals..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rule-introduction">
                    Танилцуулга (1-2 өгүүлбэр)
                  </Label>
                  <Textarea
                    id="rule-introduction"
                    value={introduction}
                    onChange={e => setIntroduction(e.target.value)}
                    placeholder="Used to talk about actions that happened in the past."
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Usage */}
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

            {/* 3. Form */}
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
                    placeholder="Verb + ed..."
                  />
                </div>
                <div>
                  <Label>Irregular Verbs</Label>
                  <Textarea
                    value={formIrregular}
                    onChange={e => setFormIrregular(e.target.value)}
                    placeholder="Go -> Went..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* 4. Structure */}
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
                      placeholder="Formula (Markdown)"
                    />
                    <Textarea
                      value={structurePositiveExamples}
                      onChange={e =>
                        setStructurePositiveExamples(e.target.value)
                      }
                      placeholder="Examples (мөрөөр тусгаарлана)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>🔴 Negative</Label>
                    <Textarea
                      value={structureNegativeFormula}
                      onChange={e =>
                        setStructureNegativeFormula(e.target.value)
                      }
                      placeholder="Formula (Markdown)"
                    />
                    <Textarea
                      value={structureNegativeExamples}
                      onChange={e =>
                        setStructureNegativeExamples(e.target.value)
                      }
                      placeholder="Examples (мөрөөр тусгаарлана)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>❓ Question</Label>
                    <Textarea
                      value={structureQuestionFormula}
                      onChange={e =>
                        setStructureQuestionFormula(e.target.value)
                      }
                      placeholder="Formula (Markdown)"
                    />
                    <Textarea
                      value={structureQuestionExamples}
                      onChange={e =>
                        setStructureQuestionExamples(e.target.value)
                      }
                      placeholder="Examples (мөрөөр тусгаарлана)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Time Expressions */}
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

            {/* 6. Practice */}
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
                      placeholder="Асуулт..."
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
                      placeholder="Хариулт 1, Хариулт 2..."
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
                      placeholder="Зөв хариулт..."
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
                      placeholder="Тайлбар..."
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
