'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Play,
  Pause,
  RotateCw,
  Settings,
  Coffee,
  Brain,
  Flame,
  Target,
  Zap,
  SkipForward,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSyncedState } from '@/hooks/use-synced-state';

const defaultTimeSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
};

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

const modeConfig = {
  pomodoro: {
    label: 'Төвлөрөл',
    icon: Brain,
    stroke: '#c41212',
    textColor: 'text-[#c41212]',
  },
  shortBreak: {
    label: 'Богино амралт',
    icon: Coffee,
    stroke: '#111111',
    textColor: 'text-[#111]',
  },
  longBreak: {
    label: 'Урт амралт',
    icon: Zap,
    stroke: '#111111',
    textColor: 'text-[#111]',
  },
};

// Circular Progress Component
const CircularProgress = ({
  progress,
  size = 320,
  strokeWidth = 12,
  color,
  children,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  children: React.ReactNode;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="square"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default function Timer() {
  // Settings + today's stats are saved to Supabase (localStorage cache).
  const [settings, setSettings] = useSyncedState(
    'pomodoro-settings',
    defaultTimeSettings
  );
  const [savedStats, setSavedStats, statsLoaded] = useSyncedState(
    'pomodoro-stats',
    { date: '', completed: 0, minutes: 0 }
  );
  const [statsHydrated, setStatsHydrated] = useState(false);
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [time, setTime] = useState(settings.pomodoro * 60);
  const [isActive, setIsActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  // Restore today's stats once they have loaded.
  useEffect(() => {
    if (!statsLoaded || statsHydrated) return;
    const today = new Date().toDateString();
    if (savedStats.date === today) {
      setCompletedPomodoros(savedStats.completed);
      setTodayMinutes(savedStats.minutes);
    }
    setStatsHydrated(true);
  }, [statsLoaded, statsHydrated, savedStats]);

  // Persist whenever a pomodoro completes or a full minute is added.
  const wholeMinutes = Math.floor(todayMinutes);
  useEffect(() => {
    if (!statsHydrated) return;
    const today = new Date().toDateString();
    if (
      savedStats.date === today &&
      savedStats.completed === completedPomodoros &&
      savedStats.minutes === wholeMinutes
    )
      return;
    setSavedStats({
      date: today,
      completed: completedPomodoros,
      minutes: wholeMinutes,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsHydrated, completedPomodoros, wholeMinutes]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentConfig = modeConfig[mode];
  const Icon = currentConfig.icon;
  const totalTime = settings[mode] * 60;
  const progress = ((totalTime - time) / totalTime) * 100;

  const switchMode = useCallback(
    (newMode: Mode) => {
      setIsActive(false);
      setMode(newMode);
      setTime(settings[newMode] * 60);
    },
    [settings]
  );

  useEffect(() => {
    setTime(settings[mode] * 60);
  }, [settings, mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime - 1);
        if (mode === 'pomodoro') {
          setTodayMinutes(prev => prev + 1 / 60);
        }
      }, 1000);
    } else if (isActive && time === 0) {
      if (audioRef.current) {
        audioRef.current.play();
      }
      if (mode === 'pomodoro') {
        setCompletedPomodoros(prev => prev + 1);
        const newCount = completedPomodoros + 1;
        // Every 4 pomodoros, take a long break
        if (newCount % 4 === 0) {
          switchMode('longBreak');
        } else {
          switchMode('shortBreak');
        }
      } else {
        switchMode('pomodoro');
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, mode, switchMode, completedPomodoros]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTime(settings[mode] * 60);
  };

  const skipToNext = () => {
    if (mode === 'pomodoro') {
      switchMode('shortBreak');
    } else {
      switchMode('pomodoro');
    }
  };

  const handleSettingsSave = () => {
    setSettings(tempSettings);
    setIsSettingsOpen(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Mode Selector */}
      <div className="flex gap-2 border border-[#111] p-1">
        {(Object.keys(modeConfig) as Mode[]).map(m => {
          const config = modeConfig[m];
          const ModeIcon = config.icon;
          return (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors',
                mode === m
                  ? 'bg-[#c41212] text-white'
                  : 'text-[#111]/50 hover:text-[#111]'
              )}
            >
              <ModeIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{config.label}</span>
            </button>
          );
        })}
      </div>

      <motion.div
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <CircularProgress
          progress={progress}
          size={320}
          strokeWidth={8}
          color={currentConfig.stroke}
        >
          <div className="flex flex-col items-center gap-2">
            <Icon className={cn('h-7 w-7', currentConfig.textColor)} />
            <span className="font-mono text-6xl tracking-tight sm:text-7xl">
              {formatTime(time)}
            </span>
            <span className={cn('text-[11px] font-semibold uppercase tracking-[0.16em]', currentConfig.textColor)}>
              {currentConfig.label}
            </span>
          </div>
        </CircularProgress>
      </motion.div>

      <div className="flex items-center gap-3">
        <Button
          onClick={resetTimer}
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-none border-[#111]/30 bg-transparent"
        >
          <RotateCw className="h-5 w-5" />
        </Button>

        <button
          onClick={toggleTimer}
          className="flex h-16 items-center justify-center gap-3 bg-[#c41212] px-10 text-lg font-semibold text-white"
        >
          <AnimatePresence mode="wait">
            {isActive ? (
              <motion.div
                key="pause"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <Pause className="h-6 w-6" />
                <span>Зогсоох</span>
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <Play className="h-6 w-6" />
                <span>Эхлэх</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <Button
          onClick={skipToNext}
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-none border-[#111] bg-transparent"
        >
          <SkipForward className="h-5 w-5" />
        </Button>

        <Button
          onClick={() => setIsSettingsOpen(true)}
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-none border-[#111] bg-transparent"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-4 flex gap-4">
        <div className="flex items-center gap-3 border border-[#111] px-5 py-3">
          <Flame className="h-5 w-5 text-[#c41212]" />
          <div>
            <p className="text-2xl">{completedPomodoros}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#111]/45">
              Pomodoro
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border border-[#111] px-5 py-3">
          <Target className="h-5 w-5 text-[#c41212]" />
          <div>
            <p className="text-2xl">{Math.round(todayMinutes)}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#111]/45">
              Минут
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-sm rounded-none border border-[#111] bg-[#f3f1ee]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              Цаг тохируулах
            </DialogTitle>
            <DialogDescription>Хугацааг минутаар оруулна уу</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-32">
                <Brain className="h-4 w-4 text-[#c41212]" />
                <Label htmlFor="pomodoro-time">Төвлөрөл</Label>
              </div>
              <Input
                id="pomodoro-time"
                type="number"
                value={tempSettings.pomodoro}
                onChange={e =>
                  setTempSettings({
                    ...tempSettings,
                    pomodoro: Number(e.target.value),
                  })
                }
                className="rounded-none border-[#111]/30 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-32">
                <Coffee className="h-4 w-4 text-[#111]" />
                <Label htmlFor="short-break-time">Богино</Label>
              </div>
              <Input
                id="short-break-time"
                type="number"
                value={tempSettings.shortBreak}
                onChange={e =>
                  setTempSettings({
                    ...tempSettings,
                    shortBreak: Number(e.target.value),
                  })
                }
                className="rounded-none border-[#111]/30 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-32">
                <Zap className="h-4 w-4 text-[#111]" />
                <Label htmlFor="long-break-time">Урт</Label>
              </div>
              <Input
                id="long-break-time"
                type="number"
                value={tempSettings.longBreak}
                onChange={e =>
                  setTempSettings({
                    ...tempSettings,
                    longBreak: Number(e.target.value),
                  })
                }
                className="rounded-none border-[#111]/30 bg-transparent"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="ghost" className="rounded-none">
                Цуцлах
              </Button>
            </DialogClose>
            <Button
              onClick={handleSettingsSave}
              className="rounded-none bg-[#c41212] text-white"
            >
              Хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
    </div>
  );
}
