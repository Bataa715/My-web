"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpenText, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react";


const mainLinks = [
  { href: "/", label: "Нүүр" },
  { href: "/about", label: "My CV" },
  { href: "/tools", label: "Tools" },
];

const toolsLinks = [
  { href: "/tools", label: "All Tools" },
  { href: "/tools/english", label: "Англи хэл" },
  { href: "/tools/japanese", label: "Япон хэл" },
  { href: "/tools/programming", label: "Программчлал" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLink = ({ href, label, className }: { href: string; label: string; className?: string; }) => (
    <Link
      href={href}
      onClick={() => setIsMobileMenuOpen(false)}
      className={cn(
        "transition-colors hover:text-primary",
        (pathname.startsWith(href) && href !== '/') || pathname === href ? "text-primary font-semibold" : "text-muted-foreground",
        className
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <BookOpenText className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">Kaizen</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {mainLinks.map((link) => (
               <NavLink key={link.href} {...link} />
            ))}
          </nav>
        </div>
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link
              href="/"
              className="flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BookOpenText className="mr-2 h-6 w-6 text-primary" />
              <span className="font-bold">Kaizen</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {mainLinks.map((link) => (
                  <NavLink key={link.href} {...link} className="text-lg" />
                ))}
                 <h3 className="pt-4 font-semibold text-lg">Tools</h3>
                {toolsLinks.slice(1).map((link) => (
                   <NavLink key={link.href} href={link.href} label={link.label} className="text-lg pl-2" />
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between md:justify-end">
           <Link href="/" className="flex items-center space-x-2 md:hidden">
              <BookOpenText className="h-6 w-6 text-primary" />
              <span className="font-bold">Kaizen</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
