'use client';

import React, { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export interface Tool {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
  shadowColor: string;
  glow: string;
  accent: string;
  tag: string;
}

export default function ToolCard({
  tool,
  index,
  wide = false,
}: {
  tool: Tool;
  index: number;
  wide?: boolean;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });
  const rotateX = useTransform(sy, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(sx, [-0.5, 0.5], ['-7deg', '7deg']);

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    x.set(px / r.width - 0.5);
    y.set(py / r.height - 0.5);
    setPos({ x: px, y: py });
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (wide) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{
          opacity: { duration: 0.35, delay: index * 0.06 },
          scale: { duration: 0.35, delay: index * 0.06 },
          y: { duration: 0.35, delay: index * 0.06 },
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="h-full"
      >
        <Link
          ref={cardRef}
          href={tool.href}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          className="group relative block h-full select-none"
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="relative h-full will-change-transform"
          >
            <div
              className="relative h-full rounded-2xl bg-card border border-border overflow-hidden flex flex-row items-stretch min-h-[160px] transition-all duration-300 group-hover:border-transparent"
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 24px 60px -20px rgba(${tool.glow}, 0.5), 0 0 0 1px rgba(${tool.glow}, 0.15)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '';
              }}
            >
              {/* Left: gradient icon panel */}
              <div
                className={`relative shrink-0 flex items-center justify-center w-40 sm:w-52 bg-linear-to-br ${tool.gradient} overflow-hidden`}
              >
                {/* Grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                  aria-hidden
                />
                {/* Glow behind icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-white/15 blur-2xl" aria-hidden />
                </div>
                <div
                  className="relative z-10 text-white group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-400"
                  style={{ transform: 'translateZ(40px)' }}
                >
                  {React.isValidElement(tool.icon)
                    ? React.cloneElement(tool.icon as React.ReactElement<{ className?: string }>, { className: 'h-12 w-12' })
                    : tool.icon}
                </div>
                {/* Sheen on hover */}
                <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden />
              </div>

              {/* Cursor spotlight */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(${tool.glow}, 0.10), transparent 55%)`,
                }}
                aria-hidden
              />

              {/* Ambient orb */}
              <div
                className={`absolute -top-16 -right-16 w-48 h-48 bg-linear-to-br ${tool.gradient} rounded-full opacity-10 blur-3xl group-hover:opacity-22 transition-opacity duration-500`}
                aria-hidden
              />

              {/* Surface tint */}
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, transparent 40%)' }}
                aria-hidden
              />

              {/* Right: content */}
              <div
                className="relative z-10 flex flex-col justify-between flex-1 px-6 py-5"
                style={{ transform: 'translateZ(20px)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold tracking-tight text-foreground leading-snug">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-[10px] tracking-widest uppercase font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm"
                    style={{
                      borderColor: `rgba(${tool.glow}, 0.3)`,
                      color: tool.accent,
                      background: `rgba(${tool.glow}, 0.08)`,
                    }}
                  >
                    {tool.tag}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <span
                    className="h-[2px] rounded-full transition-all duration-300 w-6 group-hover:w-14"
                    style={{ background: tool.accent }}
                    aria-hidden
                  />
                  <span
                    className="text-xs font-semibold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-250"
                    style={{ color: tool.accent }}
                  >
                    Нээх
                  </span>
                  <span
                    className="ml-auto flex items-center justify-center h-8 w-8 rounded-full border transition-all duration-300 group-hover:scale-110 group-hover:rotate-45"
                    style={{
                      borderColor: `rgba(${tool.glow}, 0.35)`,
                      background: `rgba(${tool.glow}, 0.08)`,
                      color: tool.accent,
                    }}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.88, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -8 }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3, delay: index * 0.05 },
        scale: { duration: 0.3, delay: index * 0.05 },
        y: { duration: 0.3, delay: index * 0.05 },
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Link
        ref={cardRef}
        href={tool.href}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="group relative block h-full select-none"
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="relative h-full will-change-transform"
        >
          <div
            className="relative h-full rounded-2xl bg-card border border-border overflow-hidden flex flex-col min-h-[230px] transition-all duration-300 group-hover:border-transparent group-hover:shadow-2xl"
            style={{ boxShadow: `0 0 0 0 transparent` }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 48px -16px rgba(${tool.glow}, 0.55), 0 0 0 1px rgba(${tool.glow}, 0.15)`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 transparent`;
            }}
          >
            {/* Ambient orb */}
            <div
              className={`absolute -top-24 -right-24 w-52 h-52 bg-linear-to-br ${tool.gradient} rounded-full opacity-15 blur-3xl group-hover:opacity-35 transition-opacity duration-500`}
              aria-hidden
            />
            {/* Second subtle orb bottom-left */}
            <div
              className={`absolute -bottom-16 -left-16 w-36 h-36 bg-linear-to-br ${tool.gradient} rounded-full opacity-8 blur-2xl group-hover:opacity-20 transition-opacity duration-700`}
              aria-hidden
            />

            {/* Cursor spotlight */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(320px circle at ${pos.x}px ${pos.y}px, rgba(${tool.glow}, 0.14), transparent 55%)`,
              }}
              aria-hidden
            />

            {/* Surface tint highlight */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, transparent 40%)',
              }}
              aria-hidden
            />

            {/* Top row: icon + tag */}
            <div
              className="relative z-10 flex items-start justify-between p-5 pb-3"
              style={{ transform: 'translateZ(30px)' }}
            >
              <div
                className={`p-3.5 rounded-2xl bg-linear-to-br ${tool.gradient} text-white shadow-lg ring-1 ring-white/20 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}
              >
                {tool.icon}
              </div>

              <span
                className="text-[10px] tracking-widest uppercase font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm"
                style={{
                  borderColor: `rgba(${tool.glow}, 0.3)`,
                  color: tool.accent,
                  background: `rgba(${tool.glow}, 0.08)`,
                }}
              >
                {tool.tag}
              </span>
            </div>

            {/* Bottom row: title + description + CTA */}
            <div
              className="relative z-10 px-5 pb-5 mt-auto flex flex-col gap-1.5"
              style={{ transform: 'translateZ(20px)' }}
            >
              <h3 className="text-lg font-bold tracking-tight text-foreground leading-snug text-balance">
                {tool.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {tool.description}
              </p>

              <div className="mt-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-[2px] rounded-full transition-all duration-300 ease-out w-5 group-hover:w-12"
                    style={{ background: tool.accent }}
                    aria-hidden
                  />
                  <span
                    className="text-xs font-semibold opacity-0 group-hover:opacity-100 translate-x-[-6px] group-hover:translate-x-0 transition-all duration-250"
                    style={{ color: tool.accent }}
                  >
                    Нээх
                  </span>
                </div>
                <span
                  className="flex items-center justify-center h-8 w-8 rounded-full border transition-all duration-300 group-hover:scale-110 group-hover:rotate-45"
                  style={{
                    borderColor: `rgba(${tool.glow}, 0.35)`,
                    background: `rgba(${tool.glow}, 0.08)`,
                    color: tool.accent,
                  }}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
