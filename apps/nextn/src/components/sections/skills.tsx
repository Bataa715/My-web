'use client';
import { useMemo, useState } from 'react';
import { useSkills } from '@/contexts/SkillsContext';
import { Skeleton } from '../ui/skeleton';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '../ui/button';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { AddSkillDialog } from '../AddSkillDialog';
import { EditSkillDialog } from '../EditSkillDialog';
import PageHeader from '../shared/PageHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import type { Skill } from '@/lib/types';
import TechIcon from '@/components/shared/TechIcon';
import { cn } from '@/lib/utils';

// Color palette indexed by skill-group order
const CHIP_COLORS = [
  { text: 'hsl(221 91% 68%)', border: 'hsl(221 91% 60% / 0.4)', glow: 'hsl(221 91% 60% / 0.55)', dot: '#6096f8' },
  { text: 'hsl(271 81% 72%)', border: 'hsl(271 81% 62% / 0.4)', glow: 'hsl(271 81% 62% / 0.55)', dot: '#b07ef8' },
  { text: 'hsl(142 72% 55%)', border: 'hsl(142 72% 50% / 0.4)', glow: 'hsl(142 72% 50% / 0.55)', dot: '#4ade80' },
  { text: 'hsl(25 95% 62%)',  border: 'hsl(25 95% 55% / 0.4)',  glow: 'hsl(25 95% 55% / 0.55)',  dot: '#fb923c' },
  { text: 'hsl(330 81% 70%)', border: 'hsl(330 81% 65% / 0.4)', glow: 'hsl(330 81% 65% / 0.55)', dot: '#f472b6' },
  { text: 'hsl(45 93% 62%)',  border: 'hsl(45 93% 60% / 0.4)',  glow: 'hsl(45 93% 60% / 0.55)',  dot: '#fbbf24' },
  { text: 'hsl(189 94% 55%)', border: 'hsl(189 94% 50% / 0.4)', glow: 'hsl(189 94% 50% / 0.55)', dot: '#22d3ee' },
  { text: 'hsl(0 84% 68%)',   border: 'hsl(0 84% 65% / 0.4)',   glow: 'hsl(0 84% 65% / 0.55)',   dot: '#f87171' },
];

interface StarSkill {
  name: string;
  colorIdx: number;
  x: number; // % position inside the sky
  y: number;
}

