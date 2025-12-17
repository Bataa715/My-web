
'use client';

import { ChevronDown } from 'lucide-react';
import React from 'react';

export default function ScrollDownIndicator() {
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const currentElement = event.currentTarget;
    let nextSection = currentElement.parentElement?.nextElementSibling;
    while(nextSection && !nextSection.tagName.toLowerCase().startsWith('section')) {
        nextSection = nextSection.nextElementSibling;
    }

    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
