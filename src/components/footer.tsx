import Link from 'next/link';
import { Github, Instagram } from 'lucide-react';
import { Button } from './ui/button';
import { personalInfo } from '@/lib/data';

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container flex items-center justify-end gap-4 py-6">
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
