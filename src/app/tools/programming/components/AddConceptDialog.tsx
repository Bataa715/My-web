
"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ProgrammingConcept } from "@/lib/types";

interface AddConceptDialogProps {
    children: ReactNode;
    onAddConcept: (concept: Omit<ProgrammingConcept, 'id'>) => void;
}

export function AddConceptDialog({ children, onAddConcept }: AddConceptDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [emoji, setEmoji] = useState('');
    const [explanation, setExplanation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && emoji && explanation) {
            onAddConcept({ title, emoji, explanation });
            setOpen(false);
            setTitle('');
            setEmoji('');
            setExplanation('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Шинэ ойлголт нэмэх</DialogTitle>
                    <DialogDescription>Ойлголтын гарчиг, emoji, богино тайлбарыг оруулна уу.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="concept-title">Гарчиг</Label>
                        <Input id="concept-title" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="concept-emoji">Emoji</Label>
                        <Input id="concept-emoji" value={emoji} onChange={e => setEmoji(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="concept-explanation">Тайлбар</Label>
                        <Textarea id="concept-explanation" value={explanation} onChange={e => setExplanation(e.target.value)} required />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Цуцлах</Button></DialogClose>
                        <Button type="submit">Нэмэх</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
