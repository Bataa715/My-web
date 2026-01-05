'use client';

import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import Hero from '@/components/sections/hero';
import type { UserProfile } from '@/lib/types';
import { Suspense, useEffect, useState, use } from 'react';
import { Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import InteractiveParticles from '@/components/shared/InteractiveParticles';

const Education = dynamic(() => import('@/components/sections/Education'), {
  loading: () => <Skeleton className="w-full h-96" />,
});
const Skills = dynamic(() => import('@/components/sections/skills'), {
  loading: () => <Skeleton className="w-full h-96" />,
});
const Projects = dynamic(() => import('@/components/sections/projects'), {
  loading: () => <Skeleton className="w-full h-96" />,
});
const Experience = dynamic(() => import('@/components/sections/Experience'), {
  loading: () => <Skeleton className="w-full h-96" />,
});

function PortfolioContent({ userId }: { userId: string }) {
  return (
    <div className="relative flex flex-col">
      <InteractiveParticles
        className="fixed inset-0 z-0 pointer-events-none"
        quantity={50}
      />
      <Hero portfolioUserId={userId} />
      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <Education />
      </Suspense>
      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <Skills />
      </Suspense>
      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <Projects />
      </Suspense>
      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <Experience />
      </Suspense>
    </div>
  );
}

export const runtime = 'nodejs';
export const dynamicParams = true;

export default function PortfolioPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
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
        console.error('Error fetching portfolio:', error);
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
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      }
    >
      <PortfolioContent userId={userId} />
    </Suspense>
  );
}
