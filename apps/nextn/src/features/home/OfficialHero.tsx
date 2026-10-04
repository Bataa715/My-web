'use client';

import { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Check, Link2 } from 'lucide-react';
import { AOT_IMAGES } from '@/lib/aot-images';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Hero in the style of the official Attack on Titan portal:
 * a big cut-out collage, cropped by the viewport, sitting on a torn red/black
 * "ink" splash over pale concrete. The splash is generated from the collage's
 * own silhouette (SVG blur → displacement → alpha threshold), so no extra asset
 * is needed and it always matches the artwork.
 */
export default function OfficialHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  // Scroll: the whole stage drifts up slightly and fades as you leave
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const stageY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const stageOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.3]);

  // Pointer parallax — splash and artwork move in opposite directions
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 55, damping: 18, mass: 0.6 });
  const artX = useTransform(sx, v => v * -16);
  const artY = useTransform(sy, v => v * -10);
  const splashX = useTransform(sx, v => v * 10);
  const splashY = useTransform(sy, v => v * 6);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const shareUrl = () => (typeof window === 'undefined' ? '' : window.location.origin);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  // Shared sizing: fills the width like the official page, never smaller than ~¾ of the
  // viewport height so portrait phones still get a tall, cropped composition.
  const artSize = 'w-[max(min(99vw,1950px),80svh)] max-w-none';

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      className="relative isolate h-[100svh] min-h-[560px] w-full overflow-hidden bg-[#d9d9d5] -mt-16 md:-mt-20"
    >
      {/* SVG filters that turn the artwork's silhouette into torn ink shapes */}
      <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
        <defs>
          <filter id="aot-ink-red" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="58" result="b" />
            <feTurbulence type="fractalNoise" baseFrequency="0.011 0.017" numOctaves="3" seed="7" result="n" />
            <feDisplacementMap in="b" in2="n" scale="170" xChannelSelector="R" yChannelSelector="G" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.77  0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 24 -8" />
          </filter>
          <filter id="aot-ink-black" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="24" result="b" />
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="3" seed="3" result="n" />
            <feDisplacementMap in="b" in2="n" scale="80" xChannelSelector="G" yChannelSelector="R" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.02  0 0 0 0 0.02  0 0 0 0 0.02  0 0 0 26 -9" />
          </filter>
        </defs>
      </svg>

      {/* Concrete ground: soft light + fine grain + the faint vertical guides of the portal */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 18% 12%, #f1f1ee 0%, transparent 46%), radial-gradient(ellipse at 85% 88%, #cfcfca 0%, transparent 50%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[4%] w-px bg-black/[0.07]" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-[4%] w-px bg-black/[0.07]" />

      {/* Crimson curtain: wipes upward at load */}
      {!reduce && (
        <motion.div
          aria-hidden
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
          className="pointer-events-none absolute inset-0 z-30 bg-[#c41212]"
        />
      )}

      <motion.div
        style={reduce ? undefined : { y: stageY, opacity: stageOpacity }}
        className="absolute inset-0"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 1.1, filter: 'blur(16px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.6, ease: EASE, delay: reduce ? 0 : 0.65 }}
          className="absolute inset-0"
        >
          {/* Ink splash (red, then black on top) */}
          <motion.div
            aria-hidden
            style={reduce ? undefined : { x: splashX, y: splashY }}
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={AOT_IMAGES.home}
              alt=""
              className={`absolute left-1/2 top-0 h-auto -translate-x-1/2 scale-[1.07] ${artSize}`}
              style={{ filter: 'url(#aot-ink-red)' }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={AOT_IMAGES.home}
              alt=""
              className={`relative h-auto ${artSize}`}
              style={{ filter: 'url(#aot-ink-black)' }}
            />
          </motion.div>

          {/* Pale mist patches on both sides of the artwork */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[6%] top-[38%] h-[34%] w-[16vw] rounded-full bg-white/80 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-[5%] top-[44%] h-[30%] w-[14vw] rounded-full bg-white/70 blur-3xl"
          />

          {/* The artwork itself — top-aligned so the viewport crops the lower part */}
          <motion.div
            style={reduce ? undefined : { x: artX, y: artY }}
            className="absolute left-1/2 top-0 -translate-x-1/2"
          >
            <motion.div
              animate={reduce ? undefined : { y: [0, -9, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2.4 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={AOT_IMAGES.home}
                alt=""
                className={`hero-collage h-auto select-none ${artSize}`}
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Share pill — like the official portal */}
      <motion.div
        initial={reduce ? false : { opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: reduce ? 0 : 2.2, duration: 0.7, ease: EASE }}
        className="absolute bottom-6 right-0 z-20 flex items-center gap-4 rounded-l-full bg-white/95 py-3 pl-6 pr-5 text-sm text-[#111] shadow-[0_6px_24px_rgba(0,0,0,0.15)]"
      >
        <span>Share</span>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl())}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X дээр хуваалцах"
          className="transition-opacity hover:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <button
          type="button"
          onClick={copyLink}
          aria-label="Холбоос хуулах"
          className="transition-opacity hover:opacity-60"
        >
          {copied ? <Check className="h-4 w-4 text-[#15803d]" /> : <Link2 className="h-4 w-4" />}
        </button>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 2.4, duration: 0.8 }}
        className="pointer-events-none absolute bottom-5 left-6 z-20 flex flex-col items-start gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#111]/55"
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
