'use client';

import { motion } from 'framer-motion';
import Timer from '@/app/tools/pomodoro/components/Timer';
import { Timer as TimerIcon } from 'lucide-react';
import ToolPageShell from '@/components/shared/ToolPageShell';

export default function PomodoroPage() {
  return (
    <ToolPageShell
      title="Pomodoro Timer"
      eyebrow="Бүтээмж"
      icon={<TimerIcon className="h-8 w-8" />}
      breadcrumbs={[
        { label: 'Хэрэгслүүд', href: '/tools' },
        { label: 'Pomodoro' },
      ]}
    >
      <div className="max-w-2xl mx-auto pt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Timer />
        </motion.div>
      </div>
    </ToolPageShell>
  );
}
