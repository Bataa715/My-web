"use client";

import { useRef } from 'react';
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/contexts/ProjectContext";
import type { Project } from '@/lib/types';

const projectSchema = z.object({
  name: z.string().min(2, "Төслийн нэр дор хаяж 2 тэмдэгттэй байх ёстой."),
  description: z.string().min(10, "Төслийн тайлбар дор хаяж 10 тэмдэгттэй байх ёстой."),
  technologies: z.string().min(1, "Дор хаяж нэг технологи оруулах ёстой."),
  link: z.string().url("Github холбоос буруу байна.").optional().or(z.literal('')),
  live: z.string().url("Live хувилбарын холбоос буруу байна.").optional().or(z.literal('')),
  category: z.string().min(1, "Төслийн ангилал заавал байх ёстой."),
  image: z.string().url("Зургийн холбоос буруу байна.").optional().or(z.literal('')),
});

interface AddProjectProps {
  setDialogOpen?: (isOpen: boolean) => void;
}

export default function AddProject({ setDialogOpen }: AddProjectProps) {
  const { addProject } = useProjects();
  const formRef = useRef<HTMLFormElement>(null);
  
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      technologies: "",
      link: "",
      live: "",
      category: "",
      image: "",
    },
  });

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    const newProject: Omit<Project, 'id' | 'createdAt'> = {
      ...values,
      technologies: values.technologies.split(',').map(tech => tech.trim()),
    };
    await addProject(newProject);
    form.reset();
    setDialogOpen?.(false);
  }

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Төслийн нэр</FormLabel>
              <FormControl>
                <Input placeholder="Жишээ нь: Хувийн блог" {...field} />
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
                <Textarea
                  placeholder="Төслийнхөө талаар товч тайлбар бичнэ үү..."
                  rows={4}
                  {...field}
                />
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
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="technologies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ашигласан технологиуд</FormLabel>
              <FormControl>
                <Input placeholder="Жишээ нь: React, Node.js, MongoDB (таслалаар тусгаарлана)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ангилал</FormLabel>
              <FormControl>
                <Input placeholder="Жишээ нь: Web Development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Github холбоос</FormLabel>
              <FormControl>
                <Input placeholder="https://github.com/user/repo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="live"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Live хувилбарын холбоос</FormLabel>
              <FormControl>
                <Input placeholder="https://my-project.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Нэмж байна...' : <><PlusCircle className="mr-2 h-4 w-4" /> Төсөл нэмэх</>}
        </Button>
      </form>
    </Form>
  );
}
