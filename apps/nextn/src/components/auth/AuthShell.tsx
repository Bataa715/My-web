'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthShellProps {
  /** Heading shown in the form pane */
  title: string;
  /** Sub-heading below the title */
  subtitle: string;
  /** Brand badge / mark displayed in the showcase */
  showcaseEyebrow?: string;
  /** Big tagline shown in the brand showcase pane (left side on desktop) */
  showcaseTitle: string;
  /** Supporting copy under the showcase title */
  showcaseDescription: string;
  /** Bullet points highlighted on the showcase pane */
  showcaseBullets?: string[];
  /** Bottom auth-switch link, e.g. "Don't have an account? Sign up" */
  switchLabel: string;
  switchHref: string;
  switchCta: string;
  children: React.ReactNode;
}

export default function AuthShell({
  title,
  subtitle,
  showcaseEyebrow = 'PersonalWeb',
  showcaseTitle,
  showcaseDescription,
  showcaseBullets = [],
  switchLabel,
  switchHref,
  switchCta,
  children,
}: AuthShellProps) {
  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden flex">
      {/* Ambient background — pure CSS, GPU friendly */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-[120px] animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-32 w-[32rem] h-[32rem] rounded-full bg-purple-500/15 blur-[140px] animate-pulse-slow" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-cyan-500/8 blur-[160px]" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07] dot-grid" />
      </div>

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-5 left-5 md:top-7 md:left-7 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground border border-border/40 bg-background/40 backdrop-blur-md transition-all hover:border-primary/40 hover:bg-primary/8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Нүүр
      </Link>

      {/* ─── Showcase pane ──────────────────────────── */}
      <aside className="hidden lg:flex relative w-1/2 xl:w-[55%] flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Decorative animated gradient blob */}
        <div
          className="absolute -top-1/4 -right-1/4 w-[42rem] h-[42rem] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              'conic-gradient(from 0deg, hsl(var(--primary)/0.4), transparent, hsl(280 70% 60% / 0.4), transparent, hsl(var(--primary)/0.4))',
            animation: 'orbit-spin 30s linear infinite',
          }}
          aria-hidden
        />

        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 inline-flex items-center gap-2.5"
        >
          <div className="relative h-10 w-10 rounded-xl bg-linear-to-br from-primary to-purple-600 grid place-items-center shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight gradient-text-animated">
            {showcaseEyebrow}
          </span>
        </motion.div>

        {/* Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-xl space-y-6"
        >
          <h2 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold tracking-tight leading-[1.1] text-balance">
            {showcaseTitle}
          </h2>
          <p className="text-base xl:text-lg text-muted-foreground leading-relaxed text-balance">
            {showcaseDescription}
          </p>

          {showcaseBullets.length > 0 && (
            <ul className="space-y-3 pt-2">
              {showcaseBullets.map((bullet, i) => (
                <motion.li
                  key={bullet}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.07 }}
                  className="flex items-start gap-3 text-sm text-foreground/85"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] shrink-0" />
                  <span>{bullet}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 text-xs text-muted-foreground/70"
        >
          © {new Date().getFullYear()} PersonalWeb · Бүх эрх хуулиар хамгаалагдсан.
        </motion.p>
      </aside>

      {/* ─── Form pane ─────────────────────────────── */}
      <section className="flex-1 flex items-center justify-center p-5 sm:p-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile brand mark */}
          <Link
            href="/"
            className="lg:hidden mx-auto mb-6 flex items-center justify-center gap-2 group"
          >
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary to-purple-600 grid place-items-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight gradient-text-animated">
              PersonalWeb
            </span>
          </Link>

          <div
            className={cn(
              'relative rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl p-7 sm:p-9 shadow-2xl shadow-primary/5',
              'before:content-[""] before:absolute before:inset-0 before:rounded-3xl before:bg-linear-to-b before:from-white/5 before:to-transparent before:pointer-events-none'
            )}
          >
            {/* Header */}
            <header className="text-center mb-7">
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
                className="text-2xl sm:text-3xl font-bold tracking-tight gradient-text-animated"
              >
                {title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.45 }}
                className="mt-2 text-sm text-muted-foreground"
              >
                {subtitle}
              </motion.p>
            </header>

            {/* Form */}
            <div className="relative">{children}</div>

            {/* Switch */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-7 pt-5 border-t border-border/40 text-center text-sm text-muted-foreground"
            >
              {switchLabel}{' '}
              <Link
                href={switchHref}
                className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
              >
                {switchCta}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
