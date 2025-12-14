"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useSkills } from "@/contexts/SkillsContext";

interface AddSkillDialogProps {
    children: ReactNode;
}

export function AddSkillDialog({ children }: AddSkillDialogProps) {
    const { addSkillGroup } = useSkills();
    const [open, setOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const category = formData.get("category") as string;
        const skills = (formData.get("skills") as string).split(",").map(skill => skill.trim());

        if (category && skills.length > 0) {
            addSkillGroup({ category, skills });
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
                    <DialogTitle>Шинэ ур чадварын бүлэг нэмэх</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div>
                        <Label htmlFor="category">Бүлгийн нэр</Label>
                        <Input id="category" name="category" placeholder="Програмчлалын хэл" required />
                    </div>
                    <div>
                        <Label htmlFor="skills">Ур чадварууд (таслалаар тусгаарлана)</Label>
                        <Input id="skills" name="skills" placeholder="JavaScript, TypeScript, Python" required />
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
