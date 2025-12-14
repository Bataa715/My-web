'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useEditMode } from '@/contexts/EditModeContext';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

const Header = () => {
    const { isEditMode, setIsEditMode } = useEditMode();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-bold font-headline">
            Б.Батмягмар
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#projects" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Төслүүд
          </Link>
          <Link href="#skills" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Ур чадвар
          </Link>
        </nav>

        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="edit-mode" checked={isEditMode} onCheckedChange={setIsEditMode} />
            <Label htmlFor="edit-mode">Засварлах</Label>
          </div>
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4">
                <Link href="#projects" className="text-lg font-medium">
                  Төслүүд
                </Link>
                <Link href="#skills" className="text-lg font-medium">
                  Ур чадвар
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
