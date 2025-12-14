
'use client';

import BackButton from "@/components/shared/BackButton";
import Timer from "@/app/tools/pomodoro/components/Timer";

export default function PomodoroPage() {

    return (
        <div className="space-y-8">
            <BackButton />
            <div className="flex justify-center pt-8">
                <Timer />
            </div>
        </div>
    );
}
