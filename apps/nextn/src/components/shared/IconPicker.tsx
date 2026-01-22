'use client';

import { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { iconList } from '@/lib/lucide-icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface IconPickerProps {
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
  children: React.ReactNode;
}

const IconPicker = ({
  selectedIcon,
  onIconSelect,
  children,
}: IconPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    return iconList.filter(name =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleIconClick = (iconName: string) => {
    onIconSelect(iconName);
    setOpen(false);
  };

  const getIcon = (iconName: string, props = {}) => {
    const LucideIcon = (LucideIcons as any)[iconName];
    return LucideIcon ? <LucideIcon {...props} /> : null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Icon сонгох</DialogTitle>
        </DialogHeader>
        <div className="p-1">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Icon хайх..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea className="h-72">
            <div className="grid grid-cols-8 gap-4 pr-4">
              {filteredIcons.map(iconName => (
                <Button
                  key={iconName}
                  variant={selectedIcon === iconName ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => handleIconClick(iconName)}
                  className="h-12 w-12 flex-col gap-1.5"
                >
                  {getIcon(iconName, { className: 'h-5 w-5' })}
                </Button>
              ))}
            </div>
            {filteredIcons.length === 0 && (
              <div className="text-center text-muted-foreground py-10">
                "{search}"-д тохирох icon олдсонгүй.
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IconPicker;
