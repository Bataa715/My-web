'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export interface SubToolCardProps {
  title: string;
  description: string;
  href: string;
  /** Hex color used as the card's accent (border, title gradient, arrow). */
  accent: string;
  /** Comma-separated RGB triplet matching `accent`, e.g. "59, 130, 246". */
  glow: string;
  index?: number;
}

/**
 * Compact "tool" card matching the big carousel card design on /tools:
 *  - no icon
 *  - bold gradient title
 *  - colored gradient border ring
 *  - accent glow blob + subtle grid pattern
 *  - animated open arrow
 */
export default function SubToolCard({
  title,
  description,
  href,
  accent,
  glow,
  index = 0,
}: SubToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        type: 'spring',
        stiffness: 110,
      }}
    >
      <Link href={href} className="block group h-full">
        <div
          className="relative h-full rounded-2xl p-[2px] transition-all duration-500 group-hover:p-[3px]"
          style={{
            background: `linear-gradient(135deg, ${accent}, rgba(${glow}, 0.25) 45%, transparent 70%, ${accent})`,
            boxShadow: `0 14px 36px -22px rgba(${glow}, 0.45)`,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 24px 56px -20px rgba(${glow}, 0.7), 0 0 0 1px rgba(${glow}, 0.35)`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 14px 36px -22px rgba(${glow}, 0.45)`;
          }}
        >
          <div className="relative h-full rounded-[14px] bg-card overflow-hidden">
            {/* Tinted top wash */}
            <div
              className="absolute inset-x-0 top-0 h-32 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at top, rgba(${glow}, 0.18), transparent 70%)`,
              }}
              aria-hidden
            />
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                color: accent,
              }}
              aria-hidden
            />
            {/* Glow blob */}
            <div
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-30 transition-opacity duration-500 group-hover:opacity-60 pointer-events-none"
              style={{ background: accent }}
              aria-hidden
            />

            <div className="relative p-6 min-h-[180px] flex flex-col justify-between">
              {/* Pulse dot */}
              <div className="flex justify-end">
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                    style={{ background: accent }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{
                      background: accent,
                      boxShadow: `0 0 10px ${accent}`,
                    }}
                  />
                </span>
              </div>

              <div className="mt-2">
                <h3
                  className="text-2xl font-extrabold tracking-tight leading-tight"
                  style={{
                    background: `linear-gradient(135deg, hsl(var(--foreground)), ${accent})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-5">
                <span
                  className="h-[2px] rounded-full transition-all duration-500"
                  style={{
                    background: `linear-gradient(90deg, ${accent}, transparent)`,
                    width: '24px',
                  }}
                  aria-hidden
                />
                <span
                  className="text-xs font-bold tracking-wide transition-all duration-300 group-hover:tracking-widest"
                  style={{ color: accent }}
                >
                  Эхлэх
                </span>
                <span
                  className="ml-auto h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:translate-x-1"
                  style={{
                    borderColor: `rgba(${glow}, 0.5)`,
                    background: `rgba(${glow}, 0.1)`,
                    color: accent,
                  }}
                >
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
