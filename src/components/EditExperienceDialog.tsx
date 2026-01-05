'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  useExperience,
  type ExperienceItem,
} from '@/contexts/ExperienceContext';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const experienceImages = [
  { id: 'exp1', src: '/images/exp1.png', label: 'Frontend' },
  { id: 'exp2', src: '/images/exp2.png', label: 'Backend' },
  { id: 'exp3', src: '/images/exp3.png', label: 'Team' },
  { id: 'exp4', src: '/images/exp4.png', label: 'DevOps' },
];

export const EditExperienceDialog = ({
  experience,
  children,
}: {
  experience: ExperienceItem;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(experience.title);
  const [description, setDescription] = useState(experience.description);
  const [image, setImage] = useState(experience.image || '/images/exp1.png');
  const { updateExperience } = useExperience();

  useEffect(() => {
    setTitle(experience.title);
    setDescription(experience.description);
    setImage(experience.image || '/images/exp1.png');
  }, [experience]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateExperience(experience.id, {
      title,
      description,
      icon: '',
      image,
    });
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
              onChange={e => setTitle(e.target.value)}
              placeholder="Жишээ: Фронтенд инженер"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Тайлбар</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Туршлагын дэлгэрэнгүй..."
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Зураг сонгох</Label>
            <div className="grid grid-cols-4 gap-3">
              {experienceImages.map(img => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setImage(img.src)}
                  className={cn(
                    'relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200',
                    'hover:border-primary/50 hover:scale-105',
                    image === img.src
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border/50'
                  )}
                >
                  <Image
                    src={img.src}
                    alt={img.label}
                    fill
                    className="object-contain p-2"
                  />
                  {image === img.src && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Цуцлах
            </Button>
            <Button type="submit">Хадгалах</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
