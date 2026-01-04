'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useExperience, type ExperienceItem } from '@/contexts/ExperienceContext';
import IconPicker from './shared/IconPicker';

export const EditExperienceDialog = ({ 
  experience, 
  children 
}: { 
  experience: ExperienceItem; 
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(experience.title);
  const [description, setDescription] = useState(experience.description);
  const [icon, setIcon] = useState(experience.icon);
  const { updateExperience } = useExperience();

  useEffect(() => {
    setTitle(experience.title);
    setDescription(experience.description);
    setIcon(experience.icon);
  }, [experience]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateExperience(experience.id, { title, description, icon });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Туршлага засварлах</DialogTitle>
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
            <Button type="submit">Хадгалах</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
