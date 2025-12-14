import Link from 'next/link';
import { Github, Instagram, Facebook } from 'lucide-react';
import { Button } from './ui/button';

const personalInfo = {
  github: "https://github.com/Bataa715",
  instagram: "https://www.instagram.com/ka1__zen/",
  facebook: "https://www.facebook.com/profile.php?id=100010513223018",
};

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
          <Button variant="ghost" size="icon" asChild>
            <Link href={personalInfo.facebook} target="_blank">
              <Facebook />
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
