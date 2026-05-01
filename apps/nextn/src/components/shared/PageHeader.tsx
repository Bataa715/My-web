'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center';
  children?: React.ReactNode;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  className,
  align = 'center',
  children,
}: PageHeaderProps) {
  const isCenter = align === 'center';
  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative w-full',
        isCenter ? 'text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary shadow-sm shadow-primary/10',
            isCenter ? 'mx-auto' : ''
          )}
        >
          {icon}
          <span>{eyebrow}</span>
        </motion.div>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'mt-4 text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight gradient-text-animated leading-[1.15] text-balance',
          isCenter ? 'mx-auto max-w-3xl' : ''
        )}
      >
        {title}
      </motion.h1>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'mt-4 text-base md:text-lg text-muted-foreground leading-relaxed text-balance',
            isCenter ? 'mx-auto max-w-2xl' : ''
          )}
        >
          {description}
        </motion.p>
      )}

      {children && <div className="mt-6">{children}</div>}

      {/* Gradient divider */}
      <div
        aria-hidden="true"
        className={cn(
          'mt-7 h-px w-32 bg-linear-to-r from-transparent via-primary/50 to-transparent',
          isCenter ? 'mx-auto' : ''
        )}
      />
    </motion.header>
  );
}

