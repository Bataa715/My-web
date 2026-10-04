'use client';

import Link from 'next/link';
import { Github, Instagram, Facebook } from 'lucide-react';
import { useSupabase } from '@/supabase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from '@/supabase/db';
import type { UserProfile } from '@/lib/types';

const Footer = () => {
  const { firestore, user, isUserLoading } = useSupabase();
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
    <footer className="relative border-t border-[#111] bg-[#f3f1ee] text-[#111]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2.5 sm:px-8">
        <Link href="/" className="brand-mark text-xs">
          進撃の巨人
        </Link>
        {socials.length > 0 && (
          <div className="flex items-center gap-2">
            {socials.map(social => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-7 w-7 items-center justify-center border border-[#111]/25"
              >
                <social.icon className="h-3 w-3" aria-hidden />
              </Link>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
