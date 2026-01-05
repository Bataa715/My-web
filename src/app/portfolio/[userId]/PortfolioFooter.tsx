
'use client';

import Link from 'next/link';
import { Github, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

const PortfolioFooter = () => {
    const { firestore, user } = useFirebase();
    const [links, setLinks] = useState({ github: '', instagram: '', facebook: '' });

    useEffect(() => {
        if (user && firestore) {
            const userDocRef = doc(firestore, 'users', user.uid);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists()) {
                    const data = docSnap.data() as UserProfile;
                    setLinks({
                        github: data.github || '',
                        instagram: data.instagram || '',
                        facebook: data.facebook || ''
                    });
                }
            });
        }
    }, [user, firestore]);


  return (
    <footer className="border-t">
      <div className="container flex items-center justify-end gap-4 py-6">
        <div className="flex items-center gap-2">
         {links.github && (
            <Button variant="ghost" size="icon" asChild>
                <Link href={links.github} target="_blank">
                <Github />
                </Link>
            </Button>
          )}
          {links.instagram && (
            <Button variant="ghost" size="icon" asChild>
                <Link href={links.instagram} target="_blank">
                <Instagram />
                </Link>
            </Button>
          )}
          {links.facebook && (
            <Button variant="ghost" size="icon" asChild>
                <Link href={links.facebook} target="_blank">
                <Facebook />
                </Link>
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default PortfolioFooter;
