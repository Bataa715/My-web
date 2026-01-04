
'use client';

import Hero from '@/components/sections/hero';
import Projects from '@/components/sections/projects';
import Skills from '@/components/sections/skills';
import Experience from '@/components/sections/Experience';
import Education from '@/components/sections/Education';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Experience />
      <Education />
      <Projects />
      <Skills />
    </>
  );
}
