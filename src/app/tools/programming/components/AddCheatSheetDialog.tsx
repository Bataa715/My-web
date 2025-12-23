
"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { CheatSheetItem } from "@/lib/types";

interface AddCheatSheetDialogProps {
    children: ReactNode;
    onAddItem: (item: Omit<CheatSheetItem, 'id'>) => void;
}

export function AddCheatSheetDialog({ children, onAddItem }: AddCheatSheetDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [snippet, setSnippet] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && snippet) {
            onAddItem({ title, snippet });
            setOpen(false);
            setTitle('');
            setSnippet('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Шинэ код нэмэх</DialogTitle>
                    <DialogDescription>Хэрэгтэй кодны хэсгийн гарчиг болон кодоо оруулна уу.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="cs-title">Гарчиг</Label>
                        <Input id="cs-title" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="cs-snippet">Код</Label>
                        <Textarea id="cs-snippet" value={snippet} onChange={e => setSnippet(e.target.value)} required rows={6} className="font-mono"/>
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
