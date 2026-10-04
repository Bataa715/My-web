'use client';

import { useEffect } from 'react';

export default function ToolsIndexRedirect() {
  useEffect(() => {
    window.location.replace('/#tools');
  }, []);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary"
        aria-label="Loading"
      />
    </div>
  );
}
