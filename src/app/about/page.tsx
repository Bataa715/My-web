import BackButton from '@/components/shared/BackButton';
import Hero from '@/components/sections/hero';
import Projects from '@/components/sections/projects';
import Skills from '@/components/sections/skills';

export default function AboutPage() {
  return (
    <>
      <BackButton />
      <Hero />
      <Projects />
      <Skills />
    </>
  );
}
