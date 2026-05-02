'use client';

import Link from 'next/link';

interface AuthShellProps {
  title: string;
  subtitle: string;
  switchLabel: string;
  switchHref: string;
  switchCta: string;
  children: React.ReactNode;
}

export default function AuthShell({
  title,
  subtitle,
  switchLabel,
  switchHref,
  switchCta,
  children,
}: AuthShellProps) {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center relative overflow-hidden p-4">
      {/* Card */}
      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-2xl bg-linear-to-br from-primary to-purple-600 shadow-lg shadow-primary/30" />
          <span className="text-base font-bold tracking-tight gradient-text-animated">
            PersonalWeb
          </span>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl px-7 py-8 shadow-2xl shadow-black/10">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {/* Form */}
          {children}

          {/* Switch */}
          <div className="mt-6 pt-5 border-t border-border/30 text-center text-sm text-muted-foreground">
            {switchLabel}{' '}
            <Link
              href={switchHref}
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {switchCta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

