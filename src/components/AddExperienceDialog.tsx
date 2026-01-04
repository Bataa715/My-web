'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useExperience } from '@/contexts/ExperienceContext';
import IconPicker from './shared/IconPicker';

export const AddExperienceDialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Briefcase');
  const { addExperience } = useExperience();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addExperience({ title, description, icon });
    setTitle('');
    setDescription('');
    setIcon('Briefcase');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Туршлага нэмэх</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Нэр</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Жишээ: Фронтенд инженер"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Тайлбар</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Туршлагын дэлгэрэнгүй..."
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Дүрс</Label>
            <IconPicker selectedIcon={icon} onIconSelect={setIcon}>
              <Button type="button" variant="outline" className="w-full justify-start">
                {icon}
              </Button>
            </IconPicker>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Цуцлах
            </Button>
            <Button type="submit">Нэмэх</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
