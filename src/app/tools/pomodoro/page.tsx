
'use client';

import BackButton from "@/components/shared/BackButton";
import Timer from "@/app/tools/pomodoro/components/Timer";

export default function PomodoroPage() {

    return (
        <div className="space-y-8">
            <BackButton />
            <div className="text-center pt-8">
                <h1 className="text-4xl font-bold font-headline">Pomodoro Timer</h1>
                <p className="mt-2 text-muted-foreground">Анхаарлаа төвлөрүүлж, үр бүтээмжээ нэмэгдүүлээрэй.</p>
            </div>
            <div className="flex justify-center">
                <Timer />
            </div>
        </div>
    );
}
