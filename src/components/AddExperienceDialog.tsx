'use client';

import { useState } from 'react';
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
import { useExperience } from '@/contexts/ExperienceContext';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const experienceImages = [
  { id: 'exp1', src: '/images/exp1.png', label: 'Frontend' },
  { id: 'exp2', src: '/images/exp2.png', label: 'Backend' },
  { id: 'exp3', src: '/images/exp3.png', label: 'Team' },
  { id: 'exp4', src: '/images/exp4.png', label: 'DevOps' },
];

export const AddExperienceDialog = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('/images/exp1.png');
  const { addExperience } = useExperience();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addExperience({ title, description, icon: '', image });
    setTitle('');
    setDescription('');
    setImage('/images/exp1.png');
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
            <Button type="submit">Нэмэх</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
