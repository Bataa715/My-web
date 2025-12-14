"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useSkills } from "@/contexts/SkillsContext";
import IconPicker from "./shared/IconPicker";
import { Badge } from "./ui/badge";
import * as LucideIcons from 'lucide-react';

export function AddSkillDialog({ children }: AddSkillDialogProps) {
    const { addSkillGroup } = useSkills();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('Code');
    const [items, setItems] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const skillItems = items.split(",").map(skill => skill.trim()).filter(skill => skill.length > 0);

        if (name && icon && skillItems.length > 0) {
            addSkillGroup({ name, icon, items: skillItems });
            setOpen(false);
            setName('');
            setIcon('Code');
            setItems('');
        }
    };

    const getIcon = (iconName: string) => {
        const LucideIcon = (LucideIcons as any)[iconName];
        return LucideIcon ? <LucideIcon className="h-5 w-5" /> : null;
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
                        Бүлгийн нэр, icon, болон ур чадваруудыг таслалаар тусгаарлан оруулна уу.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div>
                        <Label htmlFor="group-name">Бүлгийн нэр</Label>
                        <Input id="group-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Програмчлалын хэл" required />
                    </div>
                     <div className="space-y-2">
                        <Label>Icon</Label>
                         <IconPicker 
                            selectedIcon={icon} 
                            onIconSelect={setIcon}
                        >
                            <Button type="button" variant="outline" className="w-full justify-start gap-2">
                               {getIcon(icon)}
                               <span>{icon}</span>
                            </Button>
                        </IconPicker>
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
