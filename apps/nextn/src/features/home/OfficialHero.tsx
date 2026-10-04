'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { AOT_IMAGES } from '@/lib/aot-images';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function OfficialHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Scroll parallax: the collage drifts up and softly fades as you leave.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.25]);

  // Pointer parallax: layers shift in opposite directions for depth.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });
  const imgX = useTransform(sx, v => v * -14);
  const imgY = useTransform(sy, v => v * -10);
  const bgX = useTransform(sx, v => v * 8);
  const bgY = useTransform(sy, v => v * 6);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      className="relative isolate min-h-[100svh] w-full overflow-hidden bg-[#f3f1ee] -mt-16 md:-mt-20"
    >
      {/* Paper texture — drifts slightly against the image */}
      <motion.div
        style={{ x: bgX, y: bgY }}
        className="pointer-events-none absolute -inset-6 opacity-[0.12] aot-paper"
      />

      {/* Crimson curtain: wipes upward at load to uncover the page */}
      {!reduce && (
        <motion.div
          aria-hidden
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
          className="pointer-events-none absolute inset-0 z-20 bg-[#c41212]"
        />
      )}

      <motion.div
        style={reduce ? undefined : { y: scrollY, opacity: scrollOpacity }}
        className="relative z-10 flex min-h-[100svh] items-center justify-center px-3 pb-10 pt-16 sm:px-6"
      >
        {/* Emerge: rises from below, un-blurs, and is revealed bottom → top */}
        <motion.div
          initial={
            reduce
              ? false
              : {
                  opacity: 0,
                  y: 90,
                  scale: 1.14,
                  filter: 'blur(18px) brightness(1.25)',
                  clipPath: 'inset(100% 0% 0% 0%)',
                }
          }
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px) brightness(1)',
            clipPath: 'inset(0% 0% 0% 0%)',
          }}
          transition={{ duration: 1.7, ease: EASE, delay: reduce ? 0 : 0.7 }}
        >
          <motion.div style={reduce ? undefined : { x: imgX, y: imgY }}>
            <motion.img
              src={AOT_IMAGES.home}
              alt=""
              animate={reduce ? undefined : { y: [0, -16, 0], scale: [1, 1.02, 1] }}
              transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 2.6 }}
              className="hero-collage max-h-[94svh] w-auto max-w-[min(1600px,98vw)] object-contain"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 2.6, duration: 0.8 }}
        className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#111]/45"
      >
        Scroll
        <motion.span
          animate={reduce ? undefined : { scaleY: [0.3, 1, 0.3], originY: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="block h-8 w-px bg-[#c41212]"
        />
      </motion.div>
    </section>
  );
}
