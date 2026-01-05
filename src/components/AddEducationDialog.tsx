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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEducation } from '@/contexts/EducationContext';

interface AddEducationDialogProps {
  children: ReactNode;
}

const educationSchema = z.object({
  degree: z.string().min(2, 'Мэргэжлийн нэр дор хаяж 2 тэмдэгттэй байх ёстой.'),
  school: z.string().min(2, 'Сургуулийн нэр дор хаяж 2 тэмдэгттэй байх ёстой.'),
  startDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Эхлэх огноо буруу байна.',
    }),
  endDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Дуусах огноо буруу байна.',
    }),
  score: z.string().optional(),
});

export function AddEducationDialog({ children }: AddEducationDialogProps) {
  const { addEducation } = useEducation();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof educationSchema>>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      degree: '',
      school: '',
      startDate: '',
      endDate: '',
      score: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof educationSchema>) => {
    await addEducation(values);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Шинэ боловсрол нэмэх</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Мэргэжил/Зэрэг</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Мэдээллийн технологийн бакалавр"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сургууль</FormLabel>
                  <FormControl>
                    <Input placeholder="Монгол Улсын Их Сургууль" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Эхэлсэн огноо</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дууссан огноо</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Голч/Дүн</FormLabel>
                  <FormControl>
                    <Input placeholder="3.7" {...field} />
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
