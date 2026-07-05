'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import PageHeader from './PageHeader';

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface ToolPageShellProps {
  /** Page title shown in the PageHeader */
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  /** Breadcrumb trail shown after the back button, e.g. [{label:'Хэрэгслүүд',href:'/tools'}, {label:'Англи хэл'}] */
  breadcrumbs?: Breadcrumb[];
  headerAlign?: 'left' | 'center';
  /** Show interactive particles background (default: true) */
  particles?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function ToolPageShell({
  title,
  description,
  eyebrow,
  icon,
  breadcrumbs = [],
  headerAlign = 'center',
  particles = true,
  className,
  children,
}: ToolPageShellProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-screen aurora-sweep"
    >
      {/* The global 3D starfield shows through; aurora adds atmosphere.
          A faint nebula tint anchors the header area. */}
      {particles && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10"
          style={{
            background:
              'radial-gradient(ellipse 60% 55% at 50% 0%, hsl(var(--primary)/0.10) 0%, hsl(var(--accent)/0.05) 45%, transparent 75%)',
          }}
        />
      )}

      {/* ── Sub-header: back + breadcrumbs — scrolls away with the page
            (was sticky and covered content; now inline + width-fit) ── */}
      <div className="relative z-20 px-3 md:px-4 pt-2">
        <div className="inline-flex max-w-full items-center gap-1.5 px-2 py-1.5 rounded-full border border-border/50 bg-card/40 backdrop-blur-xl shadow-sm overflow-x-auto hide-scrollbar">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 shrink-0"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Буцах</span>
          </button>

          {/* Breadcrumb trail */}
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5 shrink-0">
              <span className="text-border/70 select-none">›</span>
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5 rounded-md hover:bg-muted/50"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-foreground px-1">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className={cn('relative z-10 px-4 md:px-6 pb-28 sm:pb-20', className)}>
        <div className="pt-10 pb-2">
          <PageHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            icon={icon}
            align={headerAlign}
          />
        </div>
        {children}
      </div>
    </motion.div>
  );
}
