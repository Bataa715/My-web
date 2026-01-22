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
import { useFirebase } from '@/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import IconPicker from './shared/IconPicker';
import type { PersonalInfoItem } from '@/lib/types';

interface AddPersonalInfoDialogProps {
  children: ReactNode;
  onAdd?: (info: PersonalInfoItem) => void;
}

const personalInfoSchema = z.object({
  label: z.string().min(1, 'Гарчиг оруулна уу.'),
  value: z.string().min(1, 'Утга оруулна уу.'),
  icon: z.string().optional(),
});

export function AddPersonalInfoDialog({
  children,
  onAdd,
}: AddPersonalInfoDialogProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      label: '',
      value: '',
      icon: 'Star',
    },
  });

  const onSubmit = async (values: z.infer<typeof personalInfoSchema>) => {
    if (!user || !firestore) {
      toast({
        title: 'Алдаа',
        description: 'Нэвтэрч орно уу.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const currentInfo: PersonalInfoItem[] =
        userDoc.data()?.personalInfo || [];

      // Check if label already exists
      if (currentInfo.some(info => info.label === values.label)) {
        toast({
          title: 'Алдаа',
          description: 'Энэ гарчигтай мэдээлэл аль хэдийн байна.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      const newInfo: PersonalInfoItem = {
        label: values.label,
        value: values.value,
        icon: values.icon || 'Star',
      };

      await updateDoc(userDocRef, {
        personalInfo: [...currentInfo, newInfo],
      });

      onAdd?.(newInfo);
      form.reset();
      setOpen(false);
      toast({
        title: 'Амжилттай',
        description: 'Хувийн мэдээлэл нэмэгдлээ.',
      });
    } catch (error) {
      console.error('Error adding personal info:', error);
      toast({
        title: 'Алдаа',
        description: 'Мэдээлэл нэмэхэд алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Хувийн мэдээлэл нэмэх</DialogTitle>
          <DialogDescription>
            Шинэ хувийн мэдээллийн гарчиг болон утгыг оруулна уу.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Гарчиг</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Жишээ: MBTI, Нас, Өндөр..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Утга</FormLabel>
                  <FormControl>
                    <Input placeholder="Жишээ: INTJ, 25, 180см..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дүрс</FormLabel>
                  <FormControl>
                    <IconPicker
                      selectedIcon={field.value || 'Star'}
                      onIconSelect={field.onChange}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start gap-2"
                      >
                        {field.value || 'Star'}
                      </Button>
                    </IconPicker>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Нэмж байна...' : 'Нэмэх'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
