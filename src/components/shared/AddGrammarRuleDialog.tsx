"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { GrammarRule } from "@/lib/types";

interface AddGrammarRuleDialogProps {
    children: ReactNode;
    onAddRule: (newRule: Omit<GrammarRule, 'id' | 'createdAt'>) => Promise<void>;
    ruleType: 'english' | 'japanese'; // To know which collection to add to
}

export function AddGrammarRuleDialog({ children, onAddRule }: AddGrammarRuleDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [explanation, setExplanation] = useState('');
    const [examples, setExamples] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const exampleArray = examples.split(',').map(ex => ex.trim()).filter(Boolean);

        if (title && explanation) {
            await onAddRule({ title, explanation, examples: exampleArray });
            setOpen(false);
            setTitle('');
            setExplanation('');
            setExamples('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Шинэ дүрэм нэмэх</DialogTitle>
                    <DialogDescription>
                        Дүрмийн гарчиг, тайлбарыг Markdown ашиглан, жишээ өгүүлбэрүүдийг таслалаар тусгаарлан оруулна уу.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div>
                        <Label htmlFor="rule-title">Гарчиг</Label>
                        <Input id="rule-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Present Simple" required />
                    </div>
                     <div>
                        <Label htmlFor="rule-explanation">Тайлбар (Markdown дэмжинэ)</Label>
                        <Textarea 
                            id="rule-explanation" 
                            value={explanation} 
                            onChange={(e) => setExplanation(e.target.value)} 
                            placeholder="Энгийн одоо цагийн дэлгэрэнгүй тайлбар..." 
                            required 
                            rows={10}
                        />
                    </div>
                     <div>
                        <Label htmlFor="rule-examples">Жишээ (таслалаар тусгаарлана)</Label>
                        <Textarea 
                            id="rule-examples" 
                            value={examples} 
                            onChange={(e) => setExamples(e.target.value)} 
                            placeholder="I play football, She reads a book"
                            rows={5}
                        />
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
