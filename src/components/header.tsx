'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from './ui/sheet';
import { Menu, PencilRuler, Eye, LockKeyhole } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useEditMode } from '@/contexts/EditModeContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import AddProject from './sections/add-project';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { AddProjectDialog } from './AddProjectDialog';

const navLinks = [
  { href: "#home", label: "Нүүр" },
  { href: "#projects", label: "Төслүүд" },
  { href: "#skills", label: "Ур чадвар" },
];

const CORRECT_PASSWORD = "Bataa2480";

const Header = () => {
    const { isEditMode, setIsEditMode } = useEditMode();
    const [isOpen, setIsOpen] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const { toast } = useToast();
  
    const handleEditClick = () => {
      if (isEditMode) {
        setIsEditMode(false);
      } else {
        setIsPasswordDialogOpen(true);
      }
    };
  
    const handlePasswordSubmit = () => {
      if (password === CORRECT_PASSWORD) {
        setIsEditMode(true);
        setIsPasswordDialogOpen(false);
        setPassword("");
        setPasswordError("");
        toast({
          title: "Амжилттай",
          description: "Засварлах горимд шилжлээ.",
        });
      } else {
        setPasswordError("Нууц үг буруу байна.");
      }
    };
    

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                <span className="hidden font-bold sm:inline-block font-headline">
                Б.Батмягмар
                </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
                {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                    {link.label}
                </Link>
                ))}
                <AddProjectDialog>
                    <Button variant="ghost" className="transition-colors hover:text-foreground/80 text-foreground/60 px-0">Төсөл нэмэх</Button>
                </AddProjectDialog>
            </nav>
        </div>
        <div className="flex-1 md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <SheetHeader>
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
              <Link href="/" className="mr-6 flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                <span className="font-bold font-headline">Б.Батмягмар</span>
              </Link>
              <nav className="flex flex-col space-y-4 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                 <AddProjectDialog>
                    <Button variant="link" className="text-sm font-medium transition-colors hover:text-primary justify-start p-0">Төсөл нэмэх</Button>
                </AddProjectDialog>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
            <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    setPassword("");
                    setPasswordError("");
                }
                setIsPasswordDialogOpen(open);
            }}>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleEditClick}
                    className={cn(
                    "transition-all",
                    isEditMode && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                >
                    {isEditMode ? (
                    <Eye className="h-4 w-4" />
                    ) : (
                    <PencilRuler className="h-4 w-4" />
                    )}
                    <span className="sr-only">{isEditMode ? "Харах" : "Засварлах"}</span>
                </Button>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Засварлах горим</DialogTitle>
                    <DialogDescription>
                    Үргэлжлүүлэхийн тулд нууц үгээ оруулна уу.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                        Нууц үг
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="col-span-3"
                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    />
                    </div>
                    {passwordError && (
                        <p className="col-span-4 text-center text-sm text-destructive">{passwordError}</p>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Цуцлах</Button>
                    </DialogClose>
                    <Button type="button" onClick={handlePasswordSubmit}>
                    <LockKeyhole className="mr-2 h-4 w-4" /> Нэвтрэх
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
