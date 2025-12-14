"use client";

import { useState, type ReactNode, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useSkills } from "@/contexts/SkillsContext";
import type { Skill } from "@/lib/types";

interface EditSkillDialogProps {
    children: ReactNode;
    skillGroup: Skill;
}

export function EditSkillDialog({ children, skillGroup }: EditSkillDialogProps) {
    const { updateSkillGroup } = useSkills();
    const [open, setOpen] = useState(false);
    const [skills, setSkills] = useState(skillGroup.skills.join(', '));

    useEffect(() => {
        setSkills(skillGroup.skills.join(', '));
    }, [skillGroup]);
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const updatedSkills = skills.split(",").map(skill => skill.trim());

        if (updatedSkills.length > 0) {
            updateSkillGroup(skillGroup.id, { skills: updatedSkills });
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>"{skillGroup.category}" бүлэгт ур чадвар нэмэх</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div>
                        <Label htmlFor="skills">Ур чадварууд (таслалаар тусгаарлана)</Label>
                        <Input 
                            id="skills" 
                            name="skills" 
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="JavaScript, TypeScript, Python" required 
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Цуцлах</Button>
                        </DialogClose>
                        <Button type="submit">Хадгалах</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
