"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import AddProject from "./sections/add-project";

interface AddProjectDialogProps {
    children: ReactNode;
}

export function AddProjectDialog({ children }: AddProjectDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Шинэ төсөл нэмэх</DialogTitle>
                </DialogHeader>
                <AddProject setDialogOpen={setOpen} />
            </DialogContent>
        </Dialog>
    );
}