/* ── One skill star: glowing orb + logo; the name appears on hover/tap ── */
function SkillStar({ star, index }: { star: StarSkill; index: number }) {
  const color = CHIP_COLORS[star.colorIdx % CHIP_COLORS.length];
  const [open, setOpen] = useState(false); // touch fallback for hover
  return (
    <div
      className="group absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${star.x}%`, top: `${star.y}%`, zIndex: open ? 40 : undefined }}
    >
      {/* 4-point light rays — the "star" sparkle */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-14 opacity-35 group-hover:opacity-90 transition-opacity duration-300 animate-pulse-glow"
        style={{
          background: `linear-gradient(to bottom, transparent, ${color.dot}, transparent)`,
          animationDelay: `${(index % 7) * 0.45}s`,
        }}
      />
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-14 opacity-35 group-hover:opacity-90 transition-opacity duration-300 animate-pulse-glow"
        style={{
          background: `linear-gradient(to right, transparent, ${color.dot}, transparent)`,
          animationDelay: `${(index % 7) * 0.45}s`,
        }}
      />
      {/* Halo */}
      <span
        aria-hidden
        className="absolute -inset-2 rounded-full blur-md opacity-40 group-hover:opacity-90 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle, ${color.glow}, transparent 70%)` }}
      />
      {/* Star core with the tech logo */}
      <button
        type="button"
        aria-label={star.name}
        onClick={() => setOpen(v => !v)}
        onBlur={() => setOpen(false)}
        className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border backdrop-blur-md transition-transform duration-300 group-hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{
          background:
            'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.22) 0%, hsl(var(--card) / 0.92) 55%, hsl(var(--card) / 0.75) 100%)',
          borderColor: color.border,
          boxShadow: `0 0 16px ${color.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}
      >
        <TechIcon techName={star.name} className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      {/* Name label — hidden until hover / tap */}
      <span
        className={cn(
          'absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-xl transition-all duration-300 pointer-events-none',
          open
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
        )}
        style={{
          color: color.text,
          borderColor: color.border,
          background: 'hsl(var(--background) / 0.85)',
          boxShadow: `0 0 14px ${color.glow}`,
          textShadow: `0 0 8px ${color.glow}`,
        }}
      >
        {star.name}
      </span>
    </div>
  );
}

// Edit-mode compact card per group
function EditGroupCard({ skillGroup, index, onDelete }: { skillGroup: Skill; index: number; onDelete: () => void }) {
  const color = CHIP_COLORS[index % CHIP_COLORS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-4 sm:p-5"
      style={{ boxShadow: `0 0 20px ${color.glow.replace('0.55', '0.15')}` }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color.dot }} />
          <span className="font-semibold text-sm text-foreground">{skillGroup.name}</span>
          <span className="text-xs text-muted-foreground">({skillGroup.items.length})</span>
        </div>
        <div className="flex gap-1">
          <EditSkillDialog skillGroup={skillGroup}>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary">
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </EditSkillDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
                <AlertDialogDescription>
                  "{skillGroup.name}" бүлгийг устгах гэж байна. Энэ үйлдэл буцаагдахгүй.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Устгах</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skillGroup.items.slice(0, 8).map((item, i) => (
          <span key={i} className="text-xs px-2 py-0.5 rounded-full border border-border/40 bg-background/40 text-muted-foreground">
            {item}
          </span>
        ))}
        {skillGroup.items.length > 8 && (
          <span className="text-xs px-2 py-0.5 rounded-full border border-border/40 bg-background/40 text-muted-foreground">
            +{skillGroup.items.length - 8}
          </span>
        )}
      </div>
    </motion.div>
  );
}

const Skills = () => {
  const { skills, loading, deleteSkillGroup } = useSkills();
  const { isEditMode } = useEditMode();

  /* ── CONSTELLATION LAYOUT ──
     Every skill becomes a star scattered across the "sky" with a
     golden-ratio low-discrepancy sequence (deterministic → no hydration
     mismatch, naturally even spread) plus a tiny sine jitter so the grid
     never reads as a grid. Stars of the same group share a colour and are
     linked with faint constellation lines. */
  const starSkills: StarSkill[] = useMemo(() => {
    const all = skills.flatMap((group, gi) =>
      group.items.map(item => ({ name: item, colorIdx: gi }))
    );
    return all.map((s, i) => {
      const fx = (i * 0.618033) % 1;
      const fy = (i * 0.381966 + 0.17) % 1;
      const jx = Math.sin(i * 12.9898) * 0.045;
      const jy = Math.cos(i * 78.233) * 0.05;
      return {
        ...s,
        x: 6 + (((fx + jx) % 1) + 1) % 1 * 88,
        y: 10 + (((fy + jy) % 1) + 1) % 1 * 72,
      };
    });
  }, [skills]);

  return (
    <section id="skills" className="py-12 sm:py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <PageHeader eyebrow="Ур чадвар">
          <h2 className="font-display glow-text text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Ур чадварын одод
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Од бүр — нэг технологи. Хулганаа аваачиж нэрийг нь хараарай.
          </p>
        </PageHeader>
        <div className="mb-6 sm:mb-10" />
      </div>

      {loading ? (
        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-5xl h-[380px]">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton
                key={i}
                className="absolute h-10 w-10 rounded-full"
                style={{
                  left: `${6 + ((i * 0.618033) % 1) * 88}%`,
                  top: `${10 + ((i * 0.381966 + 0.17) % 1) * 72}%`,
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-5xl h-[400px] sm:h-[480px]">
            {/* Constellation lines — link stars of the same group */}
            <svg
              aria-hidden
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {skills.map((_, gi) => {
                const pts = starSkills.filter(s => s.colorIdx === gi);
                if (pts.length < 2) return null;
                const d = pts
                  .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
                  .join(' ');
                return (
                  <path
                    key={gi}
                    d={d}
                    fill="none"
                    stroke={CHIP_COLORS[gi % CHIP_COLORS.length].dot}
                    strokeWidth="1"
                    strokeDasharray="2 5"
                    opacity="0.18"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>

            {starSkills.map((star, i) => (
              <SkillStar key={`${star.name}-${i}`} star={star} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Edit mode — skill group management */}
      {isEditMode && !loading && (
        <div className="container mx-auto px-4 sm:px-6 md:px-8 mt-12">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Засах горим — Ур чадварын бүлгүүд</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {skills.map((skillGroup, index) => (
              <EditGroupCard
                key={skillGroup.id}
                skillGroup={skillGroup}
                index={index}
                onDelete={() => deleteSkillGroup(skillGroup.id)}
              />
            ))}
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-h-[100px]"
            >
              <AddSkillDialog>
                <button className="flex h-full w-full min-h-[100px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-card/20 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:text-primary gap-2">
                  <PlusCircle size={28} />
                  <span className="text-sm font-medium">Шинэ бүлэг нэмэх</span>
                </button>
              </AddSkillDialog>
            </motion.div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Skills;
