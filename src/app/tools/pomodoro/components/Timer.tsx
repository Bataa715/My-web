'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCw, Settings } from 'lucide-react';

const defaultTimeSettings = {
  pomodoro: 25,
  shortBreak: 5,
};

type Mode = 'pomodoro' | 'shortBreak';

export default function Timer() {
  const [settings, setSettings] = useState(defaultTimeSettings);
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [time, setTime] = useState(settings.pomodoro * 60);
  const [isActive, setIsActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  const audioRef = useRef<HTMLAudioElement>(null);

  const switchMode = useCallback(
    (newMode: Mode) => {
      setIsActive(false);
      setMode(newMode);
      setTime(settings[newMode] * 60);
    },
    [settings]
  );

  useEffect(() => {
    // Reset timer to the current mode's time when settings change
    switchMode(mode);
  }, [settings, switchMode, mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (isActive && time === 0) {
      // Timer finished
      if (audioRef.current) {
        audioRef.current.play();
      }
      // Switch to the next mode
      if (mode === 'pomodoro') {
        // If it was a pomodoro session, switch to break
        switchMode('shortBreak');
      } else {
        // If it was a break, switch back to pomodoro
        switchMode('pomodoro');
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time, mode, switchMode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(settings[mode] * 60);
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
    <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm">
      <CardContent className="flex flex-col items-center justify-center space-y-8 py-10">
        <div className="text-9xl font-bold font-mono text-primary tracking-tighter">
          {formatTime(time)}
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={toggleTimer} className="w-40 h-14 px-8 text-lg">
            {isActive ? (
              <Pause className="mr-2 h-6 w-6" />
            ) : (
              <Play className="mr-2 h-6 w-6" />
            )}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-14 w-14">
                <Settings className="h-6 w-6" />
                <span className="sr-only">Тохиргоо</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Цаг тохируулах</DialogTitle>
                <DialogDescription>
                  Хичээллэх болон амрах хугацааг минутаар оруулна уу.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pomodoro-time" className="text-right">
                    Pomodoro
                  </Label>
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
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="short-break-time" className="text-right">
                    Break
                  </Label>
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
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Цуцлах
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleSettingsSave}>
                  Хадгалах
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={resetTimer}
            variant="outline"
            size="icon"
            className="h-14 w-14"
          >
            <RotateCw className="h-6 w-6" />
            <span className="sr-only">Reset</span>
          </Button>
        </div>
      </CardContent>
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
    </Card>
  );
}
