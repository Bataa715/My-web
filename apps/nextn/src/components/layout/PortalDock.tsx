'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/', label: 'Home' },
  { href: '/#tools', label: 'Tools' },
];

export default function PortalDock() {
  const pathname = usePathname();
  const [hash, setHash] = useState('');

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/#tools') {
      return pathname.startsWith('/tools') || (pathname === '/' && hash === '#tools');
    }
    return pathname === '/' && hash !== '#tools';
  };

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (pathname !== '/') return;
    if (href === '/') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      setHash('');
      return;
    }
    if (href === '/#tools') {
      event.preventDefault();
      document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', '/#tools');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      setHash('#tools');
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#111] bg-[#f3f1ee] text-[#111]">
      <div className="grid h-14 grid-cols-[1fr_auto_auto] items-center px-4 sm:px-6">
        <Link href="/" className="brand-mark text-sm">
          進撃の巨人
        </Link>
        <nav aria-label="Үндсэн навигац" className="hidden items-center gap-6 sm:flex">
          {items.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={event => handleNavClick(event, item.href)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-[0.18em]',
                  active ? 'text-[#c41212]' : 'text-[#111]/55 hover:text-[#111]'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex h-full w-16 items-center justify-end border-l border-[#111] sm:w-24">
          <span className="flex flex-col gap-1.5" aria-hidden>
            <span className="block h-px w-6 bg-[#111]" />
            <span className="block h-px w-6 bg-[#111]" />
            <span className="block h-px w-6 bg-[#111]" />
          </span>
        </div>
      </div>
    </div>
  );
}
