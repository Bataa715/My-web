"use client";

import { useState, type ReactNode, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useProjects } from "@/contexts/ProjectContext";
import type { Project } from "@/lib/types";

interface EditProjectDialogProps {
    children: ReactNode;
    project: Project;
}

const projectSchema = z.object({
  name: z.string().min(2, "Төслийн нэр дор хаяж 2 тэмдэгттэй байх ёстой."),
  description: z.string().min(10, "Төслийн тайлбар дор хаяж 10 тэмдэгттэй байх ёстой."),
  technologies: z.string().min(1, "Дор хаяж нэг технологи оруулах ёстой."),
  link: z.string().url("Github холбоос буруу байна.").optional().or(z.literal('')),
  live: z.string().url("Live хувилбарын холбоос буруу байна.").optional().or(z.literal('')),
  category: z.string().min(1, "Төслийн ангилал заавал байх ёстой."),
  image: z.string().url("Зургийн холбоос буруу байна.").optional().or(z.literal('')),
});


export function EditProjectDialog({ children, project }: EditProjectDialogProps) {
    const { updateProject } = useProjects();
    const [open, setOpen] = useState(false);
    
    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: project.name,
            description: project.description,
            technologies: project.technologies.join(', '),
            category: project.category,
            link: project.link || '',
            live: project.live || '',
            image: project.image || '',
        },
    });

     useEffect(() => {
        if (open) {
            form.reset({
                name: project.name,
                description: project.description,
                technologies: project.technologies.join(', '),
                category: project.category,
                link: project.link || '',
                live: project.live || '',
                image: project.image || '',
            });
        }
    }, [open, project, form]);
    
    const onSubmit = async (values: z.infer<typeof projectSchema>) => {
        const updatedProjectData = {
          ...values,
          technologies: values.technologies.split(',').map(tech => tech.trim()),
        };
        
        if (project.id) {
            await updateProject(project.id, updatedProjectData);
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
                    <DialogTitle>"{project.name}" төслийг засах</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Төслийн нэр</FormLabel>
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
                            <Textarea rows={4} {...field} />
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
                            <Input placeholder="React, Node.js (таслалаар тусгаарлана)" {...field} />
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
                            <Input placeholder="Web Development" {...field} />
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
                            <Input {...field} />
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
