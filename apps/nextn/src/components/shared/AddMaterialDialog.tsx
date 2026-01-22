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
import type { ReadingMaterial } from '@/lib/types';

interface AddMaterialDialogProps {
  children: ReactNode;
  onAddMaterial: (newMaterial: Omit<ReadingMaterial, 'id'>) => Promise<void>;
  dialogTitle: string;
  dialogDescription: string;
}

export function AddMaterialDialog({
  children,
  onAddMaterial,
  dialogTitle,
  dialogDescription,
}: AddMaterialDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (title && content) {
      await onAddMaterial({ title, content, source });
      setOpen(false);
      setTitle('');
      setContent('');
      setSource('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="material-title">Гарчиг</Label>
            <Input
              id="material-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Материалын гарчиг..."
              required
            />
          </div>
          <div>
            <Label htmlFor="material-content">Агуулга</Label>
            <Textarea
              id="material-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Материалын агуулгыг энд оруулна уу..."
              required
              rows={10}
            />
          </div>
          <div>
            <Label htmlFor="material-source">Эх сурвалж (заавал биш)</Label>
            <Input
              id="material-source"
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="Жишээ нь: BBC News, TED Talks..."
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Цуцлах
              </Button>
            </DialogClose>
            <Button type="submit">Нэмэх</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
