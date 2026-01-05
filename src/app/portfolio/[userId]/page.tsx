'use client';

import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import Hero from '@/components/sections/hero';
import Projects from '@/components/sections/projects';
import Skills from '@/components/sections/skills';
import Experience from '@/components/sections/Experience';
import Education from '@/components/sections/Education';
import type { UserProfile } from '@/lib/types';
import { Suspense, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';

function PortfolioContent() {
    return (
        <div className="flex flex-col">
            <Hero />
            <Education />
            <Skills />
            <Projects />
            <Experience />
        </div>
    );
}

export default function PortfolioPage({ params }: { params: { userId: string } }) {
    const { userId } = params;
    const { firestore } = useFirebase();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserProfile = async () => {
            if (!firestore) {
                setLoading(false);
                return;
            }
            try {
                const userDocRef = doc(firestore, 'users', userId);
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    setUserProfile(docSnap.data() as UserProfile);
                } else {
                    notFound();
                }
            } catch (error) {
                console.error("Error fetching portfolio:", error);
                // Optionally handle error state
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            getUserProfile();
        } else {
            setLoading(false);
            notFound();
        }
    }, [userId, firestore]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    
    if (!userProfile) {
        return notFound();
    }

    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-10 w-10 animate-spin" /></div>}>
            <PortfolioContent />
        </Suspense>
    );
}
