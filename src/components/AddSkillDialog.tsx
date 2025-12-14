"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "./ui/dialog";
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
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [items, setItems] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const skillItems = items.split(",").map(skill => skill.trim());

        if (name && icon && skillItems.length > 0) {
            addSkillGroup({ name, icon, items: skillItems });
            setOpen(false);
            setName('');
            setIcon('');
            setItems('');
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
                    <DialogDescription>
                        Бүлгийн нэр, Lucide icon нэр, болон ур чадваруудыг таслалаар тусгаарлан оруулна уу.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div>
                        <Label htmlFor="group-name">Бүлгийн нэр</Label>
                        <Input id="group-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Програмчлалын хэл" required />
                    </div>
                     <div>
                        <Label htmlFor="group-icon">Icon</Label>
                        <Input id="group-icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Жишээ: Code" required />
                    </div>
                    <div>
                        <Label htmlFor="group-items">Ур чадварууд (таслалаар тусгаарлана)</Label>
                        <Input id="group-items" value={items} onChange={(e) => setItems(e.target.value)} placeholder="JavaScript, TypeScript, Python" required />
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
