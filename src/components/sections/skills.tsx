'use client';
import { useSkills } from '@/contexts/SkillsContext';
import { Skeleton } from '../ui/skeleton';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '../ui/button';
import { PlusCircle, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { AddSkillDialog } from '../AddSkillDialog';
import { EditSkillDialog } from '../EditSkillDialog';
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
  { gradient: 'from-primary via-primary/80 to-primary/60', glow: 'primary', iconBg: 'bg-primary/20', iconBorder: 'border-primary/40', iconText: 'text-primary' },
  { gradient: 'from-blue-500 via-blue-400 to-cyan-400', glow: 'blue-500', iconBg: 'bg-blue-500/20', iconBorder: 'border-blue-400/40', iconText: 'text-blue-400' },
  { gradient: 'from-violet-500 via-purple-500 to-fuchsia-500', glow: 'violet-500', iconBg: 'bg-violet-500/20', iconBorder: 'border-violet-400/40', iconText: 'text-violet-400' },
  { gradient: 'from-amber-500 via-orange-500 to-red-500', glow: 'amber-500', iconBg: 'bg-amber-500/20', iconBorder: 'border-amber-400/40', iconText: 'text-amber-400' },
  { gradient: 'from-emerald-500 via-green-500 to-teal-500', glow: 'emerald-500', iconBg: 'bg-emerald-500/20', iconBorder: 'border-emerald-400/40', iconText: 'text-emerald-400' },
  { gradient: 'from-rose-500 via-pink-500 to-fuchsia-500', glow: 'rose-500', iconBg: 'bg-rose-500/20', iconBorder: 'border-rose-400/40', iconText: 'text-rose-400' },
  { gradient: 'from-cyan-500 via-teal-500 to-emerald-500', glow: 'cyan-500', iconBg: 'bg-cyan-500/20', iconBorder: 'border-cyan-400/40', iconText: 'text-cyan-400' },
  { gradient: 'from-indigo-500 via-blue-500 to-purple-500', glow: 'indigo-500', iconBg: 'bg-indigo-500/20', iconBorder: 'border-indigo-400/40', iconText: 'text-indigo-400' },
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
      {/* Glow effect behind card */}
      <motion.div
        className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${accent.gradient} opacity-0 blur-xl transition-opacity duration-500`}
        animate={{ opacity: isHovered ? 0.4 : 0 }}
      />

      {/* Card */}
      <div className="relative h-full rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm overflow-hidden">
        {/* Top gradient accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent.gradient}`} />

        {/* Spotlight effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-6 pt-8">
          {/* Icon and Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {/* Glow behind icon */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${accent.gradient} rounded-2xl blur-xl`}
                animate={{ scale: isHovered ? 1.2 : 0.8, opacity: isHovered ? 0.5 : 0.3 }}
                transition={{ duration: 0.3 }}
              />
              <div className={`relative flex items-center justify-center w-16 h-16 rounded-2xl ${accent.iconBg} ${accent.iconText} border ${accent.iconBorder} group-hover:scale-110 transition-all duration-300`}>
                {getIcon(skillGroup.icon)}
              </div>
            </div>
            <h3 className={`text-xl md:text-2xl font-bold text-foreground transition-colors duration-300`}>
              {skillGroup.name}
            </h3>
          </div>

          {/* Skills tags */}
          <div className="flex flex-wrap gap-3">
            {skillGroup.items.map((item, idx) => {
              const flag = languageFlags[item.toLowerCase()];

              return (
                <div key={idx} className="group/item relative overflow-hidden">
                  {/* Glow effect */}
                  <motion.div 
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${accent.gradient} blur-md`}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.3 }}
                  />

                  {/* Skill badge */}
                  <div className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-neutral-800/80 border border-neutral-700/50 group-hover/item:border-neutral-600 backdrop-blur-sm transition-all duration-300 group-hover/item:scale-105`}>
                    {/* Flag for languages or Icon */}
                    {isLanguageCategory && flag ? (
                      <span className="text-xl">{flag}</span>
                    ) : (
                      <div className="w-6 h-6 flex-shrink-0">
                        <TechIcon techName={item} className="w-6 h-6" />
                      </div>
                    )}

                    {/* Name */}
                    <span className="text-sm md:text-base font-medium text-foreground/80 group-hover/item:text-primary transition-colors duration-300 whitespace-nowrap">
                      {item}
                    </span>
                  </div>
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
    <section id="skills" className="py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold">
            Ур чадвар &amp; <span className="text-primary">Технологиуд</span>
          </h2>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-neutral-900/50 border border-neutral-800 p-6"
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
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
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
                  <button className="flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900/30 text-neutral-500 transition-all duration-300 hover:border-primary hover:bg-neutral-900/50 hover:text-primary hover:shadow-lg hover:shadow-primary/10">
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
