'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import PageHeader from './PageHeader';
import dynamic from 'next/dynamic';

const InteractiveParticles = dynamic(() => import('./InteractiveParticles'), {
  ssr: false,
});

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
      className="relative min-h-screen"
    >
      {particles && <InteractiveParticles quantity={40} />}

      {/* ── Sticky sub-header: back + breadcrumbs ── */}
      <div className="sticky top-[58px] md:top-[70px] z-40 px-3 md:px-4 pt-2">
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-sm w-full overflow-x-auto hide-scrollbar">
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
