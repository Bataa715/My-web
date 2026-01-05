'use client';

import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from './ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useHobbies } from '@/contexts/HobbyContext';
import { Textarea } from './ui/textarea';

interface AddHobbyDialogProps {
  children: ReactNode;
}

const hobbySchema = z.object({
  title: z.string().min(2, 'Гарчиг дор хаяж 2 тэмдэгттэй байх ёстой.'),
  description: z.string().min(10, 'Тайлбар дор хаяж 10 тэмдэгттэй байх ёстой.'),
  image: z.string().url('Зургийн холбоос буруу байна.'),
  imageHint: z.string().min(1, 'Зургийн түлхүүр үг оруулна уу.'),
});

export function AddHobbyDialog({ children }: AddHobbyDialogProps) {
  const { addHobby } = useHobbies();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof hobbySchema>>({
    resolver: zodResolver(hobbySchema),
    defaultValues: {
      title: '',
      description: '',
      image: 'https://picsum.photos/seed/new-hobby/600/400',
      imageHint: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof hobbySchema>) => {
    await addHobby(values);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Шинэ хобби нэмэх</DialogTitle>
          <DialogDescription>Хоббины мэдээллийг оруулна уу.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Гарчиг</FormLabel>
                  <FormControl>
                    <Input placeholder="Шинэ хобби" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тайлбар</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Энэ хоббины талаар..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Зургийн холбоос</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageHint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Зургийн түлхүүр үг</FormLabel>
                  <FormControl>
                    <Input placeholder="abstract nature" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Цуцлах
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Нэмж байна...' : 'Нэмэх'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
