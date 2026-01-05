'use client';

import { useState, type ReactNode, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useSkills } from '@/contexts/SkillsContext';
import IconPicker from './shared/IconPicker';
import * as LucideIcons from 'lucide-react';
import { generateSkills } from '@/ai/flows/generate-skills-flow';
import { Loader2, Wand2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AddSkillDialogProps {
  children: ReactNode;
}

export function AddSkillDialog({ children }: AddSkillDialogProps) {
  const { addSkillGroup } = useSkills();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Code');
  const [items, setItems] = useState<string[]>([]);

  // AI Search State
  const [aiSearchTerm, setAiSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [generatedSkills, setGeneratedSkills] = useState<string[]>([]);

  const handleAiSearch = async () => {
    if (!aiSearchTerm.trim()) return;
    setIsSearching(true);
    setGeneratedSkills([]);
    try {
      const result = await generateSkills({ category: aiSearchTerm });
      setGeneratedSkills(result.skills);
    } catch (error) {
      console.error('AI Skill generation failed:', error);
      toast({
        title: 'AI хайлт амжилтгүй боллоо',
        description: 'Дахин оролдоно уу.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setItems(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const skillItems = items.filter(skill => skill.length > 0);

    if (name && icon && skillItems.length > 0) {
      addSkillGroup({ name, icon, items: skillItems });
      setOpen(false);
      // Reset state
      setName('');
      setIcon('Code');
      setItems([]);
      setAiSearchTerm('');
      setGeneratedSkills([]);
    }
  };

  const getIcon = (iconName: string) => {
    const LucideIcon = (LucideIcons as any)[iconName];
    return LucideIcon ? <LucideIcon className="h-5 w-5" /> : null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Шинэ ур чадварын бүлэг нэмэх</DialogTitle>
          <DialogDescription>
            Бүлгийн нэр, icon-г сонгоод AI ашиглан эсвэл гараар ур чадваруудаа
            нэмнэ үү.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="group-name">Бүлгийн нэр</Label>
              <Input
                id="group-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Програмчлалын хэл"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <IconPicker selectedIcon={icon} onIconSelect={setIcon}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  {getIcon(icon)}
                  <span>{icon}</span>
                </Button>
              </IconPicker>
            </div>
          </div>

          {/* AI Skill Generator */}
          <div className="space-y-2 rounded-lg border p-4">
            <Label
              htmlFor="ai-search"
              className="flex items-center gap-2 font-semibold"
            >
              <Wand2 className="h-5 w-5 text-primary" />
              AI-аар ур чадвар хайх
            </Label>
            <div className="flex gap-2">
              <Input
                id="ai-search"
                placeholder="Жишээ: 'frontend frameworks', 'devops tools'..."
                value={aiSearchTerm}
                onChange={e => setAiSearchTerm(e.target.value)}
                onKeyDown={e =>
                  e.key === 'Enter' && (e.preventDefault(), handleAiSearch())
                }
              />
              <Button
                type="button"
                onClick={handleAiSearch}
                disabled={isSearching}
              >
                {isSearching ? <Loader2 className="animate-spin" /> : 'Хайх'}
              </Button>
            </div>
            {(isSearching || generatedSkills.length > 0) && (
              <div className="pt-2">
                {isSearching && (
                  <div className="text-sm text-muted-foreground flex items-center justify-center p-4">
                    <Loader2 className="animate-spin mr-2" /> Ур чадвар хайж
                    байна...
                  </div>
                )}
                {generatedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {generatedSkills.map(skill => (
                      <Badge
                        key={skill}
                        variant={
                          items.includes(skill) ? 'default' : 'secondary'
                        }
                        onClick={() => toggleSkill(skill)}
                        className="cursor-pointer transition-all"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Skills Input */}
          <div>
            <Label htmlFor="group-items">
              Ур чадварууд (таслалаар тусгаарлана)
            </Label>
            <Input
              id="group-items"
              value={items.join(', ')}
              onChange={e =>
                setItems(e.target.value.split(',').map(s => s.trim()))
              }
              placeholder="JavaScript, TypeScript, Python"
              required
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Цуцлах
              </Button>
            </DialogClose>
            <Button type="submit">Нэмэх</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
