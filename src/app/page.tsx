'use client';

import dynamic from 'next/dynamic';
import Hero from '@/components/sections/hero';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
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

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative"
    >
      <InteractiveParticles quantity={50} />
      <Hero />
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
    </motion.div>
  );
}
