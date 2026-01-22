'use client';

import { useState, type ReactNode, useMemo } from 'react';
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
import TechIcon from '@/components/shared/TechIcon';
import { iconList as techIconList } from '@/lib/tech-icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

interface AddLanguageDialogProps {
  children: ReactNode;
  onAddLanguage: (
    language: Omit<Language, 'id' | 'createdAt' | 'progress' | 'primaryColor'>
  ) => void;
}

const TechIconPicker = ({
  selectedIcon,
  onIconSelect,
}: {
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
}) => {
  const [search, setSearch] = useState('');
  const filteredIcons = useMemo(() => {
    return techIconList.filter(name =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="p-1">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Технологи хайх..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <ScrollArea className="h-72">
        <div className="grid grid-cols-6 gap-2 pr-4">
          {filteredIcons.map(iconName => (
            <button
              key={iconName}
              type="button"
              onClick={() => onIconSelect(iconName)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all duration-200 ${selectedIcon === iconName ? 'bg-primary/20 border-primary' : 'hover:bg-muted'}`}
            >
              <TechIcon techName={iconName} className="h-8 w-8" />
              <span className="text-[10px] text-center font-medium truncate w-full">
                {iconName}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export function AddLanguageDialog({
  children,
  onAddLanguage,
}: AddLanguageDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('React');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && icon) {
      onAddLanguage({ name, iconUrl: icon });
      setOpen(false);
      setName('');
      setIcon('React');
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
          <div className="space-y-2">
            <Label>Icon</Label>
            <Dialog open={isIconPickerOpen} onOpenChange={setIsIconPickerOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <TechIcon techName={icon} className="h-5 w-5" />
                  <span>{icon}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Icon сонгох</DialogTitle>
                </DialogHeader>
                <TechIconPicker
                  selectedIcon={icon}
                  onIconSelect={iconName => {
                    setIcon(iconName);
                    setIsIconPickerOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
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
