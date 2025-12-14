import Link from 'next/link';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { Button } from './ui/button';

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Б.Батмягмар. Бүх эрх хуулиар хамгаалагдсан.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://github.com/batmyagmar" target="_blank">
              <Github />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://linkedin.com/in/batmyagmar" target="_blank">
              <Linkedin />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://twitter.com/batmyagmar" target="_blank">
              <Twitter />
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
