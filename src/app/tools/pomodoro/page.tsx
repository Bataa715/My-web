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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30 mb-6"
            >
              <TimerIcon className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-rose-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
              Pomodoro Timer
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              Төвлөрлийг сайжруулж, бүтээмжээ нэмэгдүүлээрэй
            </p>

            {/* Feature badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3 mt-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
                <Focus className="h-3.5 w-3.5" />
                <span>Гүн төвлөрөл</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm">
                <Clock className="h-3.5 w-3.5" />
                <span>Ухаалаг амралт</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Бүтээмж+</span>
              </div>
            </motion.div>
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
