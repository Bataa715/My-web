
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseAdmin } from '@/firebase/server';
import { notFound } from 'next/navigation';

import Hero from '@/components/sections/hero';
import Projects from '@/components/sections/projects';
import Skills from '@/components/sections/skills';
import Experience from '@/components/sections/Experience';
import Education from '@/components/sections/Education';
import AboutPage from '@/app/about/page';
import { FirebaseProvider } from '@/firebase/provider';
import type { UserProfile } from '@/lib/types';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

async function getUserProfile(userId: string): Promise<UserProfile | null> {
    // Use the Admin SDK on the server to bypass security rules for public read
    const { firestore: adminFirestore } = getFirebaseAdmin();
    const userDocRef = doc(adminFirestore, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}

function PortfolioContent() {
    return (
        <div className="flex flex-col">
            <Hero />
            <Education />
            <Skills />
            <Projects />
            <Experience />
            <AboutPage />
        </div>
    );
}

export default async function PortfolioPage({ params }: { params: { userId: string } }) {
    const { userId } = params;

    // Fetch the specific user's profile on the server
    const userProfile = await getUserProfile(userId);
    
    // If no profile is found for the given userId, show a 404 page.
    if (!userProfile) {
        notFound();
    }
    
    // Get the admin-initialized app for the provider
    const { firebaseApp, auth, firestore } = getFirebaseAdmin();

    return (
        // The provider now receives a server-side authenticated context
        // which allows child components (like Hero, Projects, etc.) to use
        // Firebase hooks as if a user is logged in, but in a read-only context for this public page.
         <FirebaseProvider firebaseApp={firebaseApp} auth={auth} firestore={firestore}>
            <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-10 w-10 animate-spin" /></div>}>
                <PortfolioContent />
            </Suspense>
        </FirebaseProvider>
    );
}