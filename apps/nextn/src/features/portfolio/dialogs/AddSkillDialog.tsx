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
import { useSkills } from '@/features/portfolio/context/SkillsContext';
import IconPicker from '@/components/common/IconPicker';
import * as LucideIcons from 'lucide-react';

interface AddSkillDialogProps {
  children: ReactNode;
}

export function AddSkillDialog({ children }: AddSkillDialogProps) {
  const { addSkillGroup } = useSkills();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Code');
  const [items, setItems] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const skillItems = items.filter(skill => skill.length > 0);

    if (name && icon && skillItems.length > 0) {
      addSkillGroup({ name, icon, items: skillItems });
      setOpen(false);
      // Reset state
      setName('');
      setIcon('Code');
      setItems([]);
    }
  };

  const getIcon = (iconName: string) => {
    const LucideIcon = (LucideIcons as any)[iconName];
    return LucideIcon ? <LucideIcon className="h-5 w-5" /> : null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Шинэ ур чадварын бүлэг нэмэх</DialogTitle>
          <DialogDescription>
            Бүлгийн нэр, icon-г сонгоод ур чадваруудаа нэмнэ үү.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="group-name">Бүлгийн нэр</Label>
              <Input
                id="group-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Програмчлалын хэл"
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
          </div>

          {/* Skills Input */}
          <div>
            <Label htmlFor="group-items">
              Ур чадварууд (таслалаар тусгаарлана)
            </Label>
            <Input
              id="group-items"
              value={items.join(', ')}
              onChange={e =>
                setItems(e.target.value.split(',').map(s => s.trim()))
              }
              placeholder="JavaScript, TypeScript, Python"
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
