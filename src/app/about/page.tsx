import Hero from '@/components/sections/hero';
import Projects from '@/components/sections/projects';
import Skills from '@/components/sections/skills';
import Footer from '@/components/footer';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <Hero />
        <Projects />
        <Skills />
      </main>
      <Footer />
    </div>
  );
}
