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
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { useExperience } from '@/contexts/ExperienceContext';
import type { Experience } from '@/lib/types';
import { format } from 'date-fns';

interface EditExperienceDialogProps {
  children: ReactNode;
  experience: Experience;
}

const experienceSchema = z.object({
  title: z
    .string()
    .min(2, 'Ажлын байрны нэр дор хаяж 2 тэмдэгттэй байх ёстой.'),
  company: z
    .string()
    .min(2, 'Байгууллагын нэр дор хаяж 2 тэмдэгттэй байх ёстой.'),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Эхлэх огноо буруу байна.',
  }),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

export function EditExperienceDialog({
  children,
  experience,
}: EditExperienceDialogProps) {
  const { updateExperience } = useExperience();
  const [open, setOpen] = useState(false);

  const formatDateForInput = (date: any) => {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate?.() ?? date;
    try {
      return format(d, 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

  const form = useForm<z.infer<typeof experienceSchema>>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: experience.title,
      company: experience.company,
      startDate: formatDateForInput(experience.startDate),
      endDate: experience.endDate
        ? formatDateForInput(experience.endDate)
        : '',
      current: experience.current,
      description: experience.description || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: experience.title,
        company: experience.company,
        startDate: formatDateForInput(experience.startDate),
        endDate: experience.endDate
          ? formatDateForInput(experience.endDate)
          : '',
        current: experience.current,
        description: experience.description || '',
      });
    }
  }, [open, experience, form]);

  const isCurrent = form.watch('current');

  const onSubmit = async (values: z.infer<typeof experienceSchema>) => {
    if (experience.id) {
      await updateExperience(experience.id, {
        title: values.title,
        company: values.company,
        startDate: new Date(values.startDate),
        endDate:
          values.current || !values.endDate
            ? null
            : new Date(values.endDate),
        current: values.current,
        description: values.description,
      });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>"{experience.title}"-г засах</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ажлын байрны нэр</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Байгууллага</FormLabel>
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
              {!isCurrent && (
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
              )}
            </div>
            <FormField
              control={form.control}
              name="current"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer font-normal">
                    Одоо ажиллаж байна
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тайлбар (заавал биш)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      className="resize-none"
                      {...field}
                    />
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
                {form.formState.isSubmitting
                  ? 'Хадгалж байна...'
                  : 'Хадгалах'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
