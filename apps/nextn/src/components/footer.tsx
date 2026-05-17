'use client';

import Link from 'next/link';
import { Github, Instagram, Facebook } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

const navLinks = [
  { label: 'Нүүр', href: '/' },
  { label: 'Миний тухай', href: '/about' },
  { label: 'Хэрэгслүүд', href: '/tools' },
];

const Footer = () => {
  const { firestore, user, isUserLoading } = useFirebase();
  const [links, setLinks] = useState({ github: '', instagram: '', facebook: '' });

  useEffect(() => {
    if (isUserLoading || !user || !firestore) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    getDoc(userDocRef)
      .then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setLinks({
            github: data.github || '',
            instagram: data.instagram || '',
            facebook: data.facebook || '',
          });
        }
      })
      .catch(() => {});
  }, [user, firestore, isUserLoading]);

  const socials = [
    { href: links.github, label: 'GitHub', icon: Github },
    { href: links.instagram, label: 'Instagram', icon: Instagram },
    { href: links.facebook, label: 'Facebook', icon: Facebook },
  ].filter(s => s.href);

  return (
    <footer className="relative mt-12">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 h-20 bg-linear-to-b from-transparent via-primary/4 to-primary/8"
      />
      {/* Top glowing line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
      />

      <div className="container mx-auto px-4 sm:px-6">
        {/* Main content */}
        <div className="flex flex-col items-center gap-4 py-5">

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
            {navLinks.map((link, i) => (
              <span key={link.href} className="flex items-center">
                <Link
                  href={link.href}
                  className="relative px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                >
                  <span className="relative z-10">{link.label}</span>
                  <span className="absolute inset-0 rounded-md bg-primary/0 group-hover:bg-primary/6 transition-colors duration-200" />
                </Link>
                {i < navLinks.length - 1 && (
                  <span className="h-3 w-px bg-border/60" aria-hidden />
                )}
              </span>
            ))}
          </nav>

          {/* Social icons */}
          {socials.length > 0 && (
            <div className="flex items-center gap-3">
              {socials.map(social => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="group relative flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:scale-110 hover:shadow-lg hover:shadow-primary/15"
                >
                  <social.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" aria-hidden />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
