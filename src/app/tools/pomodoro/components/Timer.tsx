
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCw } from 'lucide-react';

const timeSettings = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
};

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

export default function Timer() {
    const [mode, setMode] = useState<Mode>('pomodoro');
    const [time, setTime] = useState(timeSettings.pomodoro);
    const [isActive, setIsActive] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);

    const switchMode = useCallback((newMode: Mode) => {
        setIsActive(false);
        setMode(newMode);
        setTime(timeSettings[newMode]);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && time > 0) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime - 1);
            }, 1000);
        } else if (isActive && time === 0) {
            if (audioRef.current) {
                audioRef.current.play();
            }
            if (mode === 'pomodoro') {
                const newPomodoroCount = pomodoroCount + 1;
                setPomodoroCount(newPomodoroCount);
                if (newPomodoroCount % 4 === 0) {
                    switchMode('longBreak');
                } else {
                    switchMode('shortBreak');
                }
            } else {
                switchMode('pomodoro');
            }
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isActive, time, mode, pomodoroCount, switchMode]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTime(timeSettings[mode]);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <Tabs value={mode} onValueChange={(value) => switchMode(value as Mode)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
                        <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
                        <TabsTrigger value="longBreak">Long Break</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-8 py-10">
                <div className="text-8xl font-bold font-mono text-primary tracking-tighter">
                    {formatTime(time)}
                </div>
                <div className="flex items-center space-x-4">
                    <Button onClick={toggleTimer} size="lg" className="w-32">
                        {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                        {isActive ? 'Pause' : 'Start'}
                    </Button>
                    <Button onClick={resetTimer} variant="outline" size="icon">
                        <RotateCw className="h-5 w-5" />
                        <span className="sr-only">Reset</span>
                    </Button>
                </div>
            </CardContent>
            <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
        </Card>
    );
}
