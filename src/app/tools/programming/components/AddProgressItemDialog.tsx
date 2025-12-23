
"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProgressItem } from "@/lib/types";

interface AddProgressItemDialogProps {
    children: ReactNode;
    onAddItem: (item: Omit<ProgressItem, 'id' | 'learned' | 'practicing'>) => void;
}

export function AddProgressItemDialog({ children, onAddItem }: AddProgressItemDialogProps) {
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (label) {
            onAddItem({ label });
            setOpen(false);
            setLabel('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Шинэ ахиц нэмэх</DialogTitle>
                    <DialogDescription>Суралцах сэдвийнхээ нэрийг оруулна уу.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="pi-label">Сэдвийн нэр</Label>
                        <Input id="pi-label" value={label} onChange={e => setLabel(e.target.value)} required />
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
