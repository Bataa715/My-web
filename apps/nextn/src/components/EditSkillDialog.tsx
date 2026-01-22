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
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useSkills } from '@/contexts/SkillsContext';
import type { Skill } from '@/lib/types';
import IconPicker from './shared/IconPicker';
import * as LucideIcons from 'lucide-react';

interface EditSkillDialogProps {
  children: ReactNode;
  skillGroup: Skill;
}

interface EditingGroupState {
  name: string;
  icon: string;
  items: string;
}

export function EditSkillDialog({
  children,
  skillGroup,
}: EditSkillDialogProps) {
  const { updateSkillGroup } = useSkills();
  const [open, setOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<EditingGroupState>({
    name: skillGroup.name,
    icon: skillGroup.icon,
    items: skillGroup.items.join(', '),
  });

  useEffect(() => {
    if (open) {
      setEditingGroup({
        name: skillGroup.name,
        icon: skillGroup.icon,
        items: skillGroup.items.join(', '),
      });
    }
  }, [open, skillGroup]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updatedSkills = editingGroup.items
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean);

    if (editingGroup.name && editingGroup.icon && updatedSkills.length > 0) {
      updateSkillGroup(skillGroup.id, {
        name: editingGroup.name,
        icon: editingGroup.icon,
        items: updatedSkills,
      });
      setOpen(false);
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
          <DialogTitle>"{skillGroup.name}" бүлгийг засах</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="edit-group-name">Бүлгийн нэр</Label>
            <Input
              id="edit-group-name"
              value={editingGroup.name}
              onChange={e =>
                setEditingGroup({ ...editingGroup, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker
              selectedIcon={editingGroup.icon || 'Code'}
              onIconSelect={iconName =>
                setEditingGroup({ ...editingGroup, icon: iconName })
              }
            >
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2"
              >
                {getIcon(editingGroup.icon || 'Code')}
                <span>{editingGroup.icon}</span>
              </Button>
            </IconPicker>
          </div>
          <div>
            <Label htmlFor="edit-group-items">
              Ур чадварууд (таслалаар тусгаарлана)
            </Label>
            <Input
              id="edit-group-items"
              value={editingGroup.items}
              onChange={e =>
                setEditingGroup({ ...editingGroup, items: e.target.value })
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
            <Button type="submit">Хадгалах</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
