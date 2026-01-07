'use client';

import { motion } from 'framer-motion';
import BackButton from '@/components/shared/BackButton';
import Timer from '@/app/tools/pomodoro/components/Timer';
import InteractiveParticles from '@/components/shared/InteractiveParticles';
import { Timer as TimerIcon, Clock, Focus, Sparkles } from 'lucide-react';

export default function PomodoroPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen"
    >
      <InteractiveParticles quantity={50} />

      <div className="relative z-10 p-4 md:p-8">
        <BackButton />

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-6 pb-8"
          >
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-rose-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
              Pomodoro Timer
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              Төвлөрлийг сайжруулж, бүтээмжээ нэмэгдүүлээрэй
            </p>
          </motion.div>

          {/* Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Timer />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
