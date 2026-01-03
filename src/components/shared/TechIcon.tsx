
"use client";

import Image from 'next/image';
import { technologyList } from '@/data/technologies';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';

interface TechIconProps {
    techName: string;
    className?: string;
}

const TechIcon = ({ techName, className }: TechIconProps) => {
    const tech = technologyList.find(t => t.name.toLowerCase() === techName.toLowerCase());

    if (!tech) {
        return (
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <div className={cn("flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-black/50", className)}>
                            <span className="text-xs font-bold text-neutral-300">{techName.slice(0, 2).toUpperCase()}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{techName}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn("relative h-8 w-8", className)}>
                        <Image
                            src={tech.iconUrl}
                            alt={tech.name}
                            fill
                            className="object-contain"
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tech.name}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default TechIcon;
