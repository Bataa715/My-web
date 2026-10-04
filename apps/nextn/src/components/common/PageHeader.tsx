'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  icon?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center';
  children?: React.ReactNode;
}

export default function PageHeader({
  eyebrow,
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

