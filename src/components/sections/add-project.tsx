
"use client";

import { useRef, useState } from 'react';
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
import { ScrollArea } from '../ui/scroll-area';
import { technologyList } from '@/data/technologies';
import TechIcon from '../shared/TechIcon';
import { cn } from '@/lib/utils';

const projectSchema = z.object({
  name: z.string().min(2, "Төслийн нэр дор хаяж 2 тэмдэгттэй байх ёстой."),
  description: z.string().min(10, "Төслийн тайлбар дор хаяж 10 тэмдэгттэй байх ёстой."),
  technologies: z.array(z.string()).min(1, "Дор хаяж нэг технологи сонгох ёстой."),
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
  
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      technologies: [],
      link: "",
      live: "",
      category: "",
      image: "",
    },
  });

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    await addProject(values);
    form.reset();
    setDialogOpen?.(false);
  }

  const selectedTechs = form.watch('technologies') || [];

  const handleTechToggle = (techName: string) => {
    const currentTechs = form.getValues('technologies') || [];
    const newTechs = currentTechs.includes(techName)
      ? currentTechs.filter(t => t !== techName)
      : [...currentTechs, techName];
    form.setValue('technologies', newTechs, { shouldValidate: true });
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          render={() => (
            <FormItem>
              <FormLabel>Ашигласан технологиуд</FormLabel>
                <ScrollArea className="h-32 w-full rounded-md border p-4">
                    <div className="flex flex-wrap gap-4">
                        {technologyList.map(tech => (
                            <button
                                key={tech.name}
                                type="button"
                                onClick={() => handleTechToggle(tech.name)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-2 rounded-md border transition-colors w-20",
                                    selectedTechs.includes(tech.name) 
                                        ? "bg-primary/10 border-primary" 
                                        : "bg-muted/50 hover:bg-muted"
                                )}
                            >
                                <TechIcon techName={tech.name} className="h-6 w-6" />
                                <span className="text-xs text-center">{tech.name}</span>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
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
