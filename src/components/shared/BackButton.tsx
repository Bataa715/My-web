"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    const router = useRouter();

    return (
        <div className="mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Буцах</span>
            </Button>
        </div>
    );
}
