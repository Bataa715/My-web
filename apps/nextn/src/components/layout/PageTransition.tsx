'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Minimal top-bar progress indicator on every route change.
 */
const PageTransition = () => {
  const pathname = usePathname();
  const [playing, setPlaying] = useState<number | null>(null);
  const firstRef = useRef(true);

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    const id = Date.now();
    setPlaying(id);
    const t = setTimeout(() => setPlaying(null), 700);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence>
      {playing !== null && (
        <motion.div
          key={playing}
          className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none origin-left bg-linear-to-r from-primary via-primary/70 to-transparent"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
    </AnimatePresence>
  );
};

export default PageTransition;



