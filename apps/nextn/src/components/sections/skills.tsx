'use client';
import { useSkills } from '@/contexts/SkillsContext';
import { Skeleton } from '../ui/skeleton';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '../ui/button';
import { PlusCircle, Trash2, Edit, AlertTriangle, Sparkles } from 'lucide-react';
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
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import type { Skill } from '@/lib/types';
import TechIcon from '@/components/shared/TechIcon';

interface SkillCardProps {
  skillGroup: Skill;
  index: number;
}

// Color accents based on index - matching Education style
const cardAccents = [
  {
    gradient: 'from-primary via-primary/80 to-primary/60',
    glow: 'primary',
    iconBg: 'bg-primary/20',
    iconBorder: 'border-primary/40',
    iconText: 'text-primary',
  },
  {
    gradient: 'from-blue-500 via-blue-400 to-cyan-400',
    glow: 'blue-500',
    iconBg: 'bg-blue-500/20',
    iconBorder: 'border-blue-400/40',
    iconText: 'text-blue-400',
  },
  {
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glow: 'violet-500',
    iconBg: 'bg-violet-500/20',
    iconBorder: 'border-violet-400/40',
    iconText: 'text-violet-400',
  },
  {
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    glow: 'amber-500',
    iconBg: 'bg-amber-500/20',
    iconBorder: 'border-amber-400/40',
    iconText: 'text-amber-400',
  },
  {
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    glow: 'emerald-500',
    iconBg: 'bg-emerald-500/20',
    iconBorder: 'border-emerald-400/40',
    iconText: 'text-emerald-400',
  },
  {
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    glow: 'rose-500',
    iconBg: 'bg-rose-500/20',
    iconBorder: 'border-rose-400/40',
    iconText: 'text-rose-400',
  },
  {
    gradient: 'from-cyan-500 via-teal-500 to-emerald-500',
    glow: 'cyan-500',
    iconBg: 'bg-cyan-500/20',
    iconBorder: 'border-cyan-400/40',
    iconText: 'text-cyan-400',
  },
  {
    gradient: 'from-indigo-500 via-blue-500 to-purple-500',
    glow: 'indigo-500',
    iconBg: 'bg-indigo-500/20',
    iconBorder: 'border-indigo-400/40',
    iconText: 'text-indigo-400',
  },
];

const SkillCard = ({ skillGroup, index }: SkillCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-8deg', '8deg']);

  // Check if this is a Language category
  const isLanguageCategory =
    skillGroup.name.toLowerCase().includes('language') ||
    skillGroup.name.toLowerCase().includes('хэл');

  // Country flag mapping for languages
  const languageFlags: Record<string, string> = {
    english: '🇺🇸',
    japanese: '🇯🇵',
    korean: '🇰🇷',
    chinese: '🇨🇳',
    german: '🇩🇪',
    french: '🇫🇷',
    spanish: '🇪🇸',
    russian: '🇷🇺',
    mongolian: '🇲🇳',
  };

  const getIcon = (iconName: string) => {
    const LucideIcon = (require('lucide-react') as any)[iconName];
    return LucideIcon ? (
      <LucideIcon className="h-8 w-8" />
    ) : (
      <AlertTriangle className="h-8 w-8 text-destructive" />
    );
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Get accent color for this card
  const accent = cardAccents[index % cardAccents.length];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        handleMouseLeave();
        setIsHovered(false);
      }}
      onMouseEnter={() => setIsHovered(true)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="group relative h-full cursor-pointer"
    >
      {/* Soft outer glow on hover */}
      <motion.div
        className={`absolute -inset-px rounded-3xl bg-linear-to-br ${accent.gradient} opacity-0 blur-2xl transition-opacity duration-500`}
        animate={{ opacity: isHovered ? 0.25 : 0 }}
      />

      {/* Card */}
      <div className="relative h-full rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden transition-colors duration-300 group-hover:border-border">
        {/* Ambient corner orb */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-linear-to-br ${accent.gradient} opacity-[0.18] blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
        />

        {/* Spotlight */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(520px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.08), transparent 45%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="relative shrink-0">
              <div
                className={`absolute inset-0 rounded-2xl bg-linear-to-br ${accent.gradient} opacity-30 blur-md transition-opacity duration-300 group-hover:opacity-60`}
              />
              <div
                className={`relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl ${accent.iconBg} ${accent.iconText} border ${accent.iconBorder} backdrop-blur-md transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3`}
              >
                <span className="[&>svg]:h-6 [&>svg]:w-6 sm:[&>svg]:h-7 sm:[&>svg]:w-7">
                  {getIcon(skillGroup.icon)}
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground leading-tight truncate">
                {skillGroup.name}
              </h3>
              <p className="mt-0.5 text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                {skillGroup.items.length}{' '}
                {isLanguageCategory ? 'хэл' : 'технологи'}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-4 h-px bg-linear-to-r from-transparent via-border/70 to-transparent" />

          {/* Skills tags */}
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {skillGroup.items.map((item, idx) => {
              const flag = languageFlags[item.toLowerCase()];

              return (
                <div
                  key={idx}
                  className="group/item relative inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-1.5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm hover:shadow-primary/10"
                >
                  {/* Flag for languages or Icon */}
                  {isLanguageCategory && flag ? (
                    <span className="text-base leading-none">{flag}</span>
                  ) : (
                    <div className="w-4 h-4 shrink-0">
                      <TechIcon techName={item} className="w-4 h-4" />
                    </div>
                  )}

                  {/* Name */}
                  <span className="text-xs sm:text-sm font-medium text-foreground/85 group-hover/item:text-foreground transition-colors duration-200 whitespace-nowrap">
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Skills = () => {
  const { skills, loading, deleteSkillGroup } = useSkills();
  const { isEditMode } = useEditMode();

  return (
    <section id="skills" className="py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <PageHeader
          eyebrow="Ур чадвар"
          icon={<Sparkles className="h-3.5 w-3.5" />}
          title="Технологи болон хэрэгслийн хураангуй"
          description="Одоогийн байдлаар эзэмшиж буй frontend, backend болон AI хэрэгслүүд."
        />
        <div className="mb-10" />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-card/50 border border-border/60 p-6"
              >
                <div className="flex items-center gap-4 mb-5">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-9 w-24 rounded-full" />
                  <Skeleton className="h-9 w-32 rounded-full" />
                  <Skeleton className="h-9 w-28 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto"
            style={{ perspective: '1000px' }}
          >
            {skills.map((skillGroup, index) => (
              <div key={skillGroup.id} className="relative group">
                <SkillCard skillGroup={skillGroup} index={index} />
                {isEditMode && (
                  <div className="absolute top-3 right-3 flex gap-1 z-20">
                    <EditSkillDialog skillGroup={skillGroup}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white rounded-md"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </EditSkillDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 bg-black/50 hover:bg-destructive/80 text-white rounded-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Устгахдаа итгэлтэй байна уу?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            "{skillGroup.name}" бүлгийг устгах гэж байна. Энэ
                            үйлдэл буцаагдахгүй.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteSkillGroup(skillGroup.id)}
                          >
                            Устгах
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
            {isEditMode && (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="h-full min-h-[200px]"
              >
                <AddSkillDialog>
                  <button className="flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-card/30 backdrop-blur-md text-muted-foreground transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-lg hover:shadow-primary/10">
                    <PlusCircle size={48} />
                    <span className="mt-4 font-semibold">
                      Шинэ ур чадвар нэмэх
                    </span>
                  </button>
                </AddSkillDialog>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
