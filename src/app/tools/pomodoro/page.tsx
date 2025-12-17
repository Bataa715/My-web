
'use client';

import BackButton from "@/components/shared/BackButton";
import Timer from "@/app/tools/pomodoro/components/Timer";

export default function PomodoroPage() {

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="absolute top-0 left-0">
                <BackButton />
            </div>
            <Timer />
        </div>
    );
}
