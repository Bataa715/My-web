'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'pw_intro_seen_v1';

const IntroOverlay = () => {
  // Show only once per browser session — no re-trigger on route change.
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Respect reduced-motion users completely.
    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (prefersReduced) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore (private mode) */
    }
    setShow(true);
    const t = setTimeout(() => setShow(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            key="intro-primary"
            className="fixed top-0 left-0 w-full h-full bg-primary z-101 pointer-events-none"
            initial={{ y: '0%' }}
            animate={{ y: '-100%' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
          />
          <motion.div
            key="intro-bg"
            className="fixed top-0 left-0 w-full h-full bg-black z-100 pointer-events-none"
            initial={{ y: '0%' }}
            animate={{ y: '-100%' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default IntroOverlay;
