import Link from 'next/link';
import { Github, Instagram } from 'lucide-react';
import { Button } from './ui/button';
import { personalInfo } from '@/lib/data';

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {personalInfo.name}. Бүх эрх хуулиар хамгаалагдсан.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={personalInfo.github} target="_blank">
              <Github />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={personalInfo.instagram} target="_blank">
              <Instagram />
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
