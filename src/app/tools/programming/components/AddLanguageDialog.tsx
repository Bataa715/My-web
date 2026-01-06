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
import IconPicker from '@/components/shared/IconPicker';
import * as LucideIcons from 'lucide-react';

interface AddLanguageDialogProps {
  children: ReactNode;
  onAddLanguage: (
    language: Omit<Language, 'id' | 'createdAt' | 'progress' | 'primaryColor'>
  ) => void;
}

export function AddLanguageDialog({
  children,
  onAddLanguage,
}: AddLanguageDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Code');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && icon) {
      onAddLanguage({ name, iconUrl: icon });
      setOpen(false);
      setName('');
      setIcon('Code');
    }
  };

  const getIcon = (iconName: string) => {
    const LucideIcon = (LucideIcons as any)[iconName];
    return LucideIcon ? <LucideIcon className="h-5 w-5" /> : null;
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
          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker selectedIcon={icon} onIconSelect={setIcon}>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2"
              >
                {getIcon(icon)}
                <span>{icon}</span>
              </Button>
            </IconPicker>
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
