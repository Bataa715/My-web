"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useProjects } from "@/contexts/ProjectContext";

interface AddProjectDialogProps {
    children: ReactNode;
}

export function AddProjectDialog({ children }: AddProjectDialogProps) {
    const { addProject } = useProjects();
    const [open, setOpen] = useState(false);
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const tags = (formData.get("tags") as string).split(",").map(tag => tag.trim());
        const imageUrl = formData.get("imageUrl") as string;
        const link = formData.get("link") as string;

        if (name && description && tags.length > 0 && imageUrl && link) {
            addProject({ name, description, tags, imageUrl, link });
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Шинэ төсөл нэмэх</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div>
                        <Label htmlFor="name">Төслийн нэр</Label>
                        <Input id="name" name="name" required />
                    </div>
                    <div>
                        <Label htmlFor="description">Тайлбар</Label>
                        <Textarea id="description" name="description" required />
                    </div>
                    <div>
                        <Label htmlFor="tags">Тагууд (таслалаар тусгаарлана)</Label>
                        <Input id="tags" name="tags" placeholder="React, Next.js, Firebase" required />
                    </div>
                    <div>
                        <Label htmlFor="imageUrl">Зургийн URL</Label>
                        <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://picsum.photos/seed/1/600/400" required />
                    </div>
                     <div>
                        <Label htmlFor="link">Төслийн холбоос</Label>
                        <Input id="link" name="link" type="url" required />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Цуцлах</Button>
                        </DialogClose>
                        <Button type="submit">Нэмэх</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
