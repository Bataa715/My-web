'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface ToolPageShellProps {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  headerAlign?: 'left' | 'center';
  particles?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function ToolPageShell({
  title,
  description,
  breadcrumbs = [],
  className,
  children,
}: ToolPageShellProps) {
  return (
    <div className="portal-page relative min-h-screen bg-[#f3f1ee] pb-24 text-[#111]">
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="px-4 pt-6 sm:px-8">
          <ol className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#111]/45">
            {breadcrumbs.map((crumb, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#c41212]">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-[#c41212]">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="px-4 pt-8 sm:px-8">
        <h1 className="portal-title portal-title--sm">{title}</h1>
        {description && (
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-[#111]/50">
            {description}
          </p>
        )}
      </div>

      <div className={cn('mx-auto max-w-5xl px-4 pt-12 sm:px-8', className)}>
        {children}
      </div>
    </div>
  );
}
