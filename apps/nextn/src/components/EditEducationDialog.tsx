'use client';

import { useState, type ReactNode, useEffect } from 'react';
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
import { useEducation } from '@/contexts/EducationContext';
import type { Education } from '@/lib/types';
import { format } from 'date-fns';

interface EditEducationDialogProps {
  children: ReactNode;
  education: Education;
}

const educationSchema = z.object({
  degree: z.string().min(2, 'Мэргэжлийн нэр дор хаяж 2 тэмдэгттэй байх ёстой.'),
  school: z.string().min(2, 'Сургуулийн нэр дор хаяж 2 тэмдэгттэй байх ёстой.'),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Эхлэх огноо буруу байна.',
  }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Дуусах огноо буруу байна.',
  }),
  score: z.string().optional(),
});

export function EditEducationDialog({
  children,
  education,
}: EditEducationDialogProps) {
  const { updateEducation } = useEducation();
  const [open, setOpen] = useState(false);

  const formatDateForInput = (date: any) => {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate();
    try {
      return format(d, 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

  const form = useForm<z.infer<typeof educationSchema>>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      degree: education.degree,
      school: education.school,
      startDate: formatDateForInput(education.startDate),
      endDate: formatDateForInput(education.endDate),
      score: education.score || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        degree: education.degree,
        school: education.school,
        startDate: formatDateForInput(education.startDate),
        endDate: formatDateForInput(education.endDate),
        score: education.score || '',
      });
    }
  }, [open, education, form]);

  const onSubmit = async (values: z.infer<typeof educationSchema>) => {
    if (education.id) {
      await updateEducation(education.id, {
        ...values,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
      });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>"{education.degree}"-г засах</DialogTitle>
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                {form.formState.isSubmitting ? 'Хадгалж байна...' : 'Хадгалах'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
