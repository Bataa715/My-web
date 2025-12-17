
"use client";

import { useState, type ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import type { Hobby } from "@/lib/types";
import { useHobbies } from "@/contexts/HobbyContext";

interface EditHobbyDialogProps {
    children: ReactNode;
    hobby: Hobby;
}

const hobbySchema = z.object({
  title: z.string().min(2, "Гарчиг дор хаяж 2 тэмдэгттэй байх ёстой."),
  description: z.string().min(10, "Тайлбар дор хаяж 10 тэмдэгттэй байх ёстой."),
  image: z.string().url("Зургийн холбоос буруу байна."),
  imageHint: z.string().min(1, "Зургийн түлхүүр үг оруулна уу."),
});

export function EditHobbyDialog({ children, hobby }: EditHobbyDialogProps) {
    const { updateHobby } = useHobbies();
    const [open, setOpen] = useState(false);
    
    const form = useForm<z.infer<typeof hobbySchema>>({
        resolver: zodResolver(hobbySchema),
        defaultValues: hobby,
    });

    useEffect(() => {
        if (open) {
            form.reset(hobby);
        }
    }, [open, hobby, form]);
    
    const onSubmit = async (values: z.infer<typeof hobbySchema>) => {
        if (hobby.id) {
            await updateHobby(hobby.id, values);
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>"{hobby.title}"-г засах</DialogTitle>
                     <DialogDescription>
                        Хоббины мэдээллийг өөрчилнө үү.
                    </DialogDescription>
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
                            <Input {...field} />
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
                             <Textarea {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Цуцлах</Button>
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
