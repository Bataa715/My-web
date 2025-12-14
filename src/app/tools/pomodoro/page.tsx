'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

const PomodoroTimer = () => {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [minutes, setMinutes] = useState(workMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            if (audioRef.current) {
                audioRef.current.play();
            }
            if (isBreak) {
              // Break is over, start work
              setIsBreak(false);
              setMinutes(workMinutes);
            } else {
              // Work is over, start break
              setIsBreak(true);
              setMinutes(breakMinutes);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval!);
    }
    return () => clearInterval(interval!);
  }, [isActive, seconds, minutes, isBreak, workMinutes, breakMinutes]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(workMinutes);
    setSeconds(0);
  };

  const handleSettingsSave = () => {
    resetTimer();
    setIsSettingsOpen(false);
  };

  const totalSeconds = (isBreak ? breakMinutes : workMinutes) * 60;
  const elapsedSeconds = minutes * 60 + seconds;
  const progress = (1 - elapsedSeconds / totalSeconds) * 100;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-4">
        <audio ref={audioRef} src="/sounds/timer-end.mp3" preload="auto" />
      <Card
        className={cn(
          "w-full max-w-md text-center transition-colors duration-500",
          isBreak ? "bg-blue-100/30 dark:bg-blue-900/30 border-blue-500/50" : "bg-red-100/30 dark:bg-red-900/30 border-red-500/50"
        )}
      >
        <CardHeader>
          <CardTitle className="text-4xl font-bold font-headline">{isBreak ? 'Завсарлага' : 'Хичээллэх'}</CardTitle>
          <CardDescription>Төвлөрч, үр бүтээлтэй ажиллаарай.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="relative flex items-center justify-center">
             <svg className="transform -rotate-90 w-72 h-72">
                  <circle
                      cx="144"
                      cy="144"
                      r="130"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-muted-foreground/20"
                  />
                  <circle
                      cx="144"
                      cy="144"
                      r="130"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 130}
                      strokeDashoffset={(2 * Math.PI * 130) * (1 - progress / 100)}
                      className={cn("transition-all duration-500", isBreak ? "text-blue-500" : "text-red-500")}
                  />
              </svg>
            <div className="absolute text-7xl font-bold font-mono text-foreground">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={toggleTimer} size="lg" className="w-32">
              {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
              {isActive ? 'Зогсоох' : 'Эхлүүлэх'}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="lg">
              <RotateCcw />
            </Button>
             <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="lg"><Settings /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Цагийн тохиргоо</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="work-minutes" className="text-right">Хичээллэх</Label>
                        <Input
                        id="work-minutes"
                        type="number"
                        value={workMinutes}
                        onChange={(e) => setWorkMinutes(Number(e.target.value))}
                        className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="break-minutes" className="text-right">Завсарлах</Label>
                        <Input
                        id="break-minutes"
                        type="number"
                        value={breakMinutes}
                        onChange={(e) => setBreakMinutes(Number(e.target.value))}
                        className="col-span-3"
                        />
                    </div>
                    </div>
                    <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Цуцлах</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSettingsSave}>Хадгалах</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PomodoroTimer;
