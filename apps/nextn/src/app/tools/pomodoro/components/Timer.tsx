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
    color: 'from-rose-500 to-red-600',
    bgColor: 'bg-rose-500',
    textColor: 'text-rose-500',
    glowColor: 'shadow-rose-500/50',
  },
  shortBreak: {
    label: 'Богино амралт',
    icon: Coffee,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-500',
    glowColor: 'shadow-emerald-500/50',
  },
  longBreak: {
    label: 'Урт амралт',
    icon: Zap,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-500',
    glowColor: 'shadow-blue-500/50',
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
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              className={cn(
                'stop-current',
                color.includes('rose')
                  ? 'text-rose-400'
                  : color.includes('emerald')
                    ? 'text-emerald-400'
                    : 'text-blue-400'
              )}
            />
            <stop
              offset="100%"
              className={cn(
                'stop-current',
                color.includes('rose')
                  ? 'text-red-600'
                  : color.includes('emerald')
                    ? 'text-green-600'
                    : 'text-indigo-600'
              )}
            />
          </linearGradient>
        </defs>
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default function Timer() {
  const [settings, setSettings] = useState(defaultTimeSettings);
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [time, setTime] = useState(settings.pomodoro * 60);
  const [isActive, setIsActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);

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
      <div className="flex gap-2 p-1.5 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30">
        {(Object.keys(modeConfig) as Mode[]).map(m => {
          const config = modeConfig[m];
          const ModeIcon = config.icon;
          return (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                mode === m
                  ? cn(
                      'bg-gradient-to-r text-white shadow-lg',
                      config.color,
                      config.glowColor
                    )
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <ModeIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Timer Circle */}
      <motion.div
        key={mode}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative"
      >
        {/* Pulsing glow effect when active */}
        {isActive && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full blur-3xl opacity-30',
              currentConfig.bgColor
            )}
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <CircularProgress
          progress={progress}
          size={320}
          strokeWidth={12}
          color={currentConfig.color}
        >
          <div className="flex flex-col items-center gap-2">
            <motion.div
              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className={cn(
                'p-3 rounded-2xl bg-gradient-to-br',
                currentConfig.color
              )}
            >
              <Icon className="h-8 w-8 text-white" />
            </motion.div>
            <span className="text-6xl sm:text-7xl font-bold font-mono tracking-tight">
              {formatTime(time)}
            </span>
            <span
              className={cn('text-sm font-medium', currentConfig.textColor)}
            >
              {currentConfig.label}
            </span>
          </div>
        </CircularProgress>
      </motion.div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={resetTimer}
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card"
        >
          <RotateCw className="h-5 w-5" />
        </Button>

        <motion.button
          onClick={toggleTimer}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex items-center justify-center gap-3 h-16 px-10 rounded-2xl text-white font-semibold text-lg shadow-xl transition-all',
            'bg-gradient-to-r',
            currentConfig.color,
            currentConfig.glowColor
          )}
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
        </motion.button>

        <Button
          onClick={skipToNext}
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card"
        >
          <SkipForward className="h-5 w-5" />
        </Button>

        <Button
          onClick={() => setIsSettingsOpen(true)}
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 px-5 py-3 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30"
        >
          <div className="p-2 rounded-xl bg-rose-500/10">
            <Flame className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{completedPomodoros}</p>
            <p className="text-xs text-muted-foreground">Pomodoro</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 px-5 py-3 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30"
        >
          <div className="p-2 rounded-xl bg-amber-500/10">
            <Target className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{Math.round(todayMinutes)}</p>
            <p className="text-xs text-muted-foreground">Минут</p>
          </div>
        </motion.div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-0 rounded-2xl max-w-sm">
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
                <Brain className="h-4 w-4 text-rose-500" />
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
                className="bg-background/50 border-border/50 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-32">
                <Coffee className="h-4 w-4 text-emerald-500" />
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
                className="bg-background/50 border-border/50 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-32">
                <Zap className="h-4 w-4 text-blue-500" />
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
                className="bg-background/50 border-border/50 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="ghost" className="rounded-xl">
                Цуцлах
              </Button>
            </DialogClose>
            <Button
              onClick={handleSettingsSave}
              className={cn(
                'bg-gradient-to-r text-white rounded-xl',
                currentConfig.color
              )}
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
