'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Eye, EyeOff } from 'lucide-react';

export interface SectionMeta {
  id: string;
  title: string;
  icon: React.ReactNode;
  gradient: string;
}

export interface SectionSettings {
  [sectionId: string]: { visible: boolean; order: number };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allSections: SectionMeta[];
  sectionSettings: SectionSettings;
  visibleCount: number;
  hiddenCount: number;
  onToggle: (sectionId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

export default function SectionSettingsDialog({
  open,
  onOpenChange,
  allSections,
  sectionSettings,
  visibleCount,
  hiddenCount,
  onToggle,
  onShowAll,
  onHideAll,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Хэсгүүдийн тохиргоо"
          className="fixed bottom-6 right-6 z-50 rounded-full h-12 w-12 shadow-lg border-primary/30 hover:border-primary hover:bg-primary/10 bg-background/80 backdrop-blur-xs"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Хэсгүүдийн тохиргоо
          </DialogTitle>
          <DialogDescription>
            Нүүр хуудсанд харуулах хэсгүүдийг сонгоно уу.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={onShowAll} className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Бүгдийг харуулах
          </Button>
          <Button variant="outline" size="sm" onClick={onHideAll} className="flex-1">
            <EyeOff className="h-4 w-4 mr-2" />
            Бүгдийг нуух
          </Button>
        </div>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {allSections.map(section => (
              <div
                key={section.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  sectionSettings[section.id]?.visible !== false
                    ? 'bg-card border-primary/20'
                    : 'bg-muted/50 border-muted opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-linear-to-br ${section.gradient} text-white`}
                  >
                    {section.icon}
                  </div>
                  <p className="font-medium">{section.title}</p>
                </div>
                <Switch
                  checked={sectionSettings[section.id]?.visible !== false}
                  onCheckedChange={() => onToggle(section.id)}
                />
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="text-sm text-muted-foreground text-center pt-2">
          {visibleCount} харагдаж байна • {hiddenCount} нуугдсан
        </div>
      </DialogContent>
    </Dialog>
  );
}
