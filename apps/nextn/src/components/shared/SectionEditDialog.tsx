'use client';

import { useState, type ReactNode } from 'react';
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
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

type SectionType =
  | 'usage'
  | 'form'
  | 'structure-positive'
  | 'structure-negative'
  | 'structure-question'
  | 'time-expressions';

interface SectionEditDialogProps {
  children: ReactNode;
  sectionType: SectionType;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (data: any) => Promise<void>;
}

export function SectionEditDialog({
  children,
  sectionType,
  title,
  initialData,
  onSave,
}: SectionEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Usage state
  const [usages, setUsages] = useState<{ condition: string; example: string }[]>([]);

  // Form state
  const [formRegular, setFormRegular] = useState('');
  const [formIrregular, setFormIrregular] = useState('');

  // Structure state
  const [formula, setFormula] = useState('');
  const [examples, setExamples] = useState('');

  // Time expressions state
  const [timeExpressions, setTimeExpressions] = useState<{ word: string; translation: string }[]>([]);

  const initializeState = () => {
    switch (sectionType) {
      case 'usage':
        setUsages(initialData.length > 0 ? initialData : [{ condition: '', example: '' }]);
        break;
      case 'form':
        setFormRegular(initialData.regular || '');
        setFormIrregular(initialData.irregular || '');
        break;
      case 'structure-positive':
      case 'structure-negative':
      case 'structure-question':
        setFormula(initialData.formula || '');
        setExamples(initialData.examples?.join('\n') || '');
        break;
      case 'time-expressions':
        setTimeExpressions(initialData.length > 0 ? initialData : [{ word: '', translation: '' }]);
        break;
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      initializeState();
    }
    setOpen(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let data;
      switch (sectionType) {
        case 'usage':
          data = usages.filter(u => u.condition || u.example);
          break;
        case 'form':
          data = { regular: formRegular, irregular: formIrregular };
          break;
        case 'structure-positive':
        case 'structure-negative':
        case 'structure-question':
          data = {
            formula,
            examples: examples.split('\n').filter(Boolean),
          };
          break;
        case 'time-expressions':
          data = timeExpressions.filter(t => t.word || t.translation);
          break;
      }

      await onSave(data);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    switch (sectionType) {
      case 'usage':
        return (
          <div className="space-y-4">
            {usages.map((usage, index) => (
              <div key={index} className="flex gap-2 items-start border p-3 rounded-md bg-muted/30">
                <div className="flex-1 space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Нөхцөл</Label>
                    <Input
                      value={usage.condition}
                      onChange={e => {
                        const newUsages = [...usages];
                        newUsages[index].condition = e.target.value;
                        setUsages(newUsages);
                      }}
                      placeholder="Хэзээ хэрэглэх вэ..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Жишээ</Label>
                    <Input
                      value={usage.example}
                      onChange={e => {
                        const newUsages = [...usages];
                        newUsages[index].example = e.target.value;
                        setUsages(newUsages);
                      }}
                      placeholder="Жишээ өгүүлбэр..."
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setUsages(usages.filter((_, i) => i !== index))}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUsages([...usages, { condition: '', example: '' }])}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Хэрэглээ нэмэх
            </Button>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-4">
            <div>
              <Label>Regular Verbs (Markdown)</Label>
              <Textarea
                value={formRegular}
                onChange={e => setFormRegular(e.target.value)}
                rows={6}
                placeholder="Markdown форматаар бичнэ үү..."
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label>Irregular Verbs (Markdown)</Label>
              <Textarea
                value={formIrregular}
                onChange={e => setFormIrregular(e.target.value)}
                rows={6}
                placeholder="Markdown форматаар бичнэ үү..."
                className="font-mono text-sm"
              />
            </div>
          </div>
        );

      case 'structure-positive':
      case 'structure-negative':
      case 'structure-question':
        return (
          <div className="space-y-4">
            <div>
              <Label>Формула (Markdown хүснэгт)</Label>
              <Textarea
                value={formula}
                onChange={e => setFormula(e.target.value)}
                rows={6}
                placeholder="| Subject | Verb |&#10;| --- | --- |&#10;| I/You | base form |"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label>Жишээнүүд (мөр бүрт нэг)</Label>
              <Textarea
                value={examples}
                onChange={e => setExamples(e.target.value)}
                rows={4}
                placeholder="I work every day.&#10;She plays the piano."
              />
            </div>
          </div>
        );

      case 'time-expressions':
        return (
          <div className="space-y-4">
            {timeExpressions.map((exp, index) => (
              <div key={index} className="flex gap-2 items-center border p-3 rounded-md bg-muted/30">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Үг</Label>
                    <Input
                      value={exp.word}
                      onChange={e => {
                        const newExps = [...timeExpressions];
                        newExps[index].word = e.target.value;
                        setTimeExpressions(newExps);
                      }}
                      placeholder="yesterday"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Орчуулга</Label>
                    <Input
                      value={exp.translation}
                      onChange={e => {
                        const newExps = [...timeExpressions];
                        newExps[index].translation = e.target.value;
                        setTimeExpressions(newExps);
                      }}
                      placeholder="өчигдөр"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setTimeExpressions(timeExpressions.filter((_, i) => i !== index))}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTimeExpressions([...timeExpressions, { word: '', translation: '' }])}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Илэрхийлэл нэмэх
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Энэ хэсгийг засварлана уу. Markdown форматыг ашиглаж болно.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[60vh] pr-4">
            {renderContent()}
          </ScrollArea>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Цуцлах
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
