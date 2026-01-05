'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PortfolioHeader = () => {
  const pathname = usePathname();
  const params = useParams();
  const userId = params.userId as string;

  const navLinks = [
    { href: `/portfolio/${userId}`, label: 'Маргэжлийн Профайл' },
    { href: `/portfolio/${userId}/about`, label: 'Хувийн Амьдрал' },
    { href: `/portfolio/${userId}/contact`, label: 'Холбоо Барих' },
  ];

  return (
    <header className="sticky top-0 left-0 w-full z-50">
      <div className="relative">
        <div className="mx-3 md:mx-4 mt-3 md:mt-4 flex items-center justify-between gap-6 p-3 px-6 bg-background/80 backdrop-blur-xl rounded-full border border-primary/20 shadow-lg shadow-primary/5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
              Batmyagmar
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-full transition-all duration-300',
                  pathname === link.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Language Button */}
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-primary/30 bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <Globe className="h-4 w-4 mr-2" />
            Монгол
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PortfolioHeader;
