
"use client";

import { useState, type ReactNode, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { CheatSheetItem } from "@/lib/types";

interface EditCheatSheetDialogProps {
    children: ReactNode;
    item: CheatSheetItem;
    onUpdateItem: (id: string, item: Omit<CheatSheetItem, 'id'>) => void;
}

export function EditCheatSheetDialog({ children, item, onUpdateItem }: EditCheatSheetDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(item.title);
    const [snippet, setSnippet] = useState(item.snippet);

    useEffect(() => {
        if(open) {
            setTitle(item.title);
            setSnippet(item.snippet);
        }
    }, [open, item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && snippet) {
            onUpdateItem(item.id!, { title, snippet });
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>"{item.title}"-г засах</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="cs-title-edit">Гарчиг</Label>
                        <Input id="cs-title-edit" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="cs-snippet-edit">Код</Label>
                        <Textarea id="cs-snippet-edit" value={snippet} onChange={e => setSnippet(e.target.value)} required rows={6} className="font-mono"/>
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
