'use client';
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

// Color palette indexed by skill-group order
const CHIP_COLORS = [
  { text: 'hsl(221 91% 68%)', border: 'hsl(221 91% 60% / 0.35)', glow: 'hsl(221 91% 60% / 0.12)', dot: '#6096f8' },
  { text: 'hsl(271 81% 72%)', border: 'hsl(271 81% 62% / 0.35)', glow: 'hsl(271 81% 62% / 0.12)', dot: '#b07ef8' },
  { text: 'hsl(142 72% 55%)', border: 'hsl(142 72% 50% / 0.35)', glow: 'hsl(142 72% 50% / 0.12)', dot: '#4ade80' },
  { text: 'hsl(25 95% 62%)',  border: 'hsl(25 95% 55% / 0.35)',  glow: 'hsl(25 95% 55% / 0.12)',  dot: '#fb923c' },
  { text: 'hsl(330 81% 70%)', border: 'hsl(330 81% 65% / 0.35)', glow: 'hsl(330 81% 65% / 0.12)', dot: '#f472b6' },
  { text: 'hsl(45 93% 62%)',  border: 'hsl(45 93% 60% / 0.35)',  glow: 'hsl(45 93% 60% / 0.12)',  dot: '#fbbf24' },
  { text: 'hsl(189 94% 55%)', border: 'hsl(189 94% 50% / 0.35)', glow: 'hsl(189 94% 50% / 0.12)', dot: '#22d3ee' },
  { text: 'hsl(0 84% 68%)',   border: 'hsl(0 84% 65% / 0.35)',   glow: 'hsl(0 84% 65% / 0.12)',   dot: '#f87171' },
];

interface FlatSkill {
  name: string;
  colorIdx: number;
}

interface SkillRowProps {
  skills: FlatSkill[];
  duration: number;
  reverse?: boolean;
}

function SkillChip({ skill }: { skill: FlatSkill }) {
  const color = CHIP_COLORS[skill.colorIdx % CHIP_COLORS.length];
  return (
    <div
      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border backdrop-blur-sm shrink-0 transition-all duration-300 hover:scale-105 cursor-default"
      style={{
        borderColor: color.border,
        boxShadow: `0 0 14px ${color.glow}, inset 0 1px 0 hsl(0 0% 100% / 0.06)`,
        background: 'hsl(var(--card) / 0.7)',
      }}
    >
      <div className="w-4 h-4 shrink-0">
        <TechIcon techName={skill.name} className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium whitespace-nowrap" style={{ color: color.text }}>
        {skill.name}
      </span>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color.dot, boxShadow: `0 0 6px ${color.dot}` }} />
    </div>
  );
}

function SkillRow({ skills, duration, reverse = false }: SkillRowProps) {
  if (skills.length === 0) return null;
  // Duplicate for seamless loop
  const doubled = [...skills, ...skills];
  return (
    <div className="overflow-hidden">
      <div
        className={reverse ? 'marquee-track-rev' : 'marquee-track'}
        style={{ ['--marquee-dur' as string]: `${duration}s` }}
      >
        {doubled.map((skill, i) => (
          <SkillChip key={i} skill={skill} />
        ))}
      </div>
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
      style={{ boxShadow: `0 0 20px ${color.glow}` }}
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

  // Flatten all skill items with their color index
  const allSkills: FlatSkill[] = skills.flatMap((group, gi) =>
    group.items.map(item => ({ name: item, colorIdx: gi }))
  );

  // Distribute into 4 rows round-robin for even spread
  const rows = [0, 1, 2, 3].map(r => allSkills.filter((_, i) => i % 4 === r));
  const durations = [42, 58, 48, 65];

  return (
    <section id="skills" className="py-12 sm:py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <PageHeader eyebrow="Ур чадвар" />
        <div className="mb-10 sm:mb-14" />
      </div>

      {loading ? (
        <div className="flex flex-col gap-4 px-4">
          {[42, 58, 48, 65].map((dur, i) => (
            <div key={i} className="flex gap-3 overflow-hidden">
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-28 rounded-full shrink-0" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* 3D perspective tilt container */}
          <div
            className="flex flex-col gap-3 sm:gap-4 py-2"
            style={{
              perspective: '1200px',
              transform: 'perspective(1200px) rotateX(6deg)',
              transformOrigin: 'center top',
            }}
          >
            {rows.map((rowSkills, i) => (
              <SkillRow
                key={i}
                skills={rowSkills}
                duration={durations[i]}
                reverse={i % 2 === 1}
              />
            ))}
          </div>

          {/* Left/right fade masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-36 z-10"
            style={{ background: 'linear-gradient(to right, hsl(var(--background)), transparent)' }}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-36 z-10"
            style={{ background: 'linear-gradient(to left, hsl(var(--background)), transparent)' }}
          />

          {/* Top/bottom depth fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 z-10"
            style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--background) / 0.6))' }}
          />
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
