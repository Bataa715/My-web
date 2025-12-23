
"use client";

import { useState, type ReactNode, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProgressItem } from "@/lib/types";

interface EditProgressItemDialogProps {
    children: ReactNode;
    item: ProgressItem;
    onUpdateItem: (id: string, item: Omit<ProgressItem, 'id' | 'learned' | 'practicing'>) => void;
}

export function EditProgressItemDialog({ children, item, onUpdateItem }: EditProgressItemDialogProps) {
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState(item.label);

    useEffect(() => {
        if(open) {
            setLabel(item.label);
        }
    }, [open, item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (label) {
            onUpdateItem(item.id!, { label });
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>"{item.label}"-г засах</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="pi-label-edit">Сэдвийн нэр</Label>
                        <Input id="pi-label-edit" value={label} onChange={e => setLabel(e.target.value)} required />
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
