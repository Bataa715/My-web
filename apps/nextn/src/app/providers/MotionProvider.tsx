'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Global framer-motion config:
 * - Respects `prefers-reduced-motion` for accessibility.
 * - Pins a single transition feel app-wide.
 *
 * Note: full LazyMotion+m migration would require touching every motion.*
 * call site, so we only enforce config here.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
    >
      {children}
    </MotionConfig>
  );
}
