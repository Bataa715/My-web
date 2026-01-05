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
import { Label } from '@/components/ui/label';
import type { Language } from '@/lib/types';

interface AddLanguageDialogProps {
  children: ReactNode;
  onAddLanguage: (
    language: Omit<Language, 'id' | 'createdAt' | 'progress'>
  ) => void;
}

export function AddLanguageDialog({
  children,
  onAddLanguage,
}: AddLanguageDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && iconUrl && primaryColor) {
      onAddLanguage({ name, iconUrl, primaryColor });
      setOpen(false);
      setName('');
      setIconUrl('');
      setPrimaryColor('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Шинэ хэл нэмэх</DialogTitle>
          <DialogDescription>
            Суралцах програмчлалын хэлний мэдээллийг оруулна уу.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="lang-name">Хэлний нэр</Label>
            <Input
              id="lang-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Жишээ: Python"
              required
            />
          </div>
          <div>
            <Label htmlFor="lang-icon">Icon URL</Label>
            <Input
              id="lang-icon"
              value={iconUrl}
              onChange={e => setIconUrl(e.target.value)}
              placeholder="https://example.com/icon.svg"
              required
            />
          </div>
          <div>
            <Label htmlFor="lang-color">Үндсэн өнгө (RGB)</Label>
            <Input
              id="lang-color"
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
              placeholder="Жишээ: 168, 85, 247"
              required
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
