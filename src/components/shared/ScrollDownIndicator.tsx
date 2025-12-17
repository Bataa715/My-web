
'use client';

import { ChevronDown } from 'lucide-react';
import React from 'react';

interface ScrollDownIndicatorProps {
  targetId: string;
}

export default function ScrollDownIndicator({ targetId }: ScrollDownIndicatorProps) {
  const handleClick = () => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className="relative flex justify-center items-center h-24 cursor-pointer"
      onClick={handleClick}
    >
      <div className="animate-bounce">
        <ChevronDown className="h-8 w-8 text-muted-foreground" />
      </div>
    </div>
  );
}
