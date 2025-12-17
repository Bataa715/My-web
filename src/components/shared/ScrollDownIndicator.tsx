
'use client';

import { ChevronDown } from 'lucide-react';
import React, { useRef } from 'react';

export default function ScrollDownIndicator() {
  const divRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (divRef.current) {
        let nextElement = divRef.current.nextElementSibling;
        while(nextElement && nextElement.tagName.toLowerCase() !== 'section') {
            nextElement = nextElement.nextElementSibling;
        }
        
        if (nextElement) {
            nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
  };

  return (
    <div
      ref={divRef}
      className="relative flex justify-center items-center h-24 cursor-pointer"
      onClick={handleClick}
    >
      <div className="animate-bounce">
        <ChevronDown className="h-8 w-8 text-muted-foreground" />
      </div>
    </div>
  );
}
