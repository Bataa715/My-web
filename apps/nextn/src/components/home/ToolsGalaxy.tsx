'use client';

/**
 * ToolsGalaxy — interactive showcase: a mini solar system where every planet
 * is a tool category. Planets orbit on a compressed ellipse (fake 3D depth),
 * glow-pulse on hover, and open a glassmorphism info panel on click.
 */
import { useEffect, useState, type FC } from 'react';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
} from 'framer-motion';
import {
  BookOpen,
  Languages,
  ListTodo,
  Dumbbell,
  Code2,
  Timer,
  Bot,
  Wallet,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToolPlanet {
  id: string;
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
  from: string;
  to: string;
  glow: string;
}

const TOOL_PLANETS: ToolPlanet[] = [
  {
    id: 'english',
    title: 'Англи хэл',
    desc: 'Дүрэм, үгийн сан, flashcard тоглоом, unregular үйл үг — англи хэлээ өдөр бүр ахиулах бүрэн хэрэгсэл.',
    href: '/tools/english',
    icon: <BookOpen className="h-5 w-5" />,
    from: 'hsl(217 91% 65%)',
    to: 'hsl(220 82% 35%)',
    glow: 'hsl(217 91% 60% / 0.75)',
  },
  {
    id: 'japanese',
    title: 'Япон хэл',
    desc: 'Кана, ханз, дүрэм, үгийн сан — япон хэлний бүх түвшний сургалтын материал нэг дор.',
    href: '/tools/japanese',
    icon: <Languages className="h-5 w-5" />,
    from: 'hsl(0 84% 65%)',
    to: 'hsl(5 80% 36%)',
    glow: 'hsl(0 84% 60% / 0.75)',
  },
  {
    id: 'programming',
    title: 'Програмчлал',
    desc: 'Хэл бүрийн сургалт, дадлага, кодын жишээнүүд — програмчлалын мэдлэгээ системтэй хөгжүүл.',
    href: '/tools/programming',
    icon: <Code2 className="h-5 w-5" />,
    from: 'hsl(271 81% 62%)',
    to: 'hsl(265 72% 36%)',
    glow: 'hsl(271 81% 56% / 0.75)',
  },
  {
    id: 'ai-chat',
    title: 'AI Туслах',
    desc: 'Асуулт асууж, дадлага хийж, санаа олж авах ухаалаг AI туслах.',
    href: '/tools/ai-chat',
    icon: <Bot className="h-5 w-5" />,
    from: 'hsl(189 94% 55%)',
    to: 'hsl(199 80% 30%)',
    glow: 'hsl(189 94% 43% / 0.75)',
  },
  {
    id: 'todo',
    title: 'Todo List',
    desc: 'Өдөр тутмын ажлаа төлөвлөж, гүйцэтгэлээ хянах энгийн бөгөөд хүчирхэг жагсаалт.',
    href: '/tools/todo',
    icon: <ListTodo className="h-5 w-5" />,
    from: 'hsl(142 72% 50%)',
    to: 'hsl(148 68% 26%)',
    glow: 'hsl(142 76% 40% / 0.75)',
  },
  {
    id: 'fitness',
    title: 'Fitness Tracker',
    desc: 'Дасгал хөдөлгөөн, биеийн үзүүлэлтээ бүртгэж ахиц дэвшлээ харах.',
    href: '/tools/fitness',
    icon: <Dumbbell className="h-5 w-5" />,
    from: 'hsl(25 95% 55%)',
    to: 'hsl(15 90% 34%)',
    glow: 'hsl(25 95% 53% / 0.75)',
  },
  {
    id: 'pomodoro',
    title: 'Pomodoro Timer',
    desc: 'Төвлөрлөө хамгаалж, завсарлагаа мартахгүй байх цагийн менежментийн арга.',
    href: '/tools/pomodoro',
    icon: <Timer className="h-5 w-5" />,
    from: 'hsl(45 93% 58%)',
    to: 'hsl(38 88% 32%)',
    glow: 'hsl(45 93% 47% / 0.75)',
  },
  {
    id: 'finance',
    title: 'Санхүүгийн Бүртгэл',
    desc: 'Орлого зарлагаа бүртгэж, мөнгөн урсгалаа нэг дороос хянах.',
    href: '/tools/finance',
    icon: <Wallet className="h-5 w-5" />,
    from: 'hsl(330 81% 62%)',
    to: 'hsl(330 74% 36%)',
    glow: 'hsl(330 81% 60% / 0.75)',
  },
];

/* One orbiting planet. Same compressed-ellipse math as the hero orbit:
 * x = cos·R, y = sin·R·0.36, scale/z sorted by sin → believable 3D. */
const GalaxyPlanet: FC<{
  planet: ToolPlanet;
  index: number;
  total: number;
  selected: boolean;
  paused: boolean;
  onSelect: () => void;
}> = ({ planet, index, total, selected, paused, onSelect }) => {
  const reduce = useReducedMotion();
  const [radius, setRadius] = useState(150);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setRadius(w >= 1024 ? 250 : w >= 640 ? 190 : 128);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const SPEED_MS = 64000;
  const initialAngle = (index / Math.max(total, 1)) * 2 * Math.PI;
  const x = useMotionValue(Math.cos(initialAngle) * radius);
  const y = useMotionValue(Math.sin(initialAngle) * radius * 0.36);
  const scale = useMotionValue(1);
  const zIndex = useMotionValue(30);

  useAnimationFrame(t => {
    const a = reduce || paused ? initialAngle : initialAngle + (t / SPEED_MS) * 2 * Math.PI;
    const sinA = Math.sin(a);
    x.set(Math.cos(a) * radius);
    y.set(sinA * radius * 0.36);
    scale.set(0.8 + 0.3 * ((sinA + 1) / 2));
    zIndex.set(sinA >= 0 ? 30 : 5);
  });

  return (
    <motion.div
      className="absolute pointer-events-auto"
      style={{
        top: '50%',
        left: '50%',
        width: 52,
        height: 52,
        x,
        y,
        scale,
        zIndex,
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.07 }}
    >
      <div className="relative group h-full w-full">
        {/* Hover / selected glow halo */}
        <div
          className={cn(
            'absolute -inset-3 rounded-full transition-opacity duration-300',
            selected ? 'opacity-100 animate-pulse-glow' : 'opacity-0 group-hover:opacity-100'
          )}
          style={{
            background: `radial-gradient(circle, ${planet.glow} 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }}
        />
        {/* Attention ring around the selected planet */}
        {selected && (
          <div
            className="absolute -inset-2 rounded-full animate-[spin_5s_linear_infinite]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg 264deg, ${planet.glow} 264deg 360deg)`,
              filter: 'blur(1.5px)',
            }}
          />
        )}
        <button
          onClick={onSelect}
          aria-label={planet.title}
          className="relative h-full w-full rounded-full overflow-hidden border-2 transition-transform duration-300 group-hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{
            background: `radial-gradient(circle at 34% 28%, hsl(0 0% 100% / 0.4) 0%, ${planet.from} 40%, ${planet.to} 78%, hsl(240 60% 4% / 0.5) 100%)`,
            borderColor: selected ? planet.from : 'hsl(0 0% 100% / 0.16)',
            boxShadow: selected
              ? `0 0 26px ${planet.glow}, inset 0 1px 0 hsl(0 0% 100% / 0.3)`
              : `0 0 12px ${planet.glow.replace('0.75', '0.35')}, inset 0 1px 0 hsl(0 0% 100% / 0.16)`,
          }}
        >
          {/* Specular highlight — sells the sphere */}
          <span
            className="absolute rounded-full bg-white/40 blur-[2px]"
            style={{ top: '10%', left: '18%', width: '30%', height: '20%' }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
            {planet.icon}
          </span>
        </button>
        {/* Name label */}
        <div
          className={cn(
            'absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold tracking-wide pointer-events-none transition-opacity duration-200',
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
          style={{ color: planet.from, textShadow: `0 0 10px ${planet.glow}` }}
        >
          {planet.title}
        </div>
      </div>
    </motion.div>
  );
};

export default function ToolsGalaxy() {
  const [selected, setSelected] = useState<ToolPlanet | null>(null);
  const reduce = useReducedMotion();

  return (
    <section className="container mx-auto px-4 py-10 md:py-16">
      {/* Heading */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-6"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/8 text-accent text-[11px] font-mono uppercase tracking-[0.2em] mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          Хэрэгслийн галактик
        </span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight glow-text">
          Гараг бүр — нэг хэрэгсэл
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Гарагууд дээр дарж хэрэгслүүдтэй танилцаарай.
        </p>
      </motion.div>

      {/* Orbital system */}
      <div className="relative mx-auto w-full max-w-[640px] h-[300px] sm:h-[400px] lg:h-[460px]">
        {/* Orbit ring guides */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="absolute w-[256px] h-[256px] sm:w-[380px] sm:h-[380px] lg:w-[500px] lg:h-[500px] rounded-full"
            style={{
              border: '1.5px solid hsl(var(--primary)/0.4)',
              transform: 'scaleY(0.36)',
              filter: 'drop-shadow(0 0 6px hsl(var(--primary)/0.35))',
            }}
          />
          <div
            className="absolute w-[290px] h-[290px] sm:w-[420px] sm:h-[420px] lg:w-[548px] lg:h-[548px] rounded-full"
            style={{
              border: '1px dashed hsl(var(--accent)/0.2)',
              transform: 'scaleY(0.36) rotate(14deg)',
            }}
          />
          {/* Core star */}
          <motion.div
            className="absolute rounded-full"
            style={{ width: 84, height: 84 }}
            animate={reduce ? undefined : { scale: [1, 1.1, 1], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 38% 32%, hsl(0 0% 100% / 0.9) 0%, hsl(var(--primary)) 34%, hsl(var(--accent)) 72%, transparent 100%)',
                boxShadow:
                  '0 0 34px 10px hsl(var(--primary)/0.45), 0 0 90px 30px hsl(var(--accent)/0.22)',
              }}
            />
          </motion.div>
        </div>

        {TOOL_PLANETS.map((p, i) => (
          <GalaxyPlanet
            key={p.id}
            planet={p}
            index={i}
            total={TOOL_PLANETS.length}
            selected={selected?.id === p.id}
            paused={!!selected}
            onSelect={() => setSelected(prev => (prev?.id === p.id ? null : p))}
          />
        ))}
      </div>

      {/* Glassmorphism detail panel */}
      <div className="relative mx-auto max-w-lg min-h-[150px] mt-6">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel p-6 sm:p-7"
              style={{ boxShadow: `0 0 60px -22px ${selected.glow}` }}
            >
              <div className="flex items-start gap-4">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{
                    background: `linear-gradient(135deg, ${selected.from}, ${selected.to})`,
                    boxShadow: `0 0 18px ${selected.glow}`,
                  }}
                >
                  {selected.icon}
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-lg sm:text-xl font-bold mb-1.5">
                    {selected.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {selected.desc}
                  </p>
                  <Button asChild size="sm" className="rounded-full">
                    <Link href={selected.href}>
                      Нээх
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs text-muted-foreground/70 pt-10 font-mono uppercase tracking-[0.2em]"
            >
              ✦ Гараг сонгоно уу ✦
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
