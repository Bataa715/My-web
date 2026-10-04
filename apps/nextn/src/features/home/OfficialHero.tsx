'use client';

import { motion } from 'framer-motion';
import { AOT_IMAGES } from '@/lib/aot-images';

export default function OfficialHero() {
  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-hidden bg-[#f3f1ee] -mt-16 md:-mt-20">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] aot-paper" />
      <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-3 pb-10 pt-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.86, y: 64 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.img
            src={AOT_IMAGES.home}
            alt=""
            animate={{ y: [0, -18, 0], scale: [1, 1.025, 1] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
            className="hero-collage max-h-[94svh] w-auto max-w-[min(1600px,98vw)] object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}
