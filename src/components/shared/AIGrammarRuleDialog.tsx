'use client';

import { useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GrammarRule } from '@/lib/types';
import {
  Loader2,
  Sparkles,
  BookOpen,
  Clock,
  HelpCircle,
  Languages,
  Zap,
  MessageSquare,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { cn } from '@/lib/utils';
import {
  generateGrammarRule,
  type GrammarFormat,
} from '@/ai/flows/generate-grammar-rule-flow';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface AIGrammarRuleDialogProps {
  children: ReactNode;
  onAddRule: (newRule: Omit<GrammarRule, 'id' | 'createdAt'>) => Promise<void>;
  ruleType: 'english' | 'japanese';
}

const formatOptions: {
  value: GrammarFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'tense',
    label: 'Tense (Цаг)',
    description: 'Present, Past, Future гэх мэт цагийн дүрэм',
    icon: <Clock className="h-5 w-5" />,
  },
  {
    value: 'conditional',
    label: 'Conditional (Нөхцөл)',
    description: 'If clauses, нөхцөлт өгүүлбэр',
    icon: <HelpCircle className="h-5 w-5" />,
  },
  {
    value: 'modal',
    label: 'Modal (Модаль)',
    description: 'Can, Could, Would гэх мэт модаль үйл үг',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    value: 'particle',
    label: 'Particle (Particle)',
    description: 'Япон хэлний particle дүрэм',
    icon: <Languages className="h-5 w-5" />,
  },
  {
    value: 'general',
    label: 'General (Ерөнхий)',
    description: 'Бусад төрлийн дүрэм',
    icon: <BookOpen className="h-5 w-5" />,
  },
];

export function AIGrammarRuleDialog({
  children,
  onAddRule,
  ruleType,
}: AIGrammarRuleDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'input' | 'generating' | 'preview'>('input');
  const [ruleName, setRuleName] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<GrammarFormat>('tense');
  const [generatedRule, setGeneratedRule] = useState<Omit<
    GrammarRule,
    'id' | 'createdAt'
  > | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const resetState = () => {
    setStep('input');
    setRuleName('');
    setSelectedFormat('tense');
    setGeneratedRule(null);
    setIsGenerating(false);
  };

  const handleGenerate = async () => {
    if (!ruleName.trim()) {
      toast({
        title: 'Алдаа',
        description: 'Дүрмийн нэрийг оруулна уу',
        variant: 'destructive',
      });
      return;
    }

    setStep('generating');
    setIsGenerating(true);

    try {
      const result = await generateGrammarRule({
        ruleName: ruleName.trim(),
        language: ruleType,
        format: selectedFormat,
      });

      setGeneratedRule(result);
      setStep('preview');
    } catch (error) {
      console.error('Error generating grammar rule:', error);
      toast({
        title: 'Алдаа',
        description: 'Дүрэм үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.',
        variant: 'destructive',
      });
      setStep('input');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedRule) return;

    setIsSaving(true);
    try {
      await onAddRule(generatedRule);
      toast({
        title: 'Амжилттай',
        description: 'Дүрэм амжилттай нэмэгдлээ',
      });
      setOpen(false);
      resetState();
    } catch (error) {
      console.error('Error saving grammar rule:', error);
      toast({
        title: 'Алдаа',
        description: 'Дүрэм хадгалахад алдаа гарлаа',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        setOpen(isOpen);
        if (!isOpen) resetState();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-ээр дүрэм үүсгэх
          </DialogTitle>
          <DialogDescription>
            Дүрмийн нэрийг оруулаад форматаа сонгоно уу. AI автоматаар бүрэн
            дүрэм үүсгэнэ.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 py-4"
            >
              {/* Rule Name Input */}
              <div className="space-y-2">
                <Label htmlFor="rule-name" className="text-base font-medium">
                  Дүрмийн нэр
                </Label>
                <Input
                  id="rule-name"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  placeholder={
                    ruleType === 'english'
                      ? 'Past Perfect Tense, First Conditional...'
                      : 'て form, Particle は...'
                  }
                  className="h-12 text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  {ruleType === 'english'
                    ? 'Жишээ: Present Continuous, Second Conditional, Modal Verbs...'
                    : 'Жишээ: て form, ない form, Particle を...'}
                </p>
              </div>

              {/* Format Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Формат сонгох</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formatOptions
                    .filter(opt =>
                      ruleType === 'japanese' ? true : opt.value !== 'particle'
                    )
                    .map(option => (
                      <Card
                        key={option.value}
                        className={cn(
                          'cursor-pointer transition-all duration-200 hover:border-primary/50',
                          selectedFormat === option.value
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'hover:bg-muted/50'
                        )}
                        onClick={() => setSelectedFormat(option.value)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <span
                              className={cn(
                                'p-1.5 rounded-md',
                                selectedFormat === option.value
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              )}
                            >
                              {option.icon}
                            </span>
                            {option.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <CardDescription className="text-xs">
                            {option.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Цуцлах
                </Button>
                <Button onClick={handleGenerate} disabled={!ruleName.trim()}>
                  <Zap className="mr-2 h-4 w-4" />
                  Үүсгэх
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative bg-primary rounded-full p-4">
                  <Sparkles className="h-8 w-8 text-primary-foreground animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  AI дүрэм үүсгэж байна...
                </h3>
                <p className="text-sm text-muted-foreground">
                  "{ruleName}" дүрмийг {selectedFormat} форматаар үүсгэж байна
                </p>
              </div>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </motion.div>
          )}

          {step === 'preview' && generatedRule && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-4"
            >
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-primary">
                    {generatedRule.title}
                  </h3>
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {generatedRule.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {generatedRule.introduction}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="text-center p-2 rounded-md bg-background">
                    <div className="text-lg font-bold text-primary">
                      {generatedRule.usage.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Хэрэглээ
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-md bg-background">
                    <div className="text-lg font-bold text-primary">
                      {generatedRule.timeExpressions.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Цагийн илэрхийлэл
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-md bg-background">
                    <div className="text-lg font-bold text-primary">
                      {generatedRule.practice.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Дасгал</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                AI-ээр үүсгэсэн дүрэм. Хадгалахын өмнө шалгана уу.
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setStep('input')}>
                  Буцах
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Дахин үүсгэх
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <BookOpen className="mr-2 h-4 w-4" />
                  )}
                  Хадгалах
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
