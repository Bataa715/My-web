'use client';

import { motion } from 'framer-motion';
import BackButton from '@/components/shared/BackButton';
import Timer from '@/app/tools/pomodoro/components/Timer';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import { Timer as TimerIcon, Sparkles } from 'lucide-react';

export default function PomodoroPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative min-h-screen"
    >
      <InteractiveParticles quantity={40} />
      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 z-10">
        <div className="absolute top-0 left-4 md:left-6">
          <BackButton />
        </div>

        {/* Hero badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mb-8"
        >
          <TimerIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Төвлөрлийг сайжруулах</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative"
        >
          {/* Glow effect behind timer */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/10 to-amber-500/20 rounded-full blur-3xl scale-150 opacity-50" />
          <Timer />
        </motion.div>
      </div>
    </motion.div>
  );
}
