'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface SubToolCardProps {
  title: string;
  description: string;
  href: string;
  accent?: string;
  glow?: string;
  index?: number;
  tag?: string;
}

export default function SubToolCard({
  title,
  description,
  href,
  tag = 'Tool',
}: SubToolCardProps) {
  return (
    <Link href={href} className="group flex items-center gap-4 py-6 sm:gap-8">
      <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c41212]">
        {tag}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg">{title}</span>
        <span className="block text-xs text-[#111]/50">{description}</span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
