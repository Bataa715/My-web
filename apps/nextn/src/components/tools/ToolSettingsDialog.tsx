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
import type { Tool } from './ToolCard';

export interface ToolSettings {
  [toolId: string]: { visible: boolean; order: number };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allTools: Tool[];
  toolSettings: ToolSettings;
  visibleCount: number;
  hiddenCount: number;
  onToggle: (toolId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

export default function ToolSettingsDialog({
  open,
  onOpenChange,
  allTools,
  toolSettings,
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
          aria-label="Хэрэгслүүдийн тохиргоо"
          className="rounded-full border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Хэрэгслүүдийн тохиргоо
          </DialogTitle>
          <DialogDescription>
            Харуулах болон нуух хэрэгслүүдийг сонгоно уу.
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
            {allTools.map(tool => (
              <div
                key={tool.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  toolSettings[tool.id]?.visible !== false
                    ? 'bg-card border-primary/20'
                    : 'bg-muted/50 border-muted opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-linear-to-br ${tool.gradient} text-white`}
                  >
                    {tool.icon}
                  </div>
                  <div>
                    <p className="font-medium">{tool.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={toolSettings[tool.id]?.visible !== false}
                  onCheckedChange={() => onToggle(tool.id)}
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
