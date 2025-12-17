
'use client';

import { ChevronDown } from 'lucide-react';
import React, { useRef } from 'react';

export default function ScrollDownIndicator() {
  const divRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (divRef.current) {
        // Find the parent of the current div, which contains this indicator.
        const parentContainer = divRef.current;
        if (parentContainer) {
            let nextElement = parentContainer.nextElementSibling;
            // Find the next <section> element
            while(nextElement && nextElement.tagName.toLowerCase() !== 'section') {
                nextElement = nextElement.nextElementSibling;
            }
            
            if (nextElement) {
                nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
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
