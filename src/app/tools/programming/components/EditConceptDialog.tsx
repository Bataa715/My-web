
"use client";

import { useState, type ReactNode, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ProgrammingConcept } from "@/lib/types";

interface EditConceptDialogProps {
    children: ReactNode;
    concept: ProgrammingConcept;
    onUpdateConcept: (id: string, concept: Omit<ProgrammingConcept, 'id'>) => void;
}

export function EditConceptDialog({ children, concept, onUpdateConcept }: EditConceptDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(concept.title);
    const [emoji, setEmoji] = useState(concept.emoji);
    const [explanation, setExplanation] = useState(concept.explanation);

    useEffect(() => {
        if (open) {
            setTitle(concept.title);
            setEmoji(concept.emoji);
            setExplanation(concept.explanation);
        }
    }, [open, concept]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && emoji && explanation) {
            onUpdateConcept(concept.id!, { title, emoji, explanation });
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>"{concept.title}"-г засах</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="concept-title-edit">Гарчиг</Label>
                        <Input id="concept-title-edit" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="concept-emoji-edit">Emoji</Label>
                        <Input id="concept-emoji-edit" value={emoji} onChange={e => setEmoji(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="concept-explanation-edit">Тайлбар</Label>
                        <Textarea id="concept-explanation-edit" value={explanation} onChange={e => setExplanation(e.target.value)} required />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Цуцлах</Button></DialogClose>
                        <Button type="submit">Хадгалах</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
