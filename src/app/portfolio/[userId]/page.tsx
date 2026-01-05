
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getFirebaseAdmin } from '@/firebase/server';
import { notFound } from 'next/navigation';

import Hero from '@/components/sections/hero';
import Projects from '@/components/sections/projects';
import Skills from '@/components/sections/skills';
import Experience from '@/components/sections/Experience';
import Education from '@/components/sections/Education';
import AboutPage from '@/app/about/page';
import { motion } from 'framer-motion';
import { FirebaseProvider } from '@/firebase/provider';
import { UserProfile } from '@/lib/types';

async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { firestore } = getFirebaseAdmin();
    const userDocRef = doc(firestore, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}


export default async function PortfolioPage({ params }: { params: { userId: string } }) {
    const { userId } = params;
    const userProfile = await getUserProfile(userId);
    const { firebaseApp, auth, firestore } = getFirebaseAdmin();

    if (!userProfile) {
        notFound();
    }

    return (
        <FirebaseProvider firebaseApp={firebaseApp} auth={auth} firestore={firestore}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                <Hero />
                <Education />
                <Skills />
                <Projects />
                <Experience />
                <AboutPage />
            </motion.div>
        </FirebaseProvider>
    );
}

