'use client';

import Link from 'next/link';
import { Github, Instagram, Facebook, Heart, ArrowUpRight } from 'lucide-react';
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
  const { firestore, user } = useFirebase();
  const [appName, setAppName] = useState('PersonalWeb');
  const [links, setLinks] = useState({ github: '', instagram: '', facebook: '' });

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setAppName(data.name || 'PersonalWeb');
          setLinks({
            github: data.github || '',
            instagram: data.instagram || '',
            facebook: data.facebook || '',
          });
        }
      });
    }
  }, [user, firestore]);

  const year = new Date().getFullYear();
  const socials = [
    { href: links.github, label: 'GitHub', icon: Github },
    { href: links.instagram, label: 'Instagram', icon: Instagram },
    { href: links.facebook, label: 'Facebook', icon: Facebook },
  ].filter(s => s.href);

  return (
    <footer className="relative mt-20 border-t border-border/40">
      {/* Ambient glow above the border */}
      <div className="absolute inset-x-0 -top-24 h-32 bg-linear-to-b from-transparent to-primary/5 pointer-events-none" aria-hidden />
      {/* Glowing border line */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" aria-hidden />

      <div className="container mx-auto px-4 sm:px-6">
        {/* Main columns */}
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold gradient-text">{appName}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
              Хувийн portfolio — миний ажлын туршлага, төслүүд болон тэмдэглэлүүд.
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
              Made with{' '}
              <Heart className="h-3 w-3 text-rose-500 fill-rose-500 animate-pulse-slow" aria-hidden="true" />{' '}
              in Mongolia
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/50">
              Навигаци
            </p>
            <ul className="space-y-2">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social links */}
          {socials.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/50">
                Холбоо барих
              </p>
              <div className="flex flex-col gap-2">
                {socials.map(social => (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    <span className="flex items-center justify-center h-7 w-7 rounded-lg border border-border/60 bg-card/50 group-hover:border-primary/40 group-hover:bg-primary/8 transition-all duration-200">
                      <social.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {social.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="py-4 border-t border-border/30 flex items-center justify-center">
          <p className="text-xs text-muted-foreground/40">
            © {year} {appName}. Бүх эрх хуулиар хамгаалагдсан.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
